import { HOW_TO_PLAY } from "../../lib/content";
import Modal from "../ui/Modal";
import styles from "../../styles/result.module.css";

function HelpBody({ bullets, faq }) {
  return (
    <>
      <ul className={styles.help}>
        {bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {faq.length > 0 && (
        <section className={styles.faq} aria-label="Questions and answers">
          <p className={styles.settingsTitle}>&gt; HOW_IT_WORKS.TXT</p>
          {faq.map(([question, answer]) => (
            <details key={question} className={styles.faqItem}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
      )}
    </>
  );
}

// The how-to-play window behind the (?) icon. It's always in the page, just
// hidden until opened, so its text is still part of the HTML for search
// engines and matches the FAQ structured data.
export default function HelpModal({ open, onClose, mode = "daily", faq = [] }) {
  const body = <HelpBody bullets={HOW_TO_PLAY[mode === "endless" ? "endless" : "daily"]} faq={faq} />;

  if (!open) return <div hidden>{body}</div>;
  return (
    <Modal title={mode === "endless" ? "C:\\GAMES\\ENDLESS\\HELP.EXE" : "C:\\GAMES\\HELP.EXE"} onClose={onClose} wide>
      {body}
    </Modal>
  );
}
