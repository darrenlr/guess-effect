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

    const resultColor = won ? '#00ce7a' : '#ffbd3f';
    const resultText  = won ? '>>> SUCCESS <<<' : '>>> SKIPPED <<<';

    return (
        <div className={endlessStyles.modalOverlay}>
            <div className={endlessStyles.modal}>
                {/* Static scanline texture */}
                <div className={endlessStyles.modalScanlines} />
                {/* Animated scan beam */}
                <div className={endlessStyles.modalScanLine} />

                {/* Terminal header */}
                <div className={endlessStyles.modalHeader}>
                    {won ? 'RESULT.EXE — [SUCCESS]' : 'RESULT.EXE — [SKIP]'}
                </div>

                <div className={endlessStyles.modalBody}>
                    {/* Result */}
                    <div className={endlessStyles.modalResultText} style={{ color: resultColor }}>
                        {resultText}
                    </div>

                    {/* Game label + title */}
                    <div className={endlessStyles.modalGameLabel}>&gt; GAME_IDENTIFIED:</div>
                    <div className={endlessStyles.modalGameTitle}>{gameTitle}</div>

                    {/* Box art */}
                    {boxArt && (
                        <div className={endlessStyles.modalBoxArtFrame}>
                            <div className={endlessStyles.modalBoxArtInner}>
                                <Image
                                    src={boxArt}
                                    alt={gameTitle}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Lives */}
                    <div className={endlessStyles.modalLivesLabel}>&gt; LIVES_REMAINING</div>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Image
                                key={i}
                                src={i < animatedLives ? '/images/heart.png' : '/images/heart-black.png'}
                                alt="heart"
                                width={22}
                                height={22}
                            />
                        ))}
                        {/* Floating negative numbers */}
                        {floatingNumbers.map((num) => (
                            <div
                                key={num.id}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: '-50px',
                                    color: '#ff4444',
                                    fontFamily: 'var(--font-family)',
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

                    {/* Score block */}
                    <div className={endlessStyles.modalScoreBlock}>
                        <div className={endlessStyles.modalScoreLabel}>TOTAL_SCORE</div>
                        <div className={endlessStyles.modalScoreValue}>{animatedScore}</div>
                    </div>

                    {/* Continue button */}
                    <button
                        className={endlessStyles.continueButton}
                        onClick={onContinue}
                    >
                        <span className={endlessStyles.continueButtonText}>[ CONTINUE.EXE ]</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndlessGameCompletionModal;
