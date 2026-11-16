import styles from "../styles/page.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBlock}>
        <p>More daily games you may enjoy!</p>
        <a href="http://boxofficega.me">Box Office Game</a>
        <a href="http://gamedle.wtf">GAMEDLE</a>
        <a href="http://guessthe.game">GuessTheGame</a>
      </div>

      <div className={styles.footerBlock}>
        <p>Thank you for coming!</p>
        <span>
          Inspired by <a href="http://boxofficega.me">Box Office Game</a>
        </span>
        <span>
          Game search powered by <a href="https://rawg.io">RAWG.io</a>
        </span>
        <span>
          Game data sourced from <a href="https://igdb.com">IGDB</a>, <a href="https://rawg.io">RAWG.io</a> &amp;
          Wikipedia
        </span>
        <span>
          <a href="mailto:drussell.dev@gmail.com">Contact</a> with any questions, comments or suggestions,
        </span>
        <span>or if you spot any errors!</span>
      </div>
    </footer>
  );
}
