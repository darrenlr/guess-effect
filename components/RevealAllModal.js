import React from "react";
import styles from "../styles/GameOverModal.module.css";

const RevealAllModal = ({ isOpen, onCancel, onConfirm }) => {
	if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <p className={styles.revealConfirmText}>Are you sure?</p>
			    <div className={styles.revealModalContainer}>
                    <button className="hintButton" onClick={onCancel}>Cancel</button>
                    <button className="hintButton" onClick={onConfirm}>Reveal All</button>
                </div>
            </div>
        </div>
    );
};

export default RevealAllModal;