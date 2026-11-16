import { useEffect, useRef } from "react";
import styles from "../../styles/ui.module.css";

// A window over the page. Closes on Escape or a click outside it, and takes
// focus while open so keyboard users land inside it.
export default function Modal({ title, onClose, wide = false, children }) {
  const dialog = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    if (!onClose) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (onClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`${styles.modal} ${wide ? styles.modalWide : ""}`}
      >
        <div className={styles.modalBar}>
          <span className={styles.modalTitle}>{title}</span>
          {onClose && (
            <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
              [X]
            </button>
          )}
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
