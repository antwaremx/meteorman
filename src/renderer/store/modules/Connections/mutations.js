const initializeConnections = (state) => {
	if (!state.ddpConnections.length) {
		state.ddpConnections.push({ title: 'Connection 1', collections: [] });
	}
};

const addConnection = (state) => {
	let i = 1;
	let connectionName = 'Connection ' + i;
	while (state.ddpConnections.find(connection => connection.title === connectionName)) {
		i++;
		connectionName = 'Connection ' + i;
	}
	state.ddpConnections.push({ title: connectionName, collections: [] });
};

const removeConnection = (state, connectionName) => {
	if (state.ddpConnections.length > 1) {
		const connectionIndex = state.ddpConnections.findIndex(ddpConnection => ddpConnection.title === connectionName);
		state.ddpConnections.splice(connectionIndex, 1);
	}
};

const addCollectionToConnection = (state, { connectionName, collection }) => {
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName).collections.push(collection);
};

const removeCollectionOfConnection = (state, { connectionName, collectionIndex }) => {
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.splice(collectionIndex, 1);
};

//Collection operations

const addElementToCollection = (state, { connectionName, collectionName, element }) => {
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName)
		.children.push(element);
};

export {
	initializeConnections,
	addConnection,
	removeConnection,
	addCollectionToConnection,
	removeCollectionOfConnection,
	addElementToCollection
};