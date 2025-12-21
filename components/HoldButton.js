import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/EndlessMode.module.css';

const HoldButton = ({ onComplete, children, className, holdDuration = 2000, disabled = false }) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    const startHold = () => {
        if (disabled) return;
        
        setIsHolding(true);
        startTimeRef.current = Date.now();
        
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
            setProgress(newProgress);
            
            if (newProgress >= 100) {
                clearInterval(intervalRef.current);
                setIsHolding(false);
                setProgress(0);
                onComplete();
            }
        }, 50);
    };

    const stopHold = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsHolding(false);
        setProgress(0);
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <button
            className={`${styles.holdButton} ${className}`}
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            disabled={disabled}
            style={{ 
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            <div className={styles.holdProgress} style={{ width: `${progress}%` }} />
            <span className={styles.buttonText}>{children}</span>
        </button>
    );
};

export default HoldButton;
