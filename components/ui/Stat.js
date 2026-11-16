import styles from "../../styles/ui.module.css";

export default function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>&gt; {label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
