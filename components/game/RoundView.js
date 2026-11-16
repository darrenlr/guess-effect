import { useEffect, useRef, useState } from "react";
import { MAX_ZOOM, ZOOM_COST, allHintsRevealed, zoomStep } from "../../lib/rules";
import { formatLongDate } from "../../lib/dates";
import Panel from "../ui/Panel";
import Stat from "../ui/Stat";
import Hearts from "../ui/Hearts";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import CoverZoom from "./CoverZoom";
import GuessInput from "./GuessInput";
import HintsPanel from "./HintsPanel";
import styles from "../../styles/game.module.css";

// The playing screen for one round. Daily, archive and endless all render
// this; the mode just supplies the round state, the lives, a few stat cells
// and what the actions do.
export default function RoundView({
  path, // window-title path, e.g. "DAILY\\#712"
  statusTitle,
  archivedOn,
  game,
  round,
  over,
  lives, // { total, remaining }
  stats,
  onGuess,
  onRevealHint,
  onZoomOut,
  onRevealAll,
  onAbort, // optional: give up once every clue is open
  statusFooter,
}) {
  const [palette, setPalette] = useState(null);
  const [back, setBack] = useState(0); // steps zoomed back in (view only, free)
  const [flash, setFlash] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const misses = round.life.guesses;
  const missCount = useRef(misses.length);

  const step = zoomStep(round);
  const view = Math.max(0, step - back);
  const atMax = step >= MAX_ZOOM && back === 0;
  const everythingOpen = allHintsRevealed(round);

  // A new cover starts fresh.
  useEffect(() => {
    setPalette(null);
    setBack(0);
  }, [game.releaseDate]);

  // Flash the cover and blink a heart when a guess misses.
  useEffect(() => {
    if (misses.length > missCount.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 500);
      missCount.current = misses.length;
      return () => clearTimeout(timer);
    }
    missCount.current = misses.length;
    return undefined;
  }, [misses.length]);

  const handleZoomOut = () => {
    if (back > 0) setBack(back - 1);
    else onZoomOut();
  };

  const background = palette ? `linear-gradient(to bottom, ${palette[0]}, ${palette[1] || palette[0]})` : undefined;
  const focus = Array.isArray(game.zoomFocus) ? game.zoomFocus : undefined;

  let zoomLabel = "[ZOOM_OUT]";
  if (atMax) zoomLabel = "[MAX_ZOOM]";
  else if (back === 0) zoomLabel = `[ZOOM_OUT] (-${ZOOM_COST})`;

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <Panel title={`C:\\GAMES\\${path}\\RELEASE_DATE.SYS`} className={styles.date}>
          <h2 className={styles.releaseDate}>
            {formatLongDate(game.releaseDate)} ({game.region})
          </h2>
          {archivedOn && <p className={styles.archived}>[Archived on: {archivedOn}]</p>}
        </Panel>

        <Panel title={statusTitle} className={styles.status}>
          <div className={styles.statusTop}>
            <Hearts total={lives.total} remaining={lives.remaining} blinkLast={flash} />
            <div className={styles.statGrid}>
              {stats.map((stat) => (
                <Stat key={stat.label} {...stat} />
              ))}
            </div>
          </div>
          {misses.length > 0 && (
            <div className={styles.misses}>
              <span className={styles.missesTitle}>&gt; MISSES:</span>
              <ul className={styles.missList}>
                {misses.map((guess, index) => (
                  <li key={`${guess}-${index}`}>- {guess}</li>
                ))}
              </ul>
            </div>
          )}
          {statusFooter}
        </Panel>

        <Panel
          title="COVER.IMG"
          aside={over ? "FULL_COVER" : `ZOOM ${view + 1}/${MAX_ZOOM + 1}`}
          className={`${styles.cover} ${flash ? styles.flash : ""}`}
          noBody
        >
          <div className={styles.coverBody} style={{ background }}>
            <div className={styles.stage}>
              <CoverZoom
                src={`https://${game.boxArtUrl}`}
                step={over ? MAX_ZOOM : view}
                revealed={over}
                focus={focus}
                label={over ? `Box art for ${game.title}` : "Box art, zoomed in on one detail"}
                onPalette={setPalette}
              />
            </div>
          </div>
          {!over && (
            <div className={styles.zoomBar}>
              <Button variant="solid" onClick={handleZoomOut} disabled={atMax} className={styles.zoomOut}>
                {zoomLabel}
              </Button>
              <Button onClick={() => setBack(back + 1)} disabled={view <= 0}>
                [ZOOM_IN]
              </Button>
              <div className={styles.dots} aria-hidden="true">
                {Array.from({ length: MAX_ZOOM + 1 }, (_, index) => (
                  <span key={index} className={index <= view ? styles.dotOn : styles.dot} />
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className={styles.right}>
        <Panel title={`C:\\GAMES\\${path}\\GAME.EXE`} className={styles.input}>
          <GuessInput onSubmit={onGuess} disabled={over} />
        </Panel>

        <HintsPanel hints={round.hints} data={game.hints} onReveal={onRevealHint} disabled={over} />

        {!over && (everythingOpen ? onAbort : true) && (
          <div className={styles.actions}>
            {everythingOpen ? (
              <Button variant="danger" onClick={() => setConfirm("abort")}>
                [ABORT]
              </Button>
            ) : (
              <Button onClick={() => setConfirm("reveal")}>[REVEAL_ALL.exe] (-{round.hints.points})</Button>
            )}
          </div>
        )}
      </div>

      {confirm === "reveal" && (
        <ConfirmModal
          title="C:\GAMES\REVEAL_ALL.EXE"
          message="Reveal every clue? You'll give up the points you have left for this game."
          confirmLabel="[REVEAL_ALL]"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            onRevealAll();
          }}
        />
      )}
      {confirm === "abort" && (
        <ConfirmModal
          title="C:\GAMES\ABORT.EXE"
          message="Give up on this game? It will end with no score."
          confirmLabel="[ABORT]"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            onAbort();
          }}
        />
      )}
    </div>
  );
}
