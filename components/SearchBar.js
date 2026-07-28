import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { ThreeDots } from "react-loader-spinner";
import GameSelect from "./GameSelect";
import styles from "../styles/SearchBar.module.css";

// Maximum options to show in the dropdown for a single query.
const MAX_RESULTS = 20;

// The local IGDB search index is fetched once and shared across every SearchBar
// instance (daily / endless / archive). We cache both the in-flight promise and
// the built Fuse instance at module scope so the ~1MB index is loaded and
// indexed a single time per page load.
let fuseInstance = null;
let fusePromise = null;

function getFuse() {
	if (fuseInstance) return Promise.resolve(fuseInstance);
	if (!fusePromise) {
		fusePromise = fetch("/games-index.json")
			.then((res) => res.json())
			.then((data) => {
				fuseInstance = new Fuse(data.games, {
					keys: [
						{ name: "name", weight: 0.7 },
						{ name: "alternativeNames", weight: 0.3 },
					],
					threshold: 0.3,
					ignoreLocation: true,
					minMatchCharLength: 2,
				});
				return fuseInstance;
			})
			.catch((error) => {
				// Allow a later attempt to retry the fetch instead of caching failure.
				fusePromise = null;
				throw error;
			});
	}
	return fusePromise;
}

// Release year from an IGDB first_release_date (unix seconds), or null.
function releaseYear(firstReleaseDate) {
	if (!firstReleaseDate) return null;
	return new Date(firstReleaseDate * 1000).getUTCFullYear();
}

// Display label: bare title, disambiguated by year when available
// (e.g. "Doom (2016)"). The submitted value stays the bare title so guess
// matching against game.title is unchanged.
function optionLabel(game) {
	const year = releaseYear(game.firstReleaseDate);
	return year ? `${game.name} (${year})` : game.name;
}

const SearchBar = ({ onSubmit, isGameOver, currentGame, isArchived, gameDate, gameNumber }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [options, setOptions] = useState([]);
	const [hudColor, setHudColor] = useState('#00ff41');

	useEffect(() => {
		// Get the computed HUD color from CSS variable
		const computedColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--hud-color').trim();
		if (computedColor) {
			setHudColor(computedColor);
		}
	}, []);

	useEffect(() => {
		// Warm the search index on mount so the first keystroke is instant.
		getFuse().catch((error) => console.error('Error loading search index:', error));
	}, []);

	const handleSearch = async (inputValue) => {
		if (inputValue.length > 2) {
			setIsLoading(true);
			try {
				const fuse = await getFuse();
				const gameOptions = fuse
					.search(inputValue, { limit: MAX_RESULTS })
					.map(({ item }) => ({
						value: item.name,
						label: optionLabel(item),
					}));
				setOptions(gameOptions);
			} catch (error) {
				console.error('Error searching games:', error);
				setOptions([]);
			} finally {
				setIsLoading(false);
			}
		} else {
			setOptions([]);
		}
	};

	const handleSubmit = (selectedOption) => {
		onSubmit(selectedOption.value);
		setSelectedOption(null);
	};

	const handleInputChange = (inputValue) => {
		handleSearch(inputValue);
	};

	// Fuse has already filtered and ranked the options (including matches on
	// alternative names, which won't appear in option.value), so bypass
	// react-select's own substring filtering and show them in Fuse's order.
	const filterOption = () => true;

	const noOptionsMessage = () => {
		return "No Options";
	};

	const customStyles = {
		control: (base) => ({
			...base,
			background: 'transparent',
			border: 'none',
			borderBottom: `2px solid ${hudColor}`,
			borderRadius: 0,
			boxShadow: 'none',
			'&:hover': {
				borderBottom: `2px solid ${hudColor}`,
			},
		}),
		valueContainer: (base) => ({
			...base,
			background: 'transparent',
			padding: '4px',
		}),
		input: (base) => ({
			...base,
			color: hudColor,
		}),
		singleValue: (base) => ({
			...base,
			color: hudColor,
		}),
		placeholder: (base) => ({
			...base,
			color: hudColor,
			opacity: 0.6,
		}),
		indicatorSeparator: () => ({
			display: 'none',
		}),
		dropdownIndicator: () => ({
			display: 'none',
		}),
		menu: (base) => ({
			...base,
			background: '#000',
			border: `2px solid ${hudColor}`,
			borderRadius: 0,
			boxShadow: 'none',
		}),
		menuPortal: (base) => ({
			...base,
			zIndex: 9999,
		}),
		menuList: (base) => ({
			...base,
			background: '#000',
			padding: 0,
		}),
		option: (base, state) => ({
			...base,
			background: state.isFocused ? `${hudColor}33` : '#000',
			color: hudColor,
			fontFamily: 'Share Tech Mono, monospace',
			fontSize: '14px',
			cursor: 'pointer',
			'&:hover': {
				background: `${hudColor}33`,
			},
		}),
	};

	return (
		<div className={styles.searchWrapper}>
			<div className={styles.terminalHeader}>
                { currentGame ? (
                    <span>C:\GAMES\ENDLESS\GAME_{currentGame}\GAME.EXE</span>
                ) : <span>C:\GAMES\{isArchived ? `ARCHIVE\\#${gameNumber}` : `DAILY\\#${gameNumber}`}\GAME.EXE</span>
                }
                <span>[█][▓][X]</span>

			</div>
			<div className={styles.searchContainer}>
  				<div className={styles.inputLine}>
					<span className={styles.promptSymbol}>&gt;</span>
  					<div className={styles.inputWrapper}>
    				<GameSelect
      					className={styles.searchInput}
      					styles={customStyles}
      					placeholder="GUESS THE GAME..."
      					value={selectedOption}
      					onChange={setSelectedOption}
      					onInputChange={handleInputChange}
      					options={options}
      					filterOption={filterOption}
      					noOptionsMessage={noOptionsMessage}
      					isClearable
      					isDisabled={isGameOver}
      					menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      					menuPosition="fixed"
    				/>
    				{isLoading && (
      					<div className={styles.loader}>
        					<ThreeDots
          						height="20"
          						width="20"
          						color="#000"
          						ariaLabel="three-dots-loading"
        					/>
      					</div>
    				)}
  					</div>
  					<button
    					className={styles.submitButton}
    					onClick={() => handleSubmit(selectedOption)}
    					disabled={isGameOver || !selectedOption}
  					>
    					[RUN]
  					</button>
				</div>
			</div>
		</div>
	);
};

export default SearchBar;
