import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function SupportModal({ onClose }) {
  return (
    <Modal title="C:\GAMES\SUPPORT.EXE" onClose={onClose}>
      <p>Thank you so much for playing!</p>
      <p>
        If you&apos;ve enjoyed it, please consider supporting, as it will allow me to continue updating and
        working on the game!
      </p>
      <Button
        href="https://ko-fi.com/S6S7EDM09"
        target="_blank"
        rel="noreferrer noopener"
        variant="solid"
        block
      >
        [BUY_ME_A_COFFEE]
      </Button>
    </Modal>
  );
}
