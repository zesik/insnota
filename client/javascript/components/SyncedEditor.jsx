import React from 'react';
import EditorOverlay from './EditorOverlay';
import EditorStatusBar from './EditorStatusBar';
import Collaborators from './Collaborators';
import CodeMirror from 'codemirror';
import ShareDB from 'sharedb/lib/client';
import { LANGUAGE_MODES } from '../utils/editorLanguageModes';

export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED';
export const CONNECTION_CONNECTING = 'CONNECTION_CONNECTING';
export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED';
export const CONNECTION_WAITING = 'CONNECTION_WAITING';

export const DOC_INITIAL = 'DOC_INITIAL';
export const DOC_OPENING = 'DOC_OPENING';
export const DOC_FAILED = 'DOC_FAILED';
export const DOC_SYNCING = 'DOC_SYNCING';
export const DOC_SYNCED = 'DOC_SYNCED';

export const REMOTE_LOCAL = 0;
export const REMOTE_REMOTE = 1;
export const REMOTE_INIT = 2;
export const REMOTE_RESYNC = 3;

const MAX_BACKOFF_TIME_PARAMETER = 6;

const COLLABORATOR_COLORS = [
  '0097a7:ffffff',  // Cyan 700
  'e91e63:ffffff',  // Pink 500
  'ef6c00:ffffff',  // Orange 800
  '3f51b5:ffffff',  // Indigo 500
  '4caf50:ffffff',  // Green 600
  '2196f3:ffffff',  // Blue 500
  '673ab7:ffffff',  // Deep Purple 500
  '795548:ffffff',  // Brown 500
  '827717:ffffff',  // Lime 900
  '607d8b:ffffff'   // Blue Gray 500
];
let colorIndex = 0;
function getNextColor() {
  const color = COLLABORATOR_COLORS[colorIndex];
  colorIndex = (colorIndex + 1) % COLLABORATOR_COLORS.length;
  return color;
}

class SyncedEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleConnectionStateChanged = this.handleConnectionStateChanged.bind(this);
    this.handleContentChanged = this.handleContentChanged.bind(this);
    this.handleContentCursorActivity = this.handleContentCursorActivity.bind(this);
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
    this.handleTitleKeyUp = this.handleTitleKeyUp.bind(this);
    this.handleTitleBoxBlur = this.handleTitleBoxBlur.bind(this);
    this.handleEditorGotFocus = this.handleFocusChanged.bind(this, true);
    this.handleEditorLostFocus = this.handleFocusChanged.bind(this, false);
    this.handleShareDBDocError = this.handleShareDBDocError.bind(this);
    this.handleShareDBDocOperation = this.handleShareDBDocOperation.bind(this);
    this.handleShareDBDocNothingPending = this.handleShareDBDocNothingPending.bind(this);
    this.state = {
      connectionState: CONNECTION_DISCONNECTED,
      connectionRetries: 0,
      connectionWaitSeconds: 0,
      documentState: DOC_INITIAL,
      documentReadOnly: false,
      documentCursors: [],
      documentShowCursorChars: false,
      documentLanguageMode: '',
      documentLanguageModeList: LANGUAGE_MODES,
      documentCollaborators: []
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
    this.codeMirror.on('changes', this.handleContentChanged);
    this.codeMirror.on('cursorActivity', this.handleContentCursorActivity);
    this.codeMirror.on('focus', this.handleEditorGotFocus);
    this.codeMirror.on('blur', this.handleEditorLostFocus);
    this.myClientID = null;
    this.collaboratorColors = {};
    this.cursorElements = [];
    this.shareDBConnection = new ShareDB.Connection(this.initiateWebSocketConnection());
    this.shareDBConnection.on('state', this.handleConnectionStateChanged);
    this.shareDBDoc = null;
    this.remoteUpdating = REMOTE_LOCAL;
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
    this.cursorElements.forEach(e => e.clear());
    nextState.documentCollaborators.forEach(c => {
      if (!c.cursors) {
        return;
      }
      const colors = c.color.split(':');
      const cursorContainer = this.codeMirror.getWrapperElement().ownerDocument.createElement('div');
      cursorContainer.className = 'collaborator-cursor-container';
      const cursorElement = this.codeMirror.getWrapperElement().ownerDocument.createElement('div');
      cursorElement.className = 'collaborator-cursor';
      cursorElement.style.backgroundColor = `#${colors[0]}`;
      cursorContainer.appendChild(cursorElement);
      const idElement = this.codeMirror.getWrapperElement().ownerDocument.createElement('div');
      idElement.className = 'collaborator-identity';
      idElement.innerText = c.name || '(Anonymous)';
      idElement.style.backgroundColor = `#${colors[0]}`;
      idElement.style.color = `#${colors[1]}`;
      cursorContainer.appendChild(idElement);
      this.cursorElements.push(this.codeMirror.setBookmark(
        CodeMirror.Pos(c.cursors[0].head.ln - 1, c.cursors[0].head.ch - 1),
        { widget: cursorContainer }
      ));
    });
  }

  componentWillUnmount() {
    if (this.codeMirror) {
      this.codeMirror.off('changes', this.handleContentChanged);
      this.codeMirror.off('cursorActivity', this.handleContentCursorActivity);
      this.codeMirror.off('focus', this.handleEditorGotFocus);
      this.codeMirror.off('blur', this.handleEditorLostFocus);
      this.codeMirror.toTextArea();
    }
    if (this.shareDBDoc) {
      this.shareDBDoc.removeListener('op', this.handleShareDBDocOperation);
      this.shareDBDoc.removeListener('error', this.handleShareDBDocError);
      this.shareDBDoc.removeListener('nothing pending', this.handleShareDBDocNothingPending);
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    if (this.shareDBConnection) {
      this.shareDBConnection.off('state', this.handleConnectionStateChanged);
      this.shareDBConnection.close();
      this.shareDBConnection = null;
    }
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

  getCursors(cm) {
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
    return cursors;
  }

  getIndexFromPos(pos) {
    if (pos.line < 0 || pos.ch < 0) {
      return 0;
    }
    const doc = this.shareDBDoc.data.c.split('\n');
    const last = doc.length - 1;
    if (pos.line > last) {
      pos = { line: last, ch: doc[last].length };
    }
    let index = pos.ch;
    for (let i = 0; i < pos.line; ++i) {
      index += doc[i].length + 1;
    }
    return index;
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
        this.myClientID = this.shareDBConnection.id;
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
        this.myClientID = null;
        this.prepareReconnection();
        break;
    }
  }

  handleContentChanged(cm, changes) {
    // Event is not raised if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    // Do not submit remote changes again to the server
    this.raiseContentChanged(cm.getValue(), this.remoteUpdating);
    if (this.remoteUpdating !== REMOTE_LOCAL) {
      return;
    }

    // Submit changes to remote server
    this.setState({ documentState: DOC_SYNCING });
    for (let i = 0; i < changes.length; ++i) {
      this.submitDocumentChange(cm, changes[i]);
    }
    this.verifyDocumentContent();
  }

  handleContentCursorActivity(cm) {
    const cursors = this.getCursors(cm);
    this.submitCursorChange(cursors);
    this.setState({ documentCursors: cursors });
  }

  handleFocusChanged(focus) {
  }

  handleLanguageModeChanged(languageMode) {
    this.setState({ documentLanguageMode: languageMode });

    // Event is not raised if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    this.raiseLanguageModeChanged(languageMode, this.remoteUpdating);
    if (this.remoteUpdating !== REMOTE_LOCAL) {
      return;
    }

    this.setState({ documentState: DOC_SYNCING });
    this.submitLanguageModeChange(languageMode);
  }

  handleTitleBoxBlur(event) {
    // Event is not raised if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    const titleTextBox = event.target;
    if (titleTextBox.value !== this.shareDBDoc.data.t) {
      this.raiseTitleChanged(titleTextBox.value, this.remoteUpdating);
      this.setState({ documentState: DOC_SYNCING });
      this.submitTitleChange(titleTextBox.value);
    }
  }

  handleTitleKeyUp(event) {
    // Event is not handled if not subscribing to remote document
    if (!this.shareDBDoc) {
      return;
    }

    const titleTextBox = event.target;
    if (event.key === 'Escape') {
      // Cancelled, revert to original title
      titleTextBox.value = this.shareDBDoc.data.t;
      titleTextBox.blur();
    } else if (event.key === 'Enter') {
      titleTextBox.blur();
    } else {
      return;
    }
    event.preventDefault();
  }

  handleShareDBDocOperation(operationList, local) {
    if (local) {
      return;
    }
    this.remoteUpdating = REMOTE_REMOTE;
    for (let i = 0; i < operationList.length; ++i) {
      const operation = operationList[i];
      switch (operation.p[0]) {
        case 't': // Title
          this.refs.title.value = operation.oi;
          this.raiseTitleChanged(this.refs.title.value, this.remoteUpdating);
          break;
        case 'c': // Content
          if (typeof operation.sd === 'undefined') {
            // An insertion
            this.codeMirror.replaceRange(operation.si, this.codeMirror.posFromIndex(operation.p[1]));
          } else {
            // A removal
            const from = this.codeMirror.posFromIndex(operation.p[1]);
            const to = this.codeMirror.posFromIndex(operation.p[1] + operation.sd.length);
            this.codeMirror.replaceRange('', from, to);
          }
          this.updateDocumentCollaborators();
          break;
        case 'm': // Language mode
          this.setState({ documentLanguageMode: operation.oi });
          this.raiseLanguageModeChanged(operation.oi, this.remoteUpdating);
          break;
        case 'a': // Collaborators
          if (operation.p[1] === this.myClientID) {
            this.submitCursorChange(this.getCursors(this.codeMirror));
          } else {
            this.updateDocumentCollaborators();
          }
          break;
        default:
          console.error(`Unexpected operation at ${operation.p[0]}`);
          break;
      }
    }
    this.verifyDocumentContent();
    this.remoteUpdating = REMOTE_LOCAL;
  }

  handleShareDBDocNothingPending() {
    this.setState({ documentState: DOC_SYNCED });
  }

  handleShareDBDocError(error) {
    this.raiseDocumentError(error);
  }

  raiseDocumentError(error) {
    if (this.props.onDocumentError) {
      try {
        this.props.onDocumentError(error);
      } catch (e) {
        console.error(e);
      }
    }
  }

  raiseContentChanged(content, remote) {
    if (this.props.onContentChanged) {
      try {
        this.props.onContentChanged(content, remote);
      } catch (e) {
        console.error(e);
      }
    }
  }

  raiseLanguageModeChanged(languageMode, remote) {
    if (this.props.onLanguageModeChanged) {
      try {
        this.props.onLanguageModeChanged(languageMode, remote);
      } catch (e) {
        console.error(e);
      }
    }
  }

  raiseTitleChanged(title, remote) {
    if (this.props.onTitleChanged) {
      try {
        this.props.onTitleChanged(title, remote);
      } catch (e) {
        console.error(e);
      }
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

  updateDocumentCollaborators() {
    if (!this.myClientID) {
      return;
    }
    const newCollaborators = [];
    const collaborators = this.shareDBDoc.data.a;
    for (let clientID in collaborators) {
      if (!collaborators.hasOwnProperty(clientID)) {
        continue;
      }
      if (clientID === this.myClientID) {
        continue;
      }
      const collaborator = collaborators[clientID];

      let color;
      if (clientID in this.collaboratorColors) {
        color = this.collaboratorColors[clientID];
      } else {
        color = getNextColor();
        this.collaboratorColors[clientID] = color;
      }

      newCollaborators.push({
        clientID: clientID,
        time: collaborator.t,
        name: collaborator.n,
        email: collaborator.e,
        cursors: collaborator.c,
        color: color
      });
    }
    newCollaborators.sort((a, b) => a.time - b.time);
    this.setState({ documentCollaborators: newCollaborators });
  }

  submitDocumentChange(cm, change) {
    const startPos = this.getIndexFromPos(change.from);
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

  submitLanguageModeChange(languageMode) {
    this.shareDBDoc.submitOp([{ p: ['m'], od: this.shareDBDoc.data.m, oi: languageMode }], true);
  }

  submitTitleChange(title) {
    this.shareDBDoc.submitOp([{ p: ['t'], od: this.shareDBDoc.data.t, oi: title }], true);
  }

  submitCursorChange(cursors) {
    if (!this.myClientID || !(this.myClientID in this.shareDBDoc.data.a)) {
      return;
    }

    this.shareDBDoc.submitOp([{
      p: ['a', this.myClientID, 'c'],
      od: this.shareDBDoc.data.a[this.myClientID].c,
      oi: cursors
    }], true);
  }

  subscribeDocument(collection, documentID) {
    if (this.shareDBDoc) {
      this.shareDBDoc.removeListener('op', this.handleShareDBDocOperation);
      this.shareDBDoc.removeListener('error', this.handleShareDBDocError);
      this.shareDBDoc.removeListener('nothing pending', this.handleShareDBDocNothingPending);
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

        // Document does not exist
        if (!doc.type) {
          console.error('Document does not exist');
          this.setState({ documentState: DOC_FAILED });
          return;
        }

        let title = doc.data.t;
        let content = doc.data.c;
        let mimeType = doc.data.m;

        this.shareDBDoc = doc;
        this.remoteUpdating = REMOTE_INIT;
        this.refs.title.value = title;
        this.raiseTitleChanged(title, this.remoteUpdating);
        this.codeMirror.setValue(content);
        // CodeMirror will trigger change event
        this.setState({ documentLanguageMode: mimeType });
        this.raiseLanguageModeChanged(mimeType, this.remoteUpdating);
        this.remoteUpdating = REMOTE_LOCAL;

        // Document is populated
        this.setState({ documentState: DOC_SYNCED });
        this.codeMirror.focus();
        this.handleContentCursorActivity(this.codeMirror);
        this.updateDocumentCollaborators();

        // Handle document updating event
        doc.on('op', this.handleShareDBDocOperation);
        doc.on('error', this.handleShareDBDocError);
        doc.on('nothing pending', this.handleShareDBDocNothingPending);
      });
    }
  }

  verifyDocumentContent() {
    process.nextTick(() => {
      if (!this.shareDBDoc) {
        return;
      }

      if (this.shareDBDoc.data.c !== this.codeMirror.getValue()) {
        console.warn('Content out of sync, repopulating text');
        this.remoteUpdating = REMOTE_RESYNC;
        const ranges = this.codeMirror.listSelections();
        const viewport = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(this.shareDBDoc.data.c);
        this.codeMirror.setSelections(ranges);
        this.codeMirror.scrollTo(viewport.left, viewport.top);
        this.remoteUpdating = REMOTE_LOCAL;
      }
    });
  }

  render() {
    return (
      <div className="editor-container">
        <EditorOverlay state={this.state.documentState} />
        <input ref="title" type="text" className="document-title"
          onBlur={this.handleTitleBoxBlur} onKeyUp={this.handleTitleKeyUp}
        />
        <textarea ref="textarea" />
        <Collaborators collaborators={this.state.documentCollaborators} />
        <EditorStatusBar
          connectionState={this.state.connectionState}
          connectionRetries={this.state.connectionRetries}
          connectionWaitSeconds={this.state.connectionWaitSeconds}
          documentState={this.state.documentState}
          cursors={this.state.documentCursors}
          showCursorChars={this.state.documentShowCursorChars}
          languageModeList={this.state.documentLanguageModeList}
          languageMode={this.state.documentLanguageMode}
          onLanguageModeChanged={this.handleLanguageModeChanged}
        />
      </div>
    );
  }
}

SyncedEditor.propTypes = {
  socketURL: React.PropTypes.string.isRequired,
  collection: React.PropTypes.string,
  documentID: React.PropTypes.string,
  onTitleChanged: React.PropTypes.func,
  onContentChanged: React.PropTypes.func,
  onCursorActivity: React.PropTypes.func,
  onLanguageModeChanged: React.PropTypes.func,
  onDocumentError: React.PropTypes.func
};

export default SyncedEditor;
