import React from 'react';
import EditorOverlay from './EditorOverlay';
import EditorStatusBar from './EditorStatusBar';
import CodeMirror from 'codemirror';
import ShareDB from 'sharedb/lib/client';

export const DOC_INITIAL = 'DOC_INITIAL';
export const DOC_OPENING = 'DOC_OPENING';
export const DOC_FAILED = 'DOC_FAILED';
export const DOC_SYNCING = 'DOC_SYNCING';
export const DOC_SYNCED = 'DOC_SYNCED';

const DEFAULT_DOCUMENT = {
  t: '',
  c: ''
};

class SyncedEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleContentChanged = this.handleContentChanged.bind(this);
    this.handleContentCursorActivity = this.handleContentCursorActivity.bind(this);
    // this.handleFocusChanged is not bound here, but in componentDidMount
    this.state = {
      state: DOC_INITIAL,
      readOnly: false,
      cursors: [],
      showCursorChars: false
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
    this.shareDBConnection = new ShareDB.Connection(new WebSocket(this.props.socketURL));
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
    switch (nextState.state) {
      case DOC_SYNCED:
      case DOC_SYNCING:
        this.codeMirror.setOption('readOnly', nextState.readOnly);
        break;
      default:
        this.codeMirror.setOption('readOnly', 'nocursor');
        break;
    }
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
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    if (this.shareDBConnection) {
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

  handleFocusChanged(focus) {
  }

  handleContentChanged(cm, change) {
    // Event is not raised if not subscribing to remote document
    const doc = this.shareDBDoc;
    if (!doc) {
      return;
    }

    // Do not submit remote changes again to the server
    this.raiseContentChanged(cm.getValue(), this.remoteUpdating);
    if (this.remoteUpdating) {
      return;
    }

    // Submit changed to remote server
    this.setState({ state: DOC_SYNCING });
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
          col: this.getColumn(selections[i].anchor.line, selections[i].anchor.ch, tabSize) + 1,
          ch: selections[i].anchor.ch + 1
        },
        head: {
          ln: selections[i].head.line + 1,
          col: this.getColumn(selections[i].head.line, selections[i].head.ch, tabSize) + 1,
          ch: selections[i].head.ch + 1
        },
        length: selectedStrings[i].length
      });
    }
    this.setState({ cursors });
  }

  raiseTitleChanged(title, remote) {
    if (this.props.onTitleChanged) {
      process.nextTick(() => this.props.onTitleChanged(title, remote));
    }
  }

  raiseContentChanged(content, remote) {
    if (this.props.onContentChanged) {
      process.nextTick(() => this.props.onContentChanged(content, remote));
    }
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

  subscribeDocument(collection, documentID) {
    if (this.shareDBDoc) {
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    this.setState({ state: DOC_INITIAL });
    if (collection && documentID) {
      this.setState({ state: DOC_OPENING });
      const doc = this.shareDBConnection.get(collection, documentID);
      doc.subscribe(error => {
        // Unable to subscribe to the document
        if (error) {
          console.error('Failed to subscribe', error);
          this.setState({ state: DOC_FAILED });
          return;
        }

        // Create the document or read document from server
        let title = this.props.defaultTitle;
        let content = this.props.defaultContent;
        if (doc.type) {
          title = doc.data.t;
          content = doc.data.c;
        } else {
          doc.create(Object.assign({}, DEFAULT_DOCUMENT, {
            t: title,
            c: content
          }));
        }

        // The first initialization of document is considered as remote updating event
        this.remoteUpdating = true;
        this.refs.title.value = title;
        this.codeMirror.setValue(content);
        this.remoteUpdating = false;

        // Document is populated
        this.shareDBDoc = doc;
        this.setState({ state: DOC_SYNCED });
        this.codeMirror.focus();

        // Handle document updating event
        doc.on('op', (operationList, local) => {
          if (!local) {
            this.remoteUpdating = true;
            for (let i = 0; i < operationList.length; ++i) {
              const operation = operationList[i];
              if (operation.p[0] === 't') {
                // TODO: Handle document title change
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
          }
          if (this.refs.title.value === doc.data.t && this.codeMirror.getValue() === doc.data.c) {
            this.setState({ state: DOC_SYNCED });
          } else {
            this.setState({ state: DOC_SYNCING });
          }
        });
      });
    }
  }

  render() {
    return (
      <div className="editor-container">
        <EditorOverlay state={this.state.state} />
        <input ref="title" type="text" />
        <textarea ref="textarea" />
        <EditorStatusBar
          state={this.state.state}
          cursors={this.state.cursors}
          showCursorChars={this.state.showCursorChars}
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
  onTitleChanged: React.PropTypes.func,
  onContentChanged: React.PropTypes.func,
  onCursorActivity: React.PropTypes.func
};

export default SyncedEditor;
