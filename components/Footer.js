import styles from '../styles/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <p>More daily games you may enjoy!</p>
                <a href="http://boxofficega.me">Box Office Game</a>
                <a href="http://gamedle.wtf">GAMEDLE</a>
                <a href="http://guessthe.game">GuessTheGame</a>
            </div>

            <div className={styles.thanks}>
                <p>Thank you for coming!</p>
                <span>Inspired by <a href="boxofficega.me">Box Office Game</a></span>
                <span>Game search powered by <a href="https://igdb.io">IGDB</a></span>
                <span>Game data sourced from <a href="https://igdb.com">IGDB</a>, <a href="https://rawg.io">RAWG.io</a> & Wikipedia</span>
                <span><a href="mailto:drussell.dev@gmail.com">Contact</a> with any questions/comments/suggestions,</span>
                <span>or if you spot any errors!</span>
            </div>
        </footer>
    );
};

export default Footer;