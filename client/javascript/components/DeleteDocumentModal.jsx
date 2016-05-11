import React from 'react';
import Modal from '../components/Modal';

function DeleteDocumentModal(props) {
  const titleElement = (
    <div className="modal-title modal-title-regular-font">
      Are you sure you want to delete <strong>{props.title}</strong>?
    </div>
  );
  const body = 'You cannot undo this operation. All other collaborators will no longer be able to view or edit ' +
    'this file.';
  return (
    <div>
      {props.visible &&
        <Modal
          titleElement={titleElement}
          body={body}
          defaultButtonDestructive
          defaultButtonTitle="Delete Note"
          onConfirmClicked={() => props.onConfirmClicked(props.documentID)}
          onCancelClicked={() => props.onCancelClicked()}
        />
      }
    </div>
  );
}

DeleteDocumentModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string,
  title: React.PropTypes.string,
  onConfirmClicked: React.PropTypes.func,
  onCancelClicked: React.PropTypes.func
};

export default DeleteDocumentModal;