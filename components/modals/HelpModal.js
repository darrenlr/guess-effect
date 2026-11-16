import Modal from "../ui/Modal";
import styles from "../../styles/result.module.css";

export default function HelpModal({ onClose, isEndless = false }) {
  return (
    <Modal title={isEndless ? "C:\\GAMES\\ENDLESS\\HELP.EXE" : "C:\\GAMES\\HELP.EXE"} onClose={onClose}>
      <ul className={styles.help}>
        {isEndless ? (
          <>
            <li>Guess as many video games as you can before running out of lives.</li>
            <li>
              Each game is identified by its earliest global release date, accounting for staggered regional
              launches.
            </li>
            <li>
              The cover starts zoomed right in. Zoom out a step at a time, or trade points to reveal clues,
              including platforms (based on the first platform the game launched on globally).
            </li>
            <li>You have 10 lives across the entire run. A wrong guess or a skip costs one life.</li>
            <li>Score as many points as possible before your lives run out.</li>
          </>
        ) : (
          <>
            <li>
              Guess the video game based on its initial release date (the earliest release date, considering
              staggered regional launches).
            </li>
            <li>
              The cover starts zoomed right in. Zoom out a step at a time, or trade points to reveal clues,
              including platforms (the first platform the game was released on globally).
            </li>
            <li>Receive bonus points for making fewer guesses.</li>
            <li>The game ends after 4 incorrect guesses.</li>
          </>
        )}
      </ul>
    </Modal>
  );
}
