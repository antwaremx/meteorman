//Connection operations

const initializeConnections = (state) => {
	if (!state.ddpConnections.length) {
		state.ddpConnections.push({ title: 'Connection 1', collections: [], openEndpoints: [] });
	}
};

const addConnection = (state) => {
	let i = 1;
	let connectionName = 'Connection ' + i;
	while (state.ddpConnections.find(connection => connection.title === connectionName)) {
		i++;
		connectionName = 'Connection ' + i;
	}
	state.ddpConnections.push({ title: connectionName, collections: [], openEndpoints: [] });
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

const addElementToFolder = (state, { connectionName, collectionName, folderNames, element }) => {
	let folder = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName);

	for (let folderLevel = 0; folderLevel < folderNames.length; folderLevel++) {
		folder = folder.children.find(child => child.type === 'folder' && child.name === folderNames[folderLevel]);
	}
	folder.children.push(element);
};

const removeElementFromCollection = (state, { connectionName, collectionName, itemNames, element }) => {
	let item = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName);
	for (let itemLevel = 0; itemLevel < itemNames.length; itemLevel++) {
		item = item.children.find(child => child.type === 'folder' && child.name === itemNames[itemLevel]);
	}
	const elementIndex = item.children.findIndex(child => child.type === element.type && child.name === element.name);
	item.children.splice(elementIndex, 1);
};

// Open endpoints of connection

const initializeOpenEndpoints = (state, { connectionName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	if (!connection.openEndpoints.length) {
		connection.openEndpoints.push({ title: 'Endpoint 1', description: null, args: [] });
	}
};

const addOpenEndpointToConnection = (state, { connectionName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	let i = 1;
	let endpointName = 'Endpoint ' + i;
	while (connection.openEndpoints.find(endpoint => endpoint.title === endpointName)) {
		i++;
		endpointName = 'Endpoint ' + i;
	}
	connection.openEndpoints.push({ title: endpointName, description: null, args: [] });
};

const removeOpenEndpointOfConnection = (state, { connectionName, openEndpointName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	if (connection.openEndpoints.length > 1) {
		const endpointIndex = connection.openEndpoints.findIndex(openEndpoint => openEndpoint.title === openEndpointName);
		connection.openEndpoints.splice(endpointIndex, 1);
	}
};

const saveDescriptionOfOpenEndpoint = (state, { connectionName, openEndpointName, description }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	connection.openEndpoints.find(endpoint => endpoint.title === openEndpointName).description = description;
};

const saveNameOfOpenEndpoint = (state, { connectionName, openEndpointName, name, endpointType }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.title === openEndpointName);
	endpoint.name = name;
	endpoint.endpointType = endpointType;
};

const saveCollectionNameOfOpenEndpoint = (state, { connectionName, openEndpointName, collectionName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.title === openEndpointName);
	endpoint.collection = collectionName;
};

const saveArgOfOpenEndpoint = (state, { connectionName, openEndpointName, index, arg }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.title === openEndpointName);
	endpoint.args[index] = arg;
};

const removeArgOfOpenEndpoint = (state, { connectionName, openEndpointName, argIndex }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.title === openEndpointName);
	endpoint.args.splice(argIndex, 1);
};

export {
	initializeConnections,
	addConnection,
	removeConnection,
	addCollectionToConnection,
	removeCollectionOfConnection,
	addElementToCollection,
	addElementToFolder,
	removeElementFromCollection,
	initializeOpenEndpoints,
	addOpenEndpointToConnection,
	removeOpenEndpointOfConnection,
	saveDescriptionOfOpenEndpoint,
	saveNameOfOpenEndpoint,
	saveCollectionNameOfOpenEndpoint,
	saveArgOfOpenEndpoint,
	removeArgOfOpenEndpoint
};