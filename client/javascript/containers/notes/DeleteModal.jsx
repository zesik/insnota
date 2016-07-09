import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../components/Modal';
import { closeDeleteModal, deleteDocument } from '../../actions/deleteModal';

function DeleteModal(props) {
  const titleElement = (
    <div className="modal-title">
      Are you sure you want to delete <strong>{props.title}</strong>?
    </div>
  );
  const bodyElement = (
    <div>
      <div className="modal-body">
        You cannot undo this operation. You and all collaborators will no longer be able to view or edit this file.
      </div>
      {props.errorNotFound &&
        <div className="modal-footer error">
          The note no longer exists or you don't have permission to access this note.
        </div>
      }
      {props.serverError &&
        <div className="modal-footer error">
          Unable to delete the document due to an internal server error. Please try again in a few minutes.
        </div>
      }
    </div>
  );
  return (
    <div>
      {props.opened &&
        <Modal
          titleElement={titleElement}
          bodyElement={bodyElement}
          confirmButtonDestructive
          confirmButtonTitle="Delete Note"
          confirmButtonDisabled={props.loading}
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
  errorNotFound: React.PropTypes.bool.isRequired,
  serverError: React.PropTypes.bool.isRequired,
  onDeleteDocument: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.deleteModal;
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onDeleteDocument: documentID => {
      dispatch(deleteDocument(documentID, documentID === ownProps.selectedDocumentID));
    },
    onClose: () => {
      dispatch(closeDeleteModal());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
