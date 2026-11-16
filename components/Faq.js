import Panel from "./ui/Panel";
import styles from "../styles/page.module.css";

// Visible questions and answers. The same list feeds the FAQPage JSON-LD (see
// SeoHead), so what search engines read always matches what players see.
export default function Faq({ title = "HOW_IT_WORKS.TXT", items }) {
  return (
    <Panel as="section" title={title} className={styles.faq}>
      {items.map(([question, answer]) => (
        <details key={question} className={styles.faqItem}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </Panel>
  );
}
