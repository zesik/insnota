import React from 'react';
import Modal from '../components/Modal';

function DeleteDocumentModal(props) {
  const titleElement = (
    <div className="modal-title">Are you sure you want to delete <strong>{props.documentTitle}</strong>?</div>
  );
  const body = 'You cannot undo this operation. All other collaborators will no longer be able to view or edit ' +
    'this file.';
  return (
    <div>
      {props.visible &&
        <Modal
          titleElement={titleElement}
          body={body}
          confirmButtonDestructive
          confirmButtonTitle="Delete Note"
          onConfirmClicked={() => props.onConfirmClicked(props.documentID)}
          onCancelClicked={props.onCancelClicked}
        />
      }
    </div>
  );
}

DeleteDocumentModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string.isRequired,
  documentTitle: React.PropTypes.string.isRequired,
  onConfirmClicked: React.PropTypes.func.isRequired,
  onCancelClicked: React.PropTypes.func.isRequired
};

export default DeleteDocumentModal;
