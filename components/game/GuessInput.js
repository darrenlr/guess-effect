import { useEffect, useId, useRef, useState } from "react";
import { loadSearchIndex, searchGames } from "../../hooks/useGameSearch";
import styles from "../../styles/game.module.css";

const MIN_CHARS = 3;

// Type to search the game index, pick a title from the list, then run it.
// Only real titles from the index can be submitted. Written as a plain ARIA
// combobox so the page doesn't need a select library.
export default function GuessInput({ onSubmit, disabled = false }) {
  const listId = useId();
  const [text, setText] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const latest = useRef(0);

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
      setOptions(results);
      setOpen(true);
    } catch {
      if (ticket === latest.current) setOptions([]);
    }
  };

  const choose = (option) => {
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

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open && options.length) choose(options[active >= 0 ? active : 0]);
      else submit();
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
        <div className={styles.guessField}>
          <input
            id={`${listId}-input`}
            className={styles.guessInput}
            type="text"
            inputMode="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="GUESS THE GAME..."
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
          {open && (
            <ul id={listId} role="listbox" className={styles.guessMenu}>
              {options.length === 0 ? (
                <li className={styles.guessEmpty}>No options</li>
              ) : (
                options.map((option, index) => (
                  <li
                    key={`${option.value}-${index}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    className={`${styles.guessOption} ${index === active ? styles.guessOptionActive : ""}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      choose(option);
                    }}
                    onMouseEnter={() => setActive(index)}
                  >
                    {option.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button type="button" className={styles.guessRun} onClick={submit} disabled={disabled || !selected}>
          [RUN]
        </button>
      </div>
    </div>
  );
}
