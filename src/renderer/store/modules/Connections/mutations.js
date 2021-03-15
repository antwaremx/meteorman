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
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName).collections.push({
		...collection,
		id: collection.name
	});
};

const removeCollectionOfConnection = (state, { connectionName, collectionIndex }) => {
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.splice(collectionIndex, 1);
};

//Collection operations

const addElementToCollection = (state, { connectionName, collectionName, element }) => {
	state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName)
		.children.push({ ...element, id: `${ collectionName }-${ element.name }` });
};

const addElementToFolder = (state, { connectionName, collectionName, folderNames, element }) => {
	let folder = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName);
	let folderIndexes = [];
	for (let folderLevel = 0; folderLevel < folderNames.length; folderLevel++) {
		const folderIndex = folder.children.findIndex(child => child.type === 'folder' && child.name === folderNames[folderLevel]);
		folderIndexes.push(folderIndex);
		folder = folder.children[folderIndex];
	}
	folder.children.push({
		...element,
		id: `${ collectionName }-${ folderIndexes.toString().replaceAll(',', '') }-${ element.name }`
	});
};

const removeElementFromCollection = (state, { connectionName, collectionName, itemNames, element }) => {
	let item = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName)
		.collections.find(collection => collection.name === collectionName);
	for (let itemLevel = 0; itemLevel < itemNames.length; itemLevel++) {
		item = item.children.find(child => child.type === 'folder' && child.name === itemNames[itemLevel]);
	}
	const elementIndex = item.children.findIndex(child => child.id === element.id);
	item.children.splice(elementIndex, 1);
};

// Open endpoints of connection

const initializeOpenEndpoints = (state, { connectionName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	if (!connection.openEndpoints.length) {
		connection.openEndpoints.push({ id: 'endpoint-1', title: 'Endpoint 1', description: null, args: [] });
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
	const id = 'endpoint-' + i;
	connection.openEndpoints.push({ id, title: endpointName, description: null, args: [] });
};

const removeOpenEndpointOfConnection = (state, { connectionName, openEndpointId }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	if (connection.openEndpoints.length > 1) {
		const endpointIndex = connection.openEndpoints.findIndex(openEndpoint => openEndpoint.id === openEndpointId);
		connection.openEndpoints.splice(endpointIndex, 1);
	}
};

const saveDescriptionOfOpenEndpoint = (state, { connectionName, openEndpointId, description }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	connection.openEndpoints.find(endpoint => endpoint.id === openEndpointId).description = description;
};

const saveNameOfOpenEndpoint = (state, { connectionName, openEndpointId, name, endpointType }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.id === openEndpointId);
	endpoint.name = name;
	endpoint.endpointType = endpointType;
};

const saveCollectionNameOfOpenEndpoint = (state, { connectionName, openEndpointId, collectionName }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.id === openEndpointId);
	endpoint.collection = collectionName;
};

const saveArgOfOpenEndpoint = (state, { connectionName, openEndpointId, index, arg }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.id === openEndpointId);
	endpoint.args[index] = arg;
};

const removeArgOfOpenEndpoint = (state, { connectionName, openEndpointId, argIndex }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	const endpoint = connection.openEndpoints.find(endpoint => endpoint.id === openEndpointId);
	endpoint.args.splice(argIndex, 1);
};

const saveOpenEndpointInCollection = (state, { connectionName, openEndpoint, indexesByFolder }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	let folder = connection.collections[indexesByFolder.shift()];
	const collectionName = folder.name;
	let folderIndexes = [];
	for (let folderIndex of indexesByFolder) {
		folder = folder.children[folderIndex];
		folderIndexes.push(folderIndex);
	}
	const folderIndexesString = folderIndexes.toString().replaceAll(',', '');
	folder.children.push({
		...openEndpoint,
		type: 'endpoint',
		id: `${ collectionName }-${ indexesByFolder.length ? (folderIndexesString + '-') : '' }${ openEndpoint.name }`
	});
};

const openEndpointFromCollection = (state, { connectionName, endpoint }) => {
	const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
	if (!connection.openEndpoints.find(openEndpoint => openEndpoint.id === endpoint.id)) {
		connection.openEndpoints.push({ ...endpoint, title: endpoint.name });
	}
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
	removeArgOfOpenEndpoint,
	saveOpenEndpointInCollection,
	openEndpointFromCollection
};