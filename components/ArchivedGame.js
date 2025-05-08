import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
import useArchiveLocalStorage from "../hooks/useArchiveLocalStorage";
import usePlayerStats from "../hooks/usePlayerStats";
import { stripBrackets } from '../utils/stringUtils';
import styles from "../styles/ScoreSystem.module.css";

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; 

const getCollectionName = () => {
	const branch = process.env.NEXT_PUBLIC_BRANCH || 'main'; 
  
	if (branch === 'release') {
	  return "playerStats-release";
	}
  
	return "playerStats";
  };

const initialGameState = {
    date: null,
    releaseDate: "",
    hints: {
        publisher: false,
        developer: false,
        genre: false,
        platforms: false,
        modes: true,
        engine: true,
        metacritic: true,
        plot: false,
        boxArt: 40,
        points: 100,
    },
    life: {
        guesses: [],
        remainingGuessCount: 4,
        hearts: Array(4).fill("/images/heart.png"),
    },
    hasPlayed: false,
};

const ArchivedGame = ({ game, gameHistory, setGameHistory }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [archivedGameState, setArchivedGameState] = useArchiveLocalStorage(
		"ARCHIVED_GAME_STATE",
		initialGameState,
		game.date,
        game.releaseDate
	);
    const [playerStatsUpdated, setPlayerStatsUpdated] = useState(false);
    const { playerCount, globalAverageScore, globalAverageGuesses, globalWinners, globalHighScore } = usePlayerStats(playerStatsUpdated);

    const [isWrongGuess, setIsWrongGuess] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
    const [modalScore, setModalScore] = useState(null);

    const matchedScore = gameHistory.scores.find(
        (score) => score.date === game.date && score.releaseDate === game.releaseDate
    );

    const [animatedScore, setAnimatedScore] = useState(archivedGameState.hints.points);
    const [animatedBonus, setAnimatedBonus] = useState(archivedGameState.life.remainingGuessCount * 25);


    useEffect(() => {
        const targetScore = matchedScore ? matchedScore.score : archivedGameState.hints.points;
        const duration = 200;
        const stepTime = 50;
        const scoreDifference = targetScore - animatedScore;
        const steps = duration / stepTime;
        const stepSize = scoreDifference / steps;
    
        const intervalId = setInterval(() => {
          setAnimatedScore((prevScore) => {
            const nextScore = prevScore + stepSize;
            if ((stepSize > 0 && nextScore >= targetScore) || (stepSize < 0 && nextScore <= targetScore)) {
              clearInterval(intervalId);
              return targetScore;
            }
            return nextScore;
          });
        }, stepTime);
    
        return () => clearInterval(intervalId);
      }, [archivedGameState.hints.points]);

    const trackPlayer = async () => {
        const collectionName = getCollectionName();
        const today = new Date(game.date).toISOString().split("T")[0];
        const docRef = doc(db, collectionName, today);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            await updateDoc(docRef, { 
                count: docSnap.data().count + 1 ,
            });
        }
        
        const updatedDoc = await getDoc(docRef);
        return updatedDoc.exists() ? updatedDoc.data().count : null;
    };

    useEffect(() => {
        const targetBonus = archivedGameState.life.remainingGuessCount * 25;
        const duration = 200;
        const stepTime = 50;
        const bonusDifference = targetBonus - animatedBonus;
        const steps = duration / stepTime;
        const stepSize = bonusDifference / steps;
    
        const intervalId = setInterval(() => {
          setAnimatedBonus((prevBonus) => {
            const nextBonus = prevBonus + stepSize;
            if ((stepSize > 0 && nextBonus >= targetBonus) || (stepSize < 0 && nextBonus <= targetBonus)) {
              clearInterval(intervalId);
              return targetBonus;
            }
            return nextBonus;
          });
        }, stepTime);
    
        return () => clearInterval(intervalId);
    }, [archivedGameState.life.remainingGuessCount]);  

    const gameOverRef = useRef(null);

    const triggerGameOver = () => {
        setIsGuessCountUpdated(true);
    };

    const isGameOver = gameHistory.scores.some(scoreEntry => scoreEntry.date === game.date);

    const highestScore = useMemo(() => {
        if (gameHistory.scores.length > 0) {
        return gameHistory.scores.reduce((highScore, game) => 
            game.score > highScore ? game.score : highScore, 0);
        }
        return 0;
    }, [gameHistory]);
  
    const averageScore = useMemo(() => {
        if (gameHistory.scores.length > 0) {
        let totalScore = gameHistory.scores.reduce((total, game) => total + game.score, 0);
        return Math.round(totalScore / gameHistory.scores.length);
        }
        return 0;
    }, [gameHistory]);

    const calculateStreaks = (scores) => {
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
    
        for (let score of scores) {
            if (score.score > 0) {
                tempStreak++;
                currentStreak++;
            } else {
                tempStreak = 0;
                currentStreak = 0;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }
    
        return {
            currentStreak,
            longestStreak,
        };
    }	

    useEffect(() => {

            if (matchedScore) {
                handleGameOver(true)
            } else {
                setArchivedGameState({
                    ...initialGameState,
                    releaseDate: game.releaseDate,
                    date: game.date,
                    hasPlayed: false,
                  });
            }
          }, [matchedScore, game, archivedGameState.date, isGameOver]);

    useEffect(() => {
        if (game && game.releaseDate !== archivedGameState.releaseDate) {
          const existingGameEntry = gameHistory.scores.find(scoreEntry => scoreEntry.releaseDate === game.releaseDate);
          if (existingGameEntry) {
            setArchivedGameState((prevState) => ({
              ...prevState,
              hints: {
                ...prevState.hints,
                points: existingGameEntry.score
              }
            }));
            handleGameOver(existingGameEntry.score === 0);
          } else {
            setArchivedGameState({
              ...initialGameState,
              releaseDate: game.releaseDate
            });
          }
        }
      }, [game, archivedGameState.releaseDate, gameHistory.scores]);	  

    useEffect(() => {
        const updatedHearts = Array.from({ length: 4 }, (_, index) =>
            index < archivedGameState.life.remainingGuessCount
                ? "/images/heart.png"
                : "/images/heart-black.png"
        );
        setArchivedGameState((prevState) => ({
            ...prevState,
            life: {
                ...prevState.life,
                hearts: updatedHearts,
            },
        }));
    }, [archivedGameState.life.remainingGuessCount]);

    useEffect(() => {
        if (isGuessCountUpdated && archivedGameState.life.remainingGuessCount === 0) {
            handleGameOver(true);
          }
          setIsGuessCountUpdated(false);
        }, [isGuessCountUpdated, archivedGameState.life.remainingGuessCount]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsModalVisible(isGameOver);

        setModalScore(
            matchedScore
                ? matchedScore.score
                : archivedGameState.hints.points + (archivedGameState.life.remainingGuessCount * 25)
        );   
    }, [matchedScore, isGameOver]);

    useEffect(() => {
        gameOverRef.current = triggerGameOver;
    }, []);

    const handleGameOver = async (resetScore) => {
        let score = resetScore ? 0 : archivedGameState.hints.points;
        let finalScore = matchedScore ? matchedScore.score : (score + (archivedGameState.life.remainingGuessCount * 25));
        let usedGuesses = resetScore ? 4 : 4 - archivedGameState.life.remainingGuessCount;

        usedGuesses = usedGuesses === 0 ? 1 : usedGuesses;	

        setModalScore(finalScore);

        const { currentStreak, longestStreak } = calculateStreaks([...gameHistory.scores, {
            releaseDate: game.releaseDate,
            date: game.date,
            score: finalScore,
        }]);
    
        setArchivedGameState((prevState) => {
            const updatedGameState = {
              ...prevState,
              hints: {
                publisher: true,
                developer: true,
                genre: true,
                platforms: true,
                modes: true,
                engine: true,
                metacritic: true,
                plot: true,
                boxArt: 0,
                points: score,
              },
              hasPlayed: true,
            };
            
            // Save immediately to localStorage
            window.localStorage.setItem("ARCHIVED_GAME_STATE", JSON.stringify(updatedGameState));
            
            return updatedGameState;
        });


        if (!matchedScore) {
    
        setGameHistory((prevState) => ({
            ...prevState,
            wins: resetScore ? prevState.wins : prevState.wins + 1,
            games: prevState.games + 1,
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            scores: [
              ...prevState.scores,
              {
                releaseDate: game.releaseDate,
                date: game.date,
                score: finalScore,
              },
            ],
        }))
       

        await trackPlayer();

        setPlayerStatsUpdated(prev => !prev);

    };

        if (typeof twq === "function") {
            twq('event', 'tw-ou7tq-ou7tq', {
                value: finalScore,

            });
        }
    
        setModalScore(finalScore);
        setIsModalVisible(true);
    };	

    const onRevealHint = (points) => {
        setArchivedGameState((prevState) => ({
            ...prevState,
            hints: {
                ...prevState.hints,
                points: prevState.hints.points - points,
            },
        }));
    };

    const handleGuess = (guess) => {
        const cleanedGuess = stripBrackets(guess).toLowerCase();
        const cleanedGameTitle = stripBrackets(game.title).toLowerCase();

        if (cleanedGuess === cleanedGameTitle) {
            handleGameOver(false);
        } else {
            setArchivedGameState((prevState) => {
                let updatedGuesses = [...prevState.life.guesses, guess];
                let updatedRemainingGuessCount = prevState.life.remainingGuessCount - 1;
    
                return {
                    ...prevState,
                    life: {
                        ...prevState.life,
                        guesses: updatedGuesses,
                        remainingGuessCount: updatedRemainingGuessCount,
                    },				
                };
            });
    
            setIsWrongGuess(true);
            setTimeout(() => {
                setIsGuessCountUpdated(true);
                setIsWrongGuess(false);
            }, 500);
        }
    };	

    return isMounted ? (
        <div className={styles.container}>
            {game && <ReleaseDate date={game.releaseDate} region={game.region} archivedOn={game.date} />}
            {/* <div className={styles.players}>
                <p>
                    Players today: {playerCount}
Beatae aperiam et ir
            </div> */}
            {!matchedScore && (
					<>
            <div className={`${styles.stats} ${styles.statsMobile}`}>
                    <div className={styles.heartsContainer}>
                        {archivedGameState.life.hearts.map((heartSrc, index) => (
                            <Image
                                key={index}
                                src={heartSrc}
                                alt="Heart"
                                width={30}
                                height={30}
                                className={
                                    isWrongGuess &&
                                    index === archivedGameState.life.remainingGuessCount
                                        ? styles.blink
                                        : ""
                                }
                            />
                        ))}
                    </div>
                    <p>Bonus: {Math.round(animatedBonus)}</p>
                    <p>Score: {Math.round(animatedScore)}</p>
                </div>
                </>
				)}
            <SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />
            {game && archivedGameState && (
                <GameCard
                    gameData={game}
                    gameState={archivedGameState}
                    setGameState={setArchivedGameState}
                    onRevealHint={(points) => onRevealHint(points)}
                    isWrongGuess={isWrongGuess}
                    setIsGuessCountUpdated={setIsGuessCountUpdated}
                    isGameOver={isGameOver}
                />
            )}
            {/* <div className={`${styles.players} ${styles.playersMobile}`}>
                <p>
                        Players today: {playerCount}
                </p>
            </div> */}
            <div className={styles.statsContainer}>
            {!matchedScore && (
					<>
                <div>
                    <p>Misses: </p>
                    {archivedGameState.life.guesses.map((guess, index) => (
                        <p
                            key={index}
                            style={{
                                marginTop: "1rem",
                                fontSize: "0.8rem",
                            }}
                        >
                            {guess}
                        </p>
                    ))}
                </div>
                <div className={styles.stats}>
                    <div className={styles.heartsWrapper}>
                        <div className={styles.heartsContainer}>
                            {archivedGameState.life.hearts.map((heartSrc, index) => (
                                <Image
                                    key={index}
                                    src={heartSrc}
                                    alt="Heart"
                                    width={30}
                                    height={30}
                                    className={
                                        isWrongGuess &&
                                        index === archivedGameState.life.remainingGuessCount
                                            ? styles.blink
                                            : ""
                                    }
                                />
                            ))}
                        </div>
                        {/* <p
                            style={{
                                fontSize: "0.8rem",
                            }}
                        >
                            (x25)
                        </p> */}
                    </div>
                    <p>Bonus: {Math.round(animatedBonus)}</p>
                    <p>Score: {Math.round(animatedScore)}</p>
                </div>
                </>
				)}
            </div>
            <GameOverModal
                show={isModalVisible}
                gameTitle={game ? game.title : ""}
                score={modalScore}
                gamesPlayed={gameHistory.games}
                highestScore={highestScore}
                averageScore={averageScore}
                gamesWon={gameHistory.wins}
                remainingGuesses={archivedGameState.life.remainingGuessCount}
                releaseDate={game.releaseDate}
                gameWon={
					archivedGameState.hasOwnProperty('score')
					? archivedGameState.score > 0
					: archivedGameState.life.remainingGuessCount !== 0
				}
                archivedGame={true}
                onClose={() => setIsModalVisible(false)}
            />
        </div>
    ) : (
        <div className={styles.loader}></div>
    );
};

export default ArchivedGame;
