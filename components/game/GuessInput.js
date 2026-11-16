import { useEffect, useId, useMemo, useRef, useState } from "react";
import { loadSearchIndex, searchGames } from "../../hooks/useGameSearch";
import styles from "../../styles/game.module.css";

const MIN_CHARS = 3;
const MAX_SHOWN = 4;

const keyOf = (name) => String(name || "").toLowerCase().trim();

// Type to search the game index, pick a title from the matches under the box,
// then run it. Only real titles from the index can be submitted, and a title
// you've already guessed is shown greyed out. Written as a plain ARIA combobox
// so the page doesn't need a select library.
export default function GuessInput({ onSubmit, disabled = false, guessed = [] }) {
  const listId = useId();
  const [text, setText] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const latest = useRef(0);
  const guessedKeys = useMemo(() => new Set(guessed.map(keyOf)), [guessed]);
  const isGuessed = (option) => guessedKeys.has(keyOf(option.value));

  // Start downloading the index now so the first keystroke feels instant.
  useEffect(() => {
    loadSearchIndex().catch((error) => console.warn("Search index failed to load:", error));
  }, []);

  const onChange = async (event) => {
    const value = event.target.value;
    setText(value);
    setSelected(null);
    setActive(-1);
    const ticket = ++latest.current;
    if (value.trim().length < MIN_CHARS) {
      setOptions([]);
      setOpen(false);
      return;
    }
    try {
      const results = await searchGames(value);
      if (ticket !== latest.current) return; // a newer keystroke has taken over
      setOptions(results.slice(0, MAX_SHOWN));
      setOpen(true);
    } catch {
      if (ticket === latest.current) setOptions([]);
    }
  };

  const choose = (option) => {
    if (isGuessed(option)) return;
    setSelected(option);
    setText(option.label);
    setOpen(false);
    setActive(-1);
  };

  const submit = () => {
    if (!selected || disabled) return;
    onSubmit(selected.value);
    setText("");
    setSelected(null);
    setOptions([]);
  };

  // Arrow keys skip over titles that were already guessed.
  const step = (from, direction) => {
    for (let i = 1; i <= options.length; i += 1) {
      const next = (from + direction * i + options.length * 2) % options.length;
      if (!isGuessed(options[next])) return next;
    }
    return -1;
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => step(index, 1));
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      setActive((index) => step(index < 0 ? 0 : index, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open && options.length) {
        const pick = active >= 0 ? options[active] : options.find((option) => !isGuessed(option));
        if (pick) choose(pick);
      } else submit();
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.guess}>
      <label htmlFor={`${listId}-input`} className={styles.guessLabel}>
        &gt; NAME_THE_GAME
      </label>
      <div className={styles.guessRow}>
        <input
          id={`${listId}-input`}
          className={styles.guessInput}
          type="text"
          inputMode="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type a game title"
          value={text}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => options.length && !selected && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        />
        <button type="button" className={styles.guessRun} onClick={submit} disabled={disabled || !selected}>
          [RUN]
        </button>
      </div>

      {open && (
        <ul id={listId} role="listbox" aria-label="Matching games" className={styles.matches}>
          {options.length === 0 ? (
            <li className={styles.matchEmpty}>No matching games</li>
          ) : (
            options.map((option, index) => {
              const done = isGuessed(option);
              return (
                <li
                  key={`${option.value}-${index}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  aria-disabled={done || undefined}
                  className={`${styles.match} ${index === active ? styles.matchActive : ""} ${done ? styles.matchDone : ""}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => !done && setActive(index)}
                >
                  {option.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={option.cover} alt="" width="22" height="30" loading="lazy" className={styles.matchThumb} />
                  ) : (
                    <span className={styles.matchThumb} aria-hidden="true" />
                  )}
                  <span className={styles.matchTitle}>{option.value}</span>
                  {option.year && <span className={styles.matchYear}>{option.year}</span>}
                  <span className={styles.matchNote}>{done ? "GUESSED" : ""}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
