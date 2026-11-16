import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Icon from "./ui/Icons";
import styles from "../styles/Navbar.module.css";

// Windows load only when opened, so they cost nothing on first paint.
const SupportModal = dynamic(() => import("./modals/SupportModal"), { ssr: false });
const ArchiveModal = dynamic(() => import("./modals/ArchiveModal"), { ssr: false });
const HelpModal = dynamic(() => import("./modals/HelpModal"), { ssr: false });
const StatsModal = dynamic(() => import("./modals/StatsModal"), { ssr: false });
const SettingsModal = dynamic(() => import("./modals/SettingsModal"), { ssr: false });

// calendar (archive) and heart (support) on the left, the logo, then settings,
// help and stats on the right. Pages turn icons off with the show* props.
export default function Navbar({
  showCalendar = true,
  showSupport = true,
  showSettings = true,
  showHelp = true,
  showStats = true,
  onStatsClick = null,
  isEndlessMode = false,
}) {
  const [open, setOpen] = useState(null);
  const close = () => setOpen(null);

  const button = (label, icon, onClick) => (
    <button type="button" className={styles.iconBtn} onClick={onClick} aria-label={label}>
      <Icon name={icon} className={styles.icon} />
    </button>
  );

  return (
    <header>
      <nav className={styles.navbar} aria-label="Main">
        {showCalendar && button("Archive", "calendar", () => setOpen("archive"))}
        {showSupport && button("Support the game", "heart", () => setOpen("support"))}
        <Link href="/" className={styles.title} data-text="GUESS_EFFECT">
          GUESS_EFFECT
        </Link>
        {showSettings && button("Settings", "gear", () => setOpen("settings"))}
        {showHelp && button("How to play", "question", () => setOpen("help"))}
        {showStats && button("Stats", "chart", () => (onStatsClick ? onStatsClick() : setOpen("stats")))}
      </nav>

      {open === "archive" && <ArchiveModal onClose={close} />}
      {open === "support" && <SupportModal onClose={close} />}
      {open === "settings" && <SettingsModal onClose={close} />}
      {open === "help" && <HelpModal onClose={close} isEndless={isEndlessMode} />}
      {open === "stats" && <StatsModal onClose={close} />}
    </header>
  );
}
