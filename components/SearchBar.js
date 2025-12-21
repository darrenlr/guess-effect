import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import GameSelect from "./GameSelect";
import styles from "../styles/SearchBar.module.css";

const SearchBar = ({ onSubmit, isGameOver }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [options, setOptions] = useState([]);

	const handleSearch = async (inputValue) => {
		if (inputValue.length > 2) {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/games?search=${inputValue}`);
				
				const data = await response.json();

				// Check if data.results exists before mapping
				if (data && data.results && Array.isArray(data.results)) {
					const gameOptions = data.results.map((game) => ({
						value: game.name,
						label: game.name,
					}));
					setOptions(gameOptions);
				} else {
					console.error('API response missing results:', data);
					setOptions([]);
				}
			} catch (error) {
				console.error('Error fetching games:', error);
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

	const filterOption = (option, inputValue) => {
		if (typeof option.value !== "string") {
			return false;
		}

		const value = option.value.toLowerCase();
		const input = inputValue.toLowerCase().trim();

		return value.includes(input);
	};

	const noOptionsMessage = () => {
		return "No Options";
	};

	return (
		<div className={styles.searchWrapper}>
			<div className={styles.terminalHeader}>
				<span>C:\\GAMES\\DAILY\\GAME.EXE</span>
				<span>[█][▓][X]</span>
			</div>
			<div className={styles.searchContainer}>
				<div className={styles.queryPrompt}>QUERY&gt;</div>
  				<div className={styles.inputWrapper}>
    				<GameSelect
      					className={styles.searchInput}
      					placeholder="Guess the game..."
      					value={selectedOption}
      					onChange={setSelectedOption}
      					onInputChange={handleInputChange}
      					options={options}
      					filterOption={filterOption}
      					noOptionsMessage={noOptionsMessage}
      					isClearable
      					isDisabled={isGameOver}
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
    				[SUBMIT]
  				</button>
			</div>
		</div>
	);
};

export default SearchBar;
