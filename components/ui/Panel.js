import styles from "../../styles/ui.module.css";

// A DOS-style window. `variant="double"` is the filled-bar window used for the
// main areas; `plain` is a quieter single-line box.
export default function Panel({
  title,
  aside,
  variant = "double",
  as: Tag = "section",
  className = "",
  bodyClassName = "",
  noBody = false,
  children,
  ...rest
}) {
  return (
    <Tag className={`${styles.panel} ${variant === "double" ? styles.double : styles.plain} ${className}`} {...rest}>
      {title != null && (
        <div className={styles.bar}>
          <span>{title}</span>
          {aside != null && <span>{aside}</span>}
        </div>
      )}
      {noBody ? children : <div className={`${styles.body} ${bodyClassName}`}>{children}</div>}
    </Tag>
  );
}
