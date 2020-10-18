const setResponseHeight = (state, { key, height }) => {
	state.responses[key] = height;
};

export {
	setResponseHeight
}
