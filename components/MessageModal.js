import React, { useState, useEffect } from "react";
import styles from "../styles/Modal.module.css";

const MessageModal = ({ messageKey, messageContent }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenMessage = localStorage.getItem(messageKey);
        if (!hasSeenMessage) {
            setIsVisible(true);
        }
    }, [messageKey]);

    const handleClickOutside = (event) => {
        if (event.target.className === styles.modalOverlay) {
            localStorage.setItem(messageKey, "true");
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClickOutside}>
            <div className={styles.modal}>
	 			<div className={styles.modalContainer}>
                    <h3>UPDATE</h3>
	 				<div>{messageContent}</div>
                    <div> If you have any issues, feel free to contact me via <a href="mailto:drussell.dev@gmail.com">email</a> or reach out on social media.</div>
                    <div>Follow Guess Effect for free daily hints!</div>
                    <div className={styles.socialLinks}>
                        <a href="https://x.com/guesseffectwtf" target="_blank" rel="noreferrer noopener">
                            <img
                                style={{ border: "0px", height: "20px" }}
                                src="/x-logo-white.png"
                                alt="Follow me on X"
                            />
                        </a>
                    </div>
	 			</div>
	 		</div>
        </div>
    );
};

export default MessageModal;