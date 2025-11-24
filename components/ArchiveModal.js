import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Calendar from "react-calendar";
import styles from "../styles/Modal.module.css";
import 'react-calendar/dist/Calendar.css';

const ArchiveModal = ({ closeModal, gameHistory }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleClickOutside = (event) => {
        if (event.target.className === styles.modalOverlay) {
            closeModal();
        }
    };

    const minDate = new Date("2024-11-25");
    const maxDate = new Date();

    maxDate.setDate(maxDate.getDate() - 1);

    const getScoreForDate = (date) => {
        const dateString = date.toLocaleDateString('sv-SE');
        const scoreEntry = gameHistory.scores.find((entry) => entry.date === dateString);
        return scoreEntry ? scoreEntry.score : null;
    };
    
    const renderDayContents = ({ date }) => {
        if (date < minDate || date > maxDate) {
            return null;
        }
    
        const score = getScoreForDate(date);
        
        let backgroundColor = '#636363';
        if (score !== null) {
            if (score < 75) {
                backgroundColor = '#ff6874';
            } else if (score >= 75 && score <= 149) {
                backgroundColor = '#ffbd3f';
            } else {
                backgroundColor = '#00ce7a';
            }
        }
    
        return (
            <div className={styles.dotContainer}>
                {score !== null ? (
                    <div className={styles.score} style={{ backgroundColor }}>{score}</div>
                ) : (
                    <div className={styles.dot} style={{ backgroundColor }}></div>
                )}
            </div>
        );
    };

    // return (
	// 	<div className={styles.modalOverlay} onClick={handleClickOutside}>
	// 		<div className={styles.modal}>
	// 			<div className={styles.modalContainer}>
	// 				<h4>Archives</h4>
	// 				<div>Coming VERY soon...</div>
	// 				<a href='https://ko-fi.com/S6S7EDM09' target='_blank' rel='noreferrer noopener'>
	// 					<img height='36' style={{border: '0px', height: '36px'}} src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' alt='Buy Me a Coffee at ko-fi.com' />
	// 				</a>
	// 			</div>
	// 		</div>
	// 	</div>
	// );

    return (
        <div className={styles.modalOverlay} onClick={handleClickOutside}>
            {isOpen && (
                <div className={styles.calendarContainer}>
                    <Calendar
                        onChange={(date) => {
							    const dateString = date.toLocaleDateString('sv-SE');
							router.push(`/daily?date=${dateString}`);
                            
							setTimeout(() => {
                                setIsOpen(false);
                                closeModal();
                            }, 0);
						}}
						dateFormat="yyyy-MM-dd"
						minDate={minDate}
						maxDate={maxDate}
						tileContent={renderDayContents}
                    />
                </div>
            )}
        </div>
    );
};

export default ArchiveModal;
