import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ScoreSystem from "../components/ScoreSystem";

const Home = () => {
	const [gameData, setGameData] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/gameData.json");
			const data = await response.json();
			setGameData(data);
		};

		fetchData();
	}, []);

	return (
		<div>
			<Navbar />
			<ScoreSystem gameData={gameData} />
		</div>
	);
};

export default Home;
