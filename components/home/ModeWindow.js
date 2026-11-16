import { useId, useState } from "react";
import styles from "../../styles/page.module.css";

// A collapsible window for a game mode. Collapsed it's a single row; open it
// becomes a titled window like the Daily one. The content stays in the page
// (hidden) when collapsed, so it's still there for search engines.
export default function ModeWindow({ path, name, blurb, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className={`${styles.window} ${open ? styles.windowOpen : ""}`}>
      <h3 className={styles.windowHeading}>
        <button
          type="button"
          className={`${styles.windowToggle} ${open ? styles.windowToggleOpen : ""}`}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <>
              <span>C:\GAMES\{path}&gt;_</span>
              <span aria-hidden="true">[-]</span>
              <span className="sr-only">Collapse {name}</span>
            </>
          ) : (
            <>
              <span className={styles.windowIcon} aria-hidden="true">
                {icon}
              </span>
              <span className={styles.windowName}>
                <span className={styles.windowTitle}>{name}</span>
                <span className={styles.windowBlurb}>{blurb}</span>
              </span>
              <span className={styles.windowMark} aria-hidden="true">
                [+]
              </span>
              <span className="sr-only">Expand {name}</span>
            </>
          )}
        </button>
      </h3>
      <div id={bodyId} className={styles.windowBody} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
