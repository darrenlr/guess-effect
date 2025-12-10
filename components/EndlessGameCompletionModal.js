import { useEffect, useState } from 'react';
import Image from 'next/image';
import endlessStyles from '../styles/EndlessMode.module.css';
import confetti from 'canvas-confetti';

const EndlessGameCompletionModal = ({ 
    show, 
    won, 
    gameTitle,
    boxArt, 
    totalScore,
    previousScore = 0,
    lives,
    previousLives,
    onContinue 
}) => {
    const [animatedScore, setAnimatedScore] = useState(previousScore);
    const [animatedLives, setAnimatedLives] = useState(previousLives || lives);
    const [floatingNumbers, setFloatingNumbers] = useState([]);

    useEffect(() => {
        if (show) {
            const confettiAnimation = confetti.create(undefined, {
                resize: true,
                useWorker: true,
            });

            if (won) {
                // Standard confetti for correct guesses
                confettiAnimation({
                    zIndex: 101,
                    particleCount: 1000,
                    spread: 80,
                    origin: { y: 0.4, x: 0.5 },
                    scalar: 0.6,
                });
            } else {
                // Defeated-style confetti for skipped games
                confettiAnimation({
                    zIndex: 101,
                    particleCount: 500,
                    spread: 80,
                    colors: ['#FF4500', '#FF6347', '#FFD700', '#FF8C00'],
                    origin: { y: 0.4, x: 0.5 },
                    scalar: 0.4,
                    drift: 0.5,
                });
            }

            // Reset animations when modal shows
            setAnimatedScore(previousScore);
            setAnimatedLives(previousLives || lives);
            setFloatingNumbers([]);
        }
    }, [show, won, previousScore, previousLives, lives]);

    // Animate score counting up
    useEffect(() => {
        if (!show) return;

        const startScore = previousScore;
        const endScore = totalScore;
        const duration = 1000;
        const startTime = Date.now();

        const animateScore = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (endScore - startScore) * easeOutCubic);
            
            setAnimatedScore(currentScore);

            if (progress < 1) {
                requestAnimationFrame(animateScore);
            }
        };

        // Start score animation after a short delay
        const scoreTimeout = setTimeout(() => {
            animateScore();
        }, 500);

        return () => clearTimeout(scoreTimeout);
    }, [show, previousScore, totalScore]);

    // Animate lives counting down with floating numbers (ENDLESS LOOP FOR TESTING)
    useEffect(() => {
        if (!show || !previousLives || previousLives === lives) return;

        const livesDifference = previousLives - lives;
        
        const startAnimation = () => {
            // Show the total lives lost as a single floating number
            const floatingId = Date.now();
            setFloatingNumbers([{ id: floatingId, value: -livesDifference }]);

            // Animate the lives counter counting down
            let currentLives = previousLives;
            let count = 0;

            const animateLives = () => {
                if (count < livesDifference) {
                    currentLives--;
                    setAnimatedLives(currentLives);
                    count++;
                    setTimeout(animateLives, 300);
                } else {
                    // Remove floating number after all lives are counted down
                    setTimeout(() => {
                        setFloatingNumbers([]);
                        
                        // Loop: restart animation after a delay
                        setTimeout(() => {
                            setAnimatedLives(previousLives);
                            startAnimation();
                        }, 2000);
                    }, 1500);
                }
            };

            animateLives();
        };

        // Start lives animation after score animation
        const livesTimeout = setTimeout(() => {
            startAnimation();
        }, 1600);

        return () => clearTimeout(livesTimeout);
    }, [show, previousLives, lives]);
    
    if (!show) return null;

    return (
        <div className={endlessStyles.modalOverlay}>
            <div className={endlessStyles.modal}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: won ? '#00ce7a' : '#ffbd3f', 
                        marginBottom: '1.5rem', 
                        fontSize: '2rem',
                        fontFamily: 'var(--font-family)'
                    }}>
                        {won ? '✓ Correct!' : '✗ Skipped'}
                    </h2>
                    
                    <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-family)' }}>the game was:</p>
                    
                    <h3 style={{ 
                        marginBottom: '1rem', 
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-family)'
                    }}>
                        {gameTitle}
                    </h3>

                    {boxArt && (
                        <div style={{ 
                            marginBottom: '2.5rem',
                            border: '2px solid #fff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            width: '200px',
                            height: '267px',
                            position: 'relative'
                        }}>
                            <Image
                                src={boxArt}
                                alt={gameTitle}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2rem',
                        marginBottom: '2rem',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-family)',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', position: 'relative' }}>
                            <strong>Lives:</strong>
                            <Image
                                src="/images/heart.png"
                                alt="Heart"
                                width={24}
                                height={24}
                            />
                            <span>x{animatedLives}</span>
                            {/* Floating negative numbers */}
                            {floatingNumbers.map((num) => (
                                <div
                                    key={num.id}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '-50px',
                                        color: '#ff4444',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        animation: 'floatUp 1.5s ease-out forwards',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {num.value}
                                </div>
                            ))}
                        </div>
                        <div style={{ 
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            border: '2px solid #00ff88',
                            fontFamily: 'var(--font-family)',
                            boxShadow: '0 0 15px rgba(0, 255, 136, 0.4), inset 0 0 15px rgba(0, 255, 136, 0.08)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#00ff88', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>TOTAL SCORE</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ff88', textShadow: '0 0 8px #00ff88' }}>{animatedScore}</div>
                        </div>
                    </div>

                    <button 
                        className={endlessStyles.continueButton}
                        onClick={onContinue}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndlessGameCompletionModal;
