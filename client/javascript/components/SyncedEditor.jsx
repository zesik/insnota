import React from 'react';
import EditorOverlay from './EditorOverlay';
import EditorStatusBar from './EditorStatusBar';
import CodeMirror from 'codemirror';
import ShareDB from 'sharedb/lib/client';

import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/javascript/javascript';

export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED';
export const CONNECTION_CONNECTING = 'CONNECTION_CONNECTING';
export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED';
export const CONNECTION_WAITING = 'CONNECTION_WAITING';

export const DOC_INITIAL = 'DOC_INITIAL';
export const DOC_OPENING = 'DOC_OPENING';
export const DOC_FAILED = 'DOC_FAILED';
export const DOC_SYNCING = 'DOC_SYNCING';
export const DOC_SYNCED = 'DOC_SYNCED';

const MAX_BACKOFF_TIME_PARAMETER = 6;

const DEFAULT_DOCUMENT = {
  t: '',
  c: ''
};

const LANGUAGE_MODES = [
  { name: 'Plain Text', mimeType: 'text/plain' },
  { name: 'Markdown', mimeType: 'text/x-gfm' },
  { name: 'JavaScript', mimeType: 'text/javascript' }
];

class SyncedEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleConnectionStateChanged = this.handleConnectionStateChanged.bind(this);
    this.handleTitleKeyUp = this.handleTitleKeyUp.bind(this);
    this.handleContentChanged = this.handleContentChanged.bind(this);
    this.handleContentCursorActivity = this.handleContentCursorActivity.bind(this);
    this.onLanguageModeChanged = this.onLanguageModeChanged.bind(this);
    // this.handleFocusChanged is not bound here, but in componentDidMount
    this.state = {
      connectionState: CONNECTION_DISCONNECTED,
      connectionRetries: 0,
      connectionWaitSeconds: 0,
      documentState: DOC_INITIAL,
      documentReadOnly: false,
      documentCursors: [],
      documentShowCursorChars: false,
      documentLanguageMode: '',
      documentLanguageModeList: LANGUAGE_MODES
    };
  }

  componentDidMount() {
    this.codeMirror = CodeMirror.fromTextArea(this.refs.textarea, {
      lineNumbers: true,
      showCursorWhenSelecting: true,
      readOnly: 'nocursor',
      indentUnit: 4,
      tabSize: 4,
      extraKeys: {
        Tab: (cm) => {
          if (cm.somethingSelected() || cm.getOption('indentWithTabs')) {
            return CodeMirror.Pass;
          }
          cm.execCommand('insertSoftTab');
          return false;
        }
      }
    });
    this.codeMirror.on('change', this.handleContentChanged);
    this.codeMirror.on('cursorActivity', this.handleContentCursorActivity);
    this.codeMirror.on('focus', this.handleFocusChanged.bind(this, true));
    this.codeMirror.on('blur', this.handleFocusChanged.bind(this, false));
    this.shareDBConnection = new ShareDB.Connection(this.initiateWebSocketConnection());
    this.shareDBConnection.on('state', this.handleConnectionStateChanged);
    this.shareDBDoc = null;
    this.remoteUpdating = false;
    this.subscribeDocument(this.props.documentID);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.collection !== this.props.collection || nextProps.documentID !== this.props.documentID) {
      this.subscribeDocument(nextProps.collection, nextProps.documentID);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    switch (nextState.documentState) {
      case DOC_SYNCED:
      case DOC_SYNCING:
        this.refs.title.disabled = false;
        this.refs.title.readOnly = nextState.documentReadOnly;
        this.codeMirror.setOption('readOnly', nextState.documentReadOnly);
        break;
      default:
        this.refs.title.disabled = true;
        this.codeMirror.setOption('readOnly', 'nocursor');
        break;
    }
    this.codeMirror.setOption('mode', nextState.documentLanguageMode);
  }

  componentWillUnmount() {
    if (this.codeMirror) {
      this.codeMirror.off('change');
      this.codeMirror.off('cursorActivity');
      this.codeMirror.off('focus');
      this.codeMirror.off('blur');
      this.codeMirror.toTextArea();
    }
    if (this.shareDBDoc) {
      this.shareDBDoc.off('op');
      this.shareDBDoc.off('nothing pending');
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    if (this.shareDBConnection) {
      this.shareDBConnection.off('state');
      this.shareDBConnection.close();
      this.shareDBConnection = null;
    }
  }

  onLanguageModeChanged(languageMode) {
    this.setState({ documentLanguageMode: languageMode });
  }

  getColumnIndex(cm, ln, ch, tabSize) {
    const line = cm.lineInfo(ln).text;
    let col = 0;
    for (let i = 0; i < ch; ++i) {
      if (line[i] === '\t') {
        col += tabSize;
      } else {
        col += 1;
      }
    }
    return col;
  }

  getReconnectWaitTime(retryCount) {
    return [Math.pow(2, Math.min(retryCount, MAX_BACKOFF_TIME_PARAMETER)), Math.floor(Math.random() * 1000)];
  }

  initiateWebSocketConnection() {
    return new WebSocket(this.props.socketURL);
  }

  handleConnectionStateChanged(newState) {
    switch (newState) {
      case 'connected':
        this.setState({
          connectionState: CONNECTION_CONNECTED,
          connectionRetries: 0,
          connectionWaitSeconds: 0
        });
        break;
      case 'connecting':
        this.setState({
          connectionState: CONNECTION_CONNECTING
        });
        break;
      default:
        this.prepareReconnection();
        break;
    }
  }

  handleContentChanged(cm, change) {
    // Event is not raised if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    // Do not submit remote changes again to the server
    this.raiseContentChanged(cm.getValue(), this.remoteUpdating);
    if (this.remoteUpdating) {
      return;
    }

    // Submit changes to remote server
    this.setState({ documentState: DOC_SYNCING });
    this.submitDocumentChange(cm, change);
  }

  handleContentCursorActivity(cm) {
    const selections = cm.listSelections();
    const selectedStrings = cm.getSelections();
    const tabSize = cm.getOption('tabSize');
    if (selections.length !== selectedStrings.length) {
      console.error('Unexpected selection length.');
    }
    const cursors = [];
    for (let i = 0; i < selections.length; ++i) {
      cursors.push({
        anchor: {
          ln: selections[i].anchor.line + 1,
          col: this.getColumnIndex(cm, selections[i].anchor.line, selections[i].anchor.ch, tabSize) + 1,
          ch: selections[i].anchor.ch + 1
        },
        head: {
          ln: selections[i].head.line + 1,
          col: this.getColumnIndex(cm, selections[i].head.line, selections[i].head.ch, tabSize) + 1,
          ch: selections[i].head.ch + 1
        },
        length: selectedStrings[i].length
      });
    }
    this.setState({ documentCursors: cursors });
  }

  handleFocusChanged(focus) {
  }

  handleTitleKeyUp(event) {
    // Event is not raised if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    const titleTextBox = event.target;
    if (event.key === 'Escape') {
      // Cancelled, revert to original title
      titleTextBox.blur();
      titleTextBox.value = this.shareDBDoc.data.t;
    } else if (event.key === 'Enter') {
      // Confirmed, submit changes
      titleTextBox.blur();
      this.raiseTitleChanged(titleTextBox.value, false);
      this.setState({ documentState: DOC_SYNCING });
      this.submitTitleChange(titleTextBox.value);
    } else {
      return;
    }

    event.preventDefault();
  }

  raiseContentChanged(content, remote) {
    if (this.props.onContentChanged) {
      process.nextTick(() => this.props.onContentChanged(content, remote));
    }
  }

  raiseTitleChanged(title, remote) {
    if (this.props.onTitleChanged) {
      process.nextTick(() => this.props.onTitleChanged(title, remote));
    }
  }

  prepareReconnection() {
    // Ignore if we are already waiting for reconnecting
    if (this.reconnectTimer) {
      return;
    }

    // Get reconnecting wait time
    const seconds = this.getReconnectWaitTime(this.state.connectionRetries);
    const expire = new Date();
    expire.setSeconds(expire.getSeconds() + seconds[0]);
    expire.setMilliseconds(expire.getMilliseconds() + seconds[1]);
    this.setState({
      connectionState: CONNECTION_WAITING,
      connectionRetries: this.state.connectionRetries + 1,
      connectionWaitSeconds: Math.ceil(seconds[0] + seconds[1] / 1000)
    });

    // Set up timer for reconnecting
    this.reconnectTimer = window.setInterval(() => {
      const difference = (expire - (new Date())) / 1000;
      if (difference > 0) {
        this.setState({
          connectionWaitSeconds: Math.ceil(difference)
        });
        return;
      }

      // Stop timer
      window.clearInterval(this.reconnectTimer);
      this.reconnectTimer = 0;

      // Start reconnecting
      this.setState({ connectionState: CONNECTION_CONNECTING });
      this.shareDBConnection.bindToSocket(this.initiateWebSocketConnection());
    }, 100);
  }

  submitDocumentChange(cm, change) {
    const startPos = cm.indexFromPos(change.from);
    if (change.to.line !== change.from.line || change.to.ch !== change.from.ch) {
      this.shareDBDoc.submitOp([{ p: ['c', startPos], sd: change.removed.join('\n') }], true);
    }
    if (change.text) {
      this.shareDBDoc.submitOp([{ p: ['c', startPos], si: change.text.join('\n') }], true);
    }
    if (change.next) {
      this.submitDocumentChange(cm, change.next);
    }
  }

  submitTitleChange(title) {
    this.shareDBDoc.submitOp([{ p: ['t'], od: this.shareDBDoc.data.t, oi: title }], true);
  }

  subscribeDocument(collection, documentID) {
    if (this.shareDBDoc) {
      this.shareDBDoc.off('op');
      this.shareDBDoc.off('nothing pending');
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    this.setState({ documentState: DOC_INITIAL });
    if (collection && documentID) {
      this.setState({ documentState: DOC_OPENING });
      const doc = this.shareDBConnection.get(collection, documentID);
      doc.subscribe(error => {
        // Unable to subscribe to the document
        if (error) {
          console.error('Failed to subscribe', error);
          this.setState({ documentState: DOC_FAILED });
          return;
        }

        // Create the document or read document from server
        let title = this.props.defaultTitle;
        let content = this.props.defaultContent;
        let mimeType = this.props.defaultMimeType;
        if (doc.type) {
          title = doc.data.t;
          content = doc.data.c;
          mimeType = doc.data.m;
        } else {
          doc.create(Object.assign({}, DEFAULT_DOCUMENT, {
            t: title,
            c: content,
            m: mimeType
          }));
        }

        // The first initialization of document is considered as remote updating event
        this.shareDBDoc = doc;
        this.remoteUpdating = true;
        this.refs.title.value = title;
        // Manually trigger title change event
        this.raiseTitleChanged(title, true);
        this.codeMirror.setValue(content);
        this.setState({ documentLanguageMode: mimeType });
        this.remoteUpdating = false;

        // Document is populated
        this.setState({ documentState: DOC_SYNCED });
        this.codeMirror.focus();
        this.handleContentCursorActivity(this.codeMirror);

        // Handle document updating event
        doc.on('op', (operationList, local) => {
          if (local) {
            return;
          }
          this.remoteUpdating = true;
          for (let i = 0; i < operationList.length; ++i) {
            const operation = operationList[i];
            if (operation.p[0] === 't') {
              this.refs.title.value = operation.oi;
              this.raiseTitleChanged(this.refs.title.value, true);
            } else {
              if (typeof operation.sd === 'undefined') {
                // An insertion
                this.codeMirror.replaceRange(operation.si, this.codeMirror.posFromIndex(operation.p[1]));
              } else {
                // A removal
                const from = this.codeMirror.posFromIndex(operation.p[1]);
                const to = this.codeMirror.posFromIndex(operation.p[1] + operation.sd.length);
                this.codeMirror.replaceRange('', from, to);
              }
            }
          }
          this.remoteUpdating = false;
        });
        doc.on('nothing pending', () => this.setState({ documentState: DOC_SYNCED }));
      });
    }
  }

  render() {
    return (
      <div className="editor-container">
        <EditorOverlay state={this.state.documentState} />
        <input ref="title" type="text" className="document-title" onKeyUp={this.handleTitleKeyUp} />
        <textarea ref="textarea" />
        <EditorStatusBar
          connectionState={this.state.connectionState}
          connectionRetries={this.state.connectionRetries}
          connectionWaitSeconds={this.state.connectionWaitSeconds}
          documentState={this.state.documentState}
          cursors={this.state.documentCursors}
          showCursorChars={this.state.documentShowCursorChars}
          languageModeList={this.state.documentLanguageModeList}
          languageMode={this.state.documentLanguageMode}
          onLanguageModeChanged={this.onLanguageModeChanged}
        />
      </div>
    );
  }
}

SyncedEditor.propTypes = {
  socketURL: React.PropTypes.string.isRequired,
  collection: React.PropTypes.string,
  documentID: React.PropTypes.string,
  defaultTitle: React.PropTypes.string,
  defaultContent: React.PropTypes.string,
  defaultMimeType: React.PropTypes.string,
  onTitleChanged: React.PropTypes.func,
  onContentChanged: React.PropTypes.func,
  onCursorActivity: React.PropTypes.func
};

export default SyncedEditor;
