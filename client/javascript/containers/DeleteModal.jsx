import React from 'react';
import { connect } from 'react-redux';
import Modal from '../components/Modal';
import { closeDeleteModal, startDeleteDocument } from '../actions/deleteModal';

function DeleteModal(props) {
  const titleElement = (
    <div className="modal-title">
      Are you sure you want to delete <strong>{props.title}</strong>?
    </div>
  );
  const body = 'You cannot undo this operation. All other collaborators will no longer be able to view or edit ' +
    'this file.';
  return (
    <div>
      {props.opened &&
        <Modal
          titleElement={titleElement}
          body={body}
          confirmButtonDestructive
          confirmButtonTitle="Delete Note"
          cancelButtonFocused
          onConfirm={() => props.onDeleteDocument(props.documentID)}
          onCancel={props.onClose}
        />
      }
    </div>
  );
}

DeleteModal.propTypes = {
  opened: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
  onDeleteDocument: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.deleteModal;
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onDeleteDocument: documentID => {
      dispatch(startDeleteDocument(documentID, documentID === ownProps.selectedDocumentID));
    },
    onClose: () => {
      dispatch(closeDeleteModal());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
