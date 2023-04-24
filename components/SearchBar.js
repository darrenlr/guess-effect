import React, { useState } from "react";
import Select from "react-select";
import styles from "../styles/SearchBar.module.css";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const SearchBar = ({ onSearch }) => {
	const [selectedOption, setSelectedOption] = useState(null);
	const [options, setOptions] = useState([]);

	const handleSearch = async (inputValue) => {
		if (inputValue) {
			const apiKey = publicRuntimeConfig.RAWG_API_KEY;
			const response = await fetch(
				`https://api.rawg.io/api/games?key=${apiKey}&search=${inputValue}`
			);
			const data = await response.json();

			const gameOptions = data.results.map((game) => ({
				value: game.name,
				label: game.name,
			}));

			setOptions(gameOptions);
		} else {
			setOptions([]);
		}
	};

	const handleSubmit = () => {};

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
			<Select
				className={styles.searchInput}
				placeholder="Search video game names..."
				value={selectedOption}
				onChange={setSelectedOption}
				onInputChange={handleInputChange}
				options={options}
				filterOption={filterOption}
				noOptionsMessage={noOptionsMessage}
				isClearable
			/>
			<button className={styles.submitButton} onClick={handleSubmit}>
				Submit
			</button>
		</div>
	);
};

export default SearchBar;
