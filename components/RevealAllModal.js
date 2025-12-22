import React from "react";
import styles from "../styles/ConfirmModal.module.css";

const RevealAllModal = ({ isOpen, onCancel, onConfirm }) => {
	if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.terminalHeader}>C:\GAMES\CONFIRM.EXE</div>
                <div className={styles.modalContent}>
                    <p className={styles.confirmText}>Are you sure?</p>
                    <div className={styles.buttonContainer}>
                        <button className={`${styles.button} ${styles.cancelButton}`} onClick={onCancel}>[CANCEL]</button>
                        <button className={styles.button} onClick={onConfirm}>[CONFIRM]</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevealAllModal;
