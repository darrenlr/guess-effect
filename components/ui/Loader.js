import styles from "../../styles/loader.module.css";

// The little running plumber, shown while a game loads.
export default function Loader({ label = "Loading..." }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <p className={styles.loader}>
        <span className="sr-only">{label}</span>
      </p>
    </div>
  );
}
