import { useEffect } from 'react';
import Image from 'next/image';
import endlessStyles from '../styles/EndlessMode.module.css';
import confetti from 'canvas-confetti';

const EndlessGameCompletionModal = ({ 
    show, 
    won, 
    gameTitle, 
    totalScore, 
    lives,
    onContinue 
}) => {
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
        }
    }, [show, won]);
    
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
                        marginBottom: '2rem', 
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-family)'
                    }}>
                        {gameTitle}
                    </h3>

                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2rem',
                        marginBottom: '2rem',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-family)',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <strong>Lives:</strong>
                            <Image
                                src="/images/heart.png"
                                alt="Heart"
                                width={24}
                                height={24}
                            />
                            <span>x{lives}</span>
                        </div>
                        <div style={{ fontSize: '1.4rem' }}>
                            <strong>Total:</strong> <span>{totalScore}</span>
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
