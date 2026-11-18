import { KEYS } from "../../lib/storage";
import { initialHistory } from "../../lib/history";
import useLocalState from "../../hooks/useLocalState";
import Modal from "../ui/Modal";
import ArchiveCalendar from "../ArchiveCalendar";

export default function ArchiveModal({ onClose }) {
  const [history] = useLocalState(KEYS.history, initialHistory);
  return (
    <Modal title="C:\GAMES\ARCHIVE.EXE" onClose={onClose}>
      <ArchiveCalendar history={history} onPick={onClose} />
    </Modal>
  );
}
