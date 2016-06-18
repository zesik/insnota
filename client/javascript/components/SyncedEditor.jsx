import React from 'react';
import classNames from 'classnames';
import CodeMirror from 'codemirror';
import 'whatwg-fetch';
import ShareDB from 'sharedb/lib/client';
import Collaborators from './Collaborators';
import EditorOverlay from './EditorOverlay';
import EditorStatusBar from '../containers/EditorStatusBar';
import { LANGUAGE_MODES } from '../utils/editorLanguageModes';

export const NET_DISCONNECTED = 'NET_DISCONNECTED';
export const NET_CONNECTING = 'NET_CONNECTING';
export const NET_CONNECTED = 'NET_CONNECTED';
export const NET_WAITING = 'NET_WAITING';

export const DOC_INITIAL = 'DOC_INITIAL';
export const DOC_OPENING = 'DOC_OPENING';
export const DOC_DENIED = 'DOC_DENIED';
export const DOC_ERROR = 'DOC_FAILED';
export const DOC_SYNCING = 'DOC_SYNCING';
export const DOC_SYNCED = 'DOC_SYNCED';

export const OP_LOCAL = 0;
export const OP_REMOTE = 1;
export const OP_INIT = 2;
export const OP_RESYNC = 3;

const MAX_BACKOFF_TIME_PARAMETER = 6;

const COLLABORATOR_COLOR_COUNT = 10;

//
// Collaborator color helper
//
let colorIndex = 0;
function getNextColor() {
  const currentIndex = colorIndex;
  colorIndex = (colorIndex + 1) % COLLABORATOR_COLOR_COUNT;
  return currentIndex;
}

//
// Connection helper
//
function createConnection() {
  const l = window.location;
  return new WebSocket(`${((l.protocol === 'https:') ? 'wss://' : 'ws://')}${l.host}/notes`);
}

function getReconnectWaitTime(retryCount) {
  return [Math.pow(2, Math.min(retryCount, MAX_BACKOFF_TIME_PARAMETER)), Math.floor(Math.random() * 1000)];
}

//
// CodeMirror index helper
//
function getColumnIndex(cm, ln, ch, tabSize) {
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

function getCursors(cm) {
  const selections = cm.listSelections();
  const selectedStrings = cm.getSelections();
  const tabSize = cm.getOption('tabSize');
  if (selections.length !== selectedStrings.length) {
    console.error('Error retriving cursors: selection counts mismatch');
    return [];
  }
  const cursors = selections.map((item, index) => ({
    anchor: {
      ln: item.anchor.line + 1,
      col: getColumnIndex(cm, item.anchor.line, item.anchor.ch, tabSize) + 1,
      ch: item.anchor.ch + 1
    },
    head: {
      ln: item.head.line + 1,
      col: getColumnIndex(cm, item.head.line, item.head.ch, tabSize) + 1,
      ch: item.head.ch + 1
    },
    length: selectedStrings[index].length
  }));
  return cursors;
}

//
// CodeMirror cursors
//
function createCollaboratorCursor(cm, collaborator) {
  const ownerDocument = cm.getWrapperElement().ownerDocument;
  const color = collaborator.color;
  const cursorContainer = ownerDocument.createElement('div');
  cursorContainer.className = 'collaborator-cursor-container';
  const cursorElement = ownerDocument.createElement('div');
  cursorElement.className = `collaborator-cursor color-${color}`;
  cursorContainer.appendChild(cursorElement);
  const idElement = ownerDocument.createElement('div');
  if (collaborator.email) {
    idElement.className = `collaborator-identity color-${color}`;
    idElement.innerText = collaborator.name;
  } else {
    idElement.className = `collaborator-identity collaborator-anonymous color-${color}`;
    idElement.innerText = 'Anonymous';
  }
  cursorContainer.appendChild(idElement);
  return cursorContainer;
}

function syncCollaborators(cm, current, next) {
  for (let i = 0; i < next.length; ++i) {
    if (i >= current.length || current[i].clientID > next[i].clientID) {
      const element = createCollaboratorCursor(cm, next[i]);
      const collaboratorObject = {
        clientID: next[i],
        element
      };
      current.splice(i, 0, collaboratorObject);
      if (!next[i].cursors || next[i].cursors.length === 0) {
        continue;
      }
    } else if (current[i].clientID < next[i].clientID) {
      if (current[i].widget) {
        current[i].widget.clear();
      }
      current.splice(i, 1);
      --i;
      continue;
    } else {
      if (!next[i].cursors || next[i].cursors.length === 0) {
        if (current[i].widget) {
          current[i].widget.clear();
          delete current[i].ln;
          delete current[i].ch;
          delete current[i].widget;
        }
        continue;
      }
      if (current[i].widget) {
        if (next[i].cursors[0].head.ln - 1 === current[i].ln && next[i].cursors[0].head.ch - 1 === current[i].ch) {
          continue;
        }
        current[i].widget.clear();
      }
    }
    current[i].ln = next[i].cursors[0].head.ln - 1;
    current[i].ch = next[i].cursors[0].head.ch - 1;
    current[i].widget = cm.setBookmark(
      new CodeMirror.Pos(next[i].cursors[0].head.ln - 1, next[i].cursors[0].head.ch - 1),
      { widget: current[i].element }
    );
  }
  const i = next.length;
  while (i < current.length) {
    if (current[i].widget) {
      current[i].widget.clear();
    }
    current.splice(i, 1);
  }
}

class SyncedEditor extends React.Component {
  constructor(props) {
    super(props);

    // Connection events
    this.handleConnectionStateChanged = this.handleConnectionStateChanged.bind(this);
    // Title editor events
    this.handleTitleKeyUp = this.handleTitleKeyUp.bind(this);
    this.handleTitleBoxSubmit = this.handleTitleBoxSubmit.bind(this);
    // Content editor events
    this.handleContentChanged = this.handleContentChanged.bind(this);
    this.handleContentCursorActivity = this.handleContentCursorActivity.bind(this);
    this.handleEditorGotFocus = this.handleFocusChanged.bind(this, true);
    this.handleEditorLostFocus = this.handleFocusChanged.bind(this, false);
    // Document events
    this.handleShareDBDocError = this.handleShareDBDocError.bind(this);
    this.handleShareDBDocOperation = this.handleShareDBDocOperation.bind(this);
    this.handleShareDBDocNothingPending = this.handleShareDBDocNothingPending.bind(this);
    // Status bar events
    this.handleChangeLanguageMode = this.handleChangeLanguageMode.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleOpenPermissionModal = this.handleOpenPermissionModal.bind(this);

    // Initialize React state
    this.state = {
      netStatus: NET_DISCONNECTED,
      netRetryCount: 0,
      netRetryWait: 0,
      docStatus: DOC_INITIAL,
      focused: false,
      languageMode: '',
      sharing: '',
      readOnly: false,
      cursors: [],
      collaborators: [],
      collaboratorCursorsVisible: true
    };
  }

  componentDidMount() {
    // Initialize CodeMirror
    this.codeMirror = CodeMirror.fromTextArea(this.refs.textarea, {
      lineNumbers: true,
      showCursorWhenSelecting: true,
      readOnly: 'nocursor',
      indentUnit: 4,
      tabSize: 4,
      extraKeys: {
        Tab: cm => {
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

    // Initialize ShareDB connection to the server
    this.shareDBDoc = null;
    this.shareDBConnection = new ShareDB.Connection(createConnection());
    this.shareDBConnection.on('state', this.handleConnectionStateChanged);

    // Initialize other helper variables
    this.operationSource = OP_LOCAL;
    this.reconnectionTimer = 0;
    this.collaboratorColors = {};
    this.collaboratorCursors = [];

    // componentWillReceiveProps is not called when mounting, so we need to manually subscribe to document here
    // See https://facebook.github.io/react/tips/componentWillReceiveProps-not-triggered-after-mounting.html
    this.subscribeDocument(this.props.documentID);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.documentID !== this.props.documentID) {
      this.subscribeDocument(nextProps.documentID);
    }
    if (!nextProps.documentID) {
      this.setState({ docStatus: DOC_INITIAL });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    switch (nextState.docStatus) {
      case DOC_SYNCED:
      case DOC_SYNCING:
        this.codeMirror.setOption('readOnly', nextState.readOnly);
        break;
      default:
        this.codeMirror.setOption('readOnly', 'nocursor');
        break;
    }

    this.codeMirror.setOption('mode', nextState.languageMode);

    let collaborators = [];
    if (nextState.collaboratorCursorsVisible) {
      collaborators = nextState.collaborators.slice(0).sort((a, b) => a.clientID.localeCompare(b.clientID));
    }
    syncCollaborators(this.codeMirror, this.collaboratorCursors, collaborators);
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

  //
  // ShareDB connection event handlers
  //
  handleConnectionStateChanged(newState) {
    switch (newState) {
      case 'connected':
        this.setState({
          netStatus: NET_CONNECTED,
          netRetryCount: 0,
          netRetryWait: 0
        });
        break;
      case 'connecting':
        this.setState({
          netStatus: NET_CONNECTING
        });
        break;
      default:
        this.prepareReconnection();
        break;
    }
  }

  //
  // Document editor event handlers
  //
  handleContentChanged(cm, changes) {
    // Editor should not be able to be changed when not subscribing to a document
    if (!this.shareDBDoc) {
      console.error('Content changed when not subscribing to a document');
      return;
    }

    // Raise event
    this.raiseContentChanged(cm.getValue(), this.operationSource);

    // Do not submit changes to the server unless we are sure it is a local change
    if (this.operationSource !== OP_LOCAL) {
      return;
    }

    // Submit changes to remote server
    for (let i = 0; i < changes.length; ++i) {
      this.submitDocumentChange(cm, changes[i]);
    }
    this.verifyDocumentContent();
  }

  handleContentCursorActivity(cm) {
    // Editor should not be able to have any cursor activity when not subscribing to a document
    if (!this.shareDBDoc) {
      console.error('Cursor activity when not subscribing to a document');
      return;
    }

    const cursors = getCursors(cm);
    this.setState({ cursors });

    // TODO: we can raise cursor changed event

    this.submitCursorActivity(cursors);
  }

  handleFocusChanged(focused) {
    this.setState({ focused });
  }

  //
  // Status bar event popup handlers
  //
  handleChangeLanguageMode(languageMode) {
    // Language should not be able to be changed when not subscribing to a document
    if (!this.shareDBDoc) {
      console.error('Language mode changed when not subscribing to a document');
      return;
    }

    this.setState({ languageMode });

    // Raise events
    this.raiseLanguageModeChanged(languageMode, this.operationSource);

    // Do not submit changes to the server unless we are sure it is a local change
    if (this.operationSource !== OP_LOCAL) {
      return;
    }

    // Submit change to remote server
    this.submitLanguageModeChange(languageMode);
  }

  handleNavigation(target) {
    const line = parseInt(target, 10);
    if (line) {
      this.codeMirror.setCursor(line - 1);
    }
    this.codeMirror.focus();
  }

  handleOpenPermissionModal() {
    this.props.onOpenPermissionModal(this.props.documentID);
  }

  //
  // Title editor event handlers
  //
  handleTitleKeyUp(event) {
    // Event is not handled when not subscribing to a document
    if (!this.shareDBDoc) {
      console.error('Title editor key up when not subscribing to a document');
      return;
    }

    const titleTextBox = event.target;
    if (event.key === 'Escape') {
      // Cancelled, revert to original title
      titleTextBox.value = this.shareDBDoc.data.t;
      titleTextBox.blur();
    }
  }

  handleTitleBoxSubmit(event) {
    // Prevent any default submitting actions
    event.preventDefault();

    // Event is not raised when not subscribing to a document
    if (!this.shareDBDoc) {
      console.error('Title editor submitted when not subscribing to a document');
      return;
    }

    // No need to submit the change if same
    const titleTextBox = this.refs.title;
    titleTextBox.blur();
    if (titleTextBox.value === this.shareDBDoc.data.t) {
      return;
    }

    // Raise event
    this.raiseTitleChanged(titleTextBox.value, this.operationSource);

    // Submit title changes to server
    this.submitTitleChange(titleTextBox.value);
  }

  //
  // ShareDB document event handlers
  //
  handleShareDBDocOperation(operationList, local) {
    if (local) {
      return;
    }
    this.operationSource = OP_REMOTE;
    for (let i = 0; i < operationList.length; ++i) {
      const operation = operationList[i];
      switch (operation.p[0]) {
        case 't': // Title
          this.refs.title.value = operation.oi;
          this.raiseTitleChanged(this.refs.title.value, this.operationSource);
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
          // Change events are raised by CodeMirror event handlers
          // Need to reset collaborator cursors because CodeMirror bookmark replaces along with content
          this.setDocumentCollaborators();
          break;
        case 'm': // Language mode
          this.setState({ languageMode: operation.oi });
          this.raiseLanguageModeChanged(operation.oi, this.operationSource);
          break;
        case 'a': // Collaborators
          if (operation.p[1] === this.shareDBConnection.id) {
            this.submitCursorActivity(getCursors(this.codeMirror));
          } else {
            this.setDocumentCollaborators();
          }
          break;
        case 'p': // Permission
          this.validateDocumentAccess(this.props.documentID, err => {
            if (err) {
              this.subscribeDocument();
            }
          });
          break;
        default:
          console.error(`Unexpected operation at ${operation.p[0]}`);
          break;
      }
    }
    this.verifyDocumentContent();
    this.operationSource = OP_LOCAL;
  }

  handleShareDBDocNothingPending() {
    this.setState({ docStatus: DOC_SYNCED });
  }

  handleShareDBDocError(error) {
    this.raiseDocumentError(error);
  }

  //
  // SyncedEditor events
  //
  raiseTitleChanged(title, remote) {
    if (!this.props.onTitleChanged) {
      return;
    }
    try {
      this.props.onTitleChanged(title, remote);
    } catch (e) {
      console.error(e);
    }
  }

  raiseContentChanged(content, remote) {
    if (!this.props.onContentChanged) {
      return;
    }
    try {
      this.props.onContentChanged(content, remote);
    } catch (e) {
      console.error(e);
    }
  }

  raiseLanguageModeChanged(languageMode, remote) {
    if (!this.props.onLanguageModeChanged) {
      return;
    }
    try {
      this.props.onLanguageModeChanged(languageMode, remote);
    } catch (e) {
      console.error(e);
    }
  }

  raiseDocumentError(error) {
    if (this.props.onDocumentError) {
      return;
    }
    try {
      this.props.onDocumentError(error);
    } catch (e) {
      console.error(e);
    }
  }

  prepareReconnection() {
    // Ignore if we are already waiting for reconnecting
    if (this.reconnectionTimer) {
      return;
    }

    // Get reconnecting wait time
    const seconds = getReconnectWaitTime(this.state.connectionRetries);
    const expire = new Date();
    expire.setSeconds(expire.getSeconds() + seconds[0]);
    expire.setMilliseconds(expire.getMilliseconds() + seconds[1]);
    this.setState({
      netStatus: NET_WAITING,
      netRetryCount: this.state.netRetryCount + 1,
      netRetryWait: Math.ceil(seconds[0] + seconds[1] / 1000)
    });

    // Set up timer for reconnecting
    this.reconnectionTimer = window.setInterval(() => {
      const difference = (expire - (new Date())) / 1000;
      if (difference > 0) {
        this.setState({ netRetryWait: Math.ceil(difference) });
        return;
      }

      // Stop timer
      window.clearInterval(this.reconnectionTimer);
      this.reconnectionTimer = 0;

      // Start reconnecting
      this.setState({ netStatus: NET_CONNECTING });
      this.validateDocumentAccess(this.props.documentID, err => {
        this.shareDBConnection.bindToSocket(createConnection());
        if (err) {
          this.subscribeDocument();
        }
      });
    }, 100);
  }

  setDocumentCollaborators() {
    const collaboratorData = this.shareDBDoc.data.a;
    const currentCollaborators = Object.keys(collaboratorData)
      .filter(clientID => clientID !== this.shareDBConnection.id)
      .map(clientID => {
        const collaborator = collaboratorData[clientID];
        let color;
        if (clientID in this.collaboratorColors) {
          color = this.collaboratorColors[clientID];
        } else {
          color = getNextColor();
          this.collaboratorColors[clientID] = color;
        }
        return {
          clientID,
          time: collaborator.t,
          name: collaborator.n,
          email: collaborator.e,
          cursors: collaborator.c,
          color
        };
      })
      .sort((a, b) => a.time - b.time);
    this.setState({ collaborators: currentCollaborators });
  }

  //
  // ShareDB submission handlers
  //
  submitTitleChange(title) {
    // Do not submit title change when the document is read only.
    if (this.state.readOnly) {
      return;
    }

    // Set SYNCING state
    this.setState({ docStatus: DOC_SYNCING });

    this.shareDBDoc.submitOp([{ p: ['t'], od: this.shareDBDoc.data.t, oi: title }], true);
  }

  submitDocumentChange(cm, change) {
    // Do not submit content change when the document is read only.
    if (this.state.readOnly) {
      return;
    }

    // Set SYNCING state
    this.setState({ docStatus: DOC_SYNCING });

    // Multicursor mode has some problems if getting data directly from CodeMirror
    // See https://github.com/share/share-codemirror/pull/6
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

  submitCursorActivity(cursors) {
    // Skip submitting if we are disconnected for the moment
    if (this.shareDBConnection.state !== 'connected') {
      return;
    }

    const clientID = this.shareDBConnection.id;

    // Skip submitting if the server has not yet recognized us
    if (!(clientID in this.shareDBDoc.data.a)) {
      return;
    }

    // Do not submit cursor activity when the document is read only.
    if (this.state.readOnly) {
      return;
    }

    // We are not setting SYNCING state here because we don't consider cursor activity important

    // Submit cursor activity
    this.shareDBDoc.submitOp([{
      p: ['a', clientID, 'c'],
      od: this.shareDBDoc.data.a[clientID].c,
      oi: cursors
    }], true);
  }

  submitLanguageModeChange(languageMode) {
    // Do not submit language mode change when the document is read only.
    if (this.state.readOnly) {
      return;
    }

    // Set SYNCING state
    this.setState({ docStatus: DOC_SYNCING });

    this.shareDBDoc.submitOp([{ p: ['m'], od: this.shareDBDoc.data.m, oi: languageMode }], true);
  }

  subscribeDocument(documentID) {
    if (this.shareDBDoc) {
      this.shareDBDoc.removeListener('op', this.handleShareDBDocOperation);
      this.shareDBDoc.removeListener('error', this.handleShareDBDocError);
      this.shareDBDoc.removeListener('nothing pending', this.handleShareDBDocNothingPending);
      this.shareDBDoc.unsubscribe();
      this.shareDBDoc = null;
    }
    if (!documentID) {
      return;
    }
    this.setState({ docStatus: DOC_OPENING });
    this.validateDocumentAccess(documentID, (accessError, docInfo) => {
      if (accessError) {
        return;
      }

      // Subscribe to the document
      const doc = this.shareDBConnection.get(docInfo.collection, docInfo.document);
      doc.subscribe(subscribeError => {
        // Unable to subscribe to the document
        if (subscribeError) {
          this.setState({ docStatus: DOC_ERROR });
          return;
        }

        // Document does not exist
        if (!doc.type) {
          this.setState({ docStatus: DOC_DENIED });
          return;
        }

        const title = doc.data.t;
        const content = doc.data.c;
        const mimeType = doc.data.m;

        // Initialize document content and raise initial events
        this.shareDBDoc = doc;
        this.operationSource = OP_INIT;
        this.refs.title.value = title;
        this.raiseTitleChanged(title, this.operationSource);
        this.codeMirror.setValue(content);
        // CodeMirror raises initial change event
        this.setState({ languageMode: mimeType });
        this.raiseLanguageModeChanged(mimeType, this.operationSource);
        this.operationSource = OP_LOCAL;

        // Document is now populated
        this.setState({ docStatus: DOC_SYNCED });
        this.codeMirror.focus();
        this.setDocumentCollaborators();

        // Bind document updating event
        doc.on('op', this.handleShareDBDocOperation);
        doc.on('error', this.handleShareDBDocError);
        doc.on('nothing pending', this.handleShareDBDocNothingPending);
      });
    });
  }

  validateDocumentAccess(documentID, callback) {
    fetch(`/api/notes/${documentID}`, {
      credentials: 'same-origin'
    })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(json => {
      // Check whether we could write to the document
      let readOnly = true;
      if (json.anonymousEditing === 'edit') {
        readOnly = false;
      } else if (this.props.user) {
        const email = this.props.user.email;
        if (email === json.owner.email) {
          // Owner has full access
          readOnly = false;
        } else {
          for (let i = 0; i < json.collaborators.length; ++i) {
            if (email === json.collaborators[i].email) {
              // Only collaborator with edit permission can edit
              if (json.collaborators[i].permission === 'edit') {
                readOnly = false;
              }
              break;
            }
          }
        }
      }
      // Check the document sharing setting
      let sharing = 'private';
      if (json.anonymousEditing === 'view' || json.anonymousEditing === 'edit') {
        sharing = 'public';
      } else if (json.collaborators.length > 0) {
        sharing = 'team';
      }
      this.setState({ readOnly, sharing });
      return callback(null, { collection: json.collection, document: json.document });
    })
    .catch(err => {
      // We could not access the document
      if (err.response.status >= 500) {
        console.error(`Server error: ${err}`);
        this.setState({ docStatus: DOC_ERROR });
      } else {
        this.setState({ docStatus: DOC_DENIED });
      }
      return callback(err);
    });
  }

  verifyDocumentContent() {
    process.nextTick(() => {
      // Verification should not be called when not subscribing to a document
      if (!this.shareDBDoc) {
        console.error('Unable to verify when not subscribing to a document');
        return;
      }

      if (this.shareDBDoc.data.c !== this.codeMirror.getValue()) {
        console.warn('Content out of sync, repopulating text');
        this.operationSource = OP_RESYNC;
        const ranges = this.codeMirror.listSelections();
        const viewport = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(this.shareDBDoc.data.c);
        this.codeMirror.setSelections(ranges);
        this.codeMirror.scrollTo(viewport.left, viewport.top);
        this.operationSource = OP_RESYNC;
      }
    });
  }

  render() {
    const containerClasses = classNames({
      'editor-container': true,
      'full-screen': this.props.fullScreen
    });
    return (
      <div className={containerClasses}>
        <EditorOverlay state={this.state.docStatus} />
        <div id="document-editor">
          <Collaborators collaborators={this.state.collaborators} />
          <form onSubmit={this.handleTitleBoxSubmit}>
            <div className="title-editor">
              <input
                ref="title"
                type="text"
                className="document-title"
                readOnly={this.state.readOnly}
                disabled={this.state.docStatus !== DOC_SYNCED && this.state.docStatus !== DOC_SYNCING}
                onBlur={this.handleTitleBoxSubmit}
                onKeyUp={this.handleTitleKeyUp}
              />
            </div>
          </form>
          <div className="editor">
            <textarea ref="textarea" />
          </div>
          <EditorStatusBar
            netStatus={this.state.netStatus}
            netRetryCount={this.state.netRetryCount}
            netRetryWait={this.state.netRetryWait}
            docStatus={this.state.docStatus}
            docFocused={this.state.focused}
            readOnly={this.state.readOnly}
            cursors={this.state.cursors}
            onNavigation={this.handleNavigation}
            languageMode={this.state.languageMode}
            languageModeList={LANGUAGE_MODES}
            onChangeLanguageMode={this.handleChangeLanguageMode}
            sharing={this.state.sharing}
            onOpenPermissionModal={this.handleOpenPermissionModal}
          />
        </div>
      </div>
    );
  }
}

SyncedEditor.propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }),
  fullScreen: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string,
  onTitleChanged: React.PropTypes.func,
  onContentChanged: React.PropTypes.func,
  onCursorActivity: React.PropTypes.func,
  onLanguageModeChanged: React.PropTypes.func,
  onDocumentError: React.PropTypes.func,
  onOpenPermissionModal: React.PropTypes.func
};

export default SyncedEditor;
