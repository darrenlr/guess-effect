import React from "react";
import Select from "react-select";

let instanceCounter = 0;

const GameSelect = (props) => {
	const instanceId = `react-select-custom-id-${instanceCounter++}`;

	return <Select {...props} instanceId={instanceId} />;
};

export default GameSelect;
