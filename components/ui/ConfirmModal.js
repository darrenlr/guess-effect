import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ title, message, confirmLabel = "[CONFIRM]", onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <Button variant="danger" block onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button block onClick={onCancel}>
        [CANCEL]
      </Button>
    </Modal>
  );
}
