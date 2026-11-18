import Link from "next/link";
import styles from "../../styles/ui.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

const variantClass = {
  outline: "",
  solid: styles.solid,
  danger: styles.danger,
};

// One button for everything. Pass `href` to render a link, otherwise a button.
//   <Button variant="solid" block onClick={...}>[RUN]</Button>
//   <Button href="/daily" option title="RUN DAILY.BAT" desc="Play today's game" />
export default function Button({
  variant = "outline",
  block = false,
  option = false,
  title,
  desc,
  unavailable = false,
  trailing,
  href,
  className = "",
  children,
  ...rest
}) {
  const classes = cx(
    styles.btn,
    variantClass[variant],
    block && styles.block,
    option && styles.option,
    unavailable && styles.unavailable,
    className
  );

  const content = option ? (
    <span className={styles.optionRow}>
      <span>
        <span className={styles.optionTitle}>{title}</span>
        {desc && (
          <>
            <br />
            <span className={styles.optionDesc}>{desc}</span>
          </>
        )}
      </span>
      {trailing}
    </span>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} disabled={unavailable || rest.disabled} {...rest}>
      {content}
    </button>
  );
}
