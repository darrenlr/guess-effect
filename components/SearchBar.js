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
			const response = await fetch(`/api/games?search=${inputValue}`);
			
			const data = await response.json();

			const gameOptions = data.results.map((game) => ({
				value: game.name,
				label: game.name,
			}));
	
			setOptions(gameOptions);
			setIsLoading(false);
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
		<div className={styles.searchContainer}>
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


        <div className={styles.loader}>
            <ThreeDots
                visible={isLoading}
                height="80"
                width="100%"
                color="#000"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>
  

			<button
				className={styles.submitButton}
				onClick={() => handleSubmit(selectedOption)}
				disabled={isGameOver || !selectedOption}
			>
				Submit
			</button>
		</div>
	);
};

export default SearchBar;
