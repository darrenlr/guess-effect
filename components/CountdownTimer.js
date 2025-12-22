import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/CountdownTimer.module.css';

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const difference = nextMidnight - now;
    const timeLeft = {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearTimeout(timer);
  });

  return (
    <div className={styles.countdown}>
      NEXT GAME IN: {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </div>
  );
};

CountdownTimer.propTypes = {
  onFinish: PropTypes.func,
};

export default CountdownTimer;