const ipcRenderer = require('electron').ipcRenderer;

const sendActions = (actionTypes = []) => () => next => action => {
	const result = next(action);
	console.log('renderer: sendActions', action)

	if (actionTypes.indexOf(action.type) !== -1) {
		ipcRenderer.send('xproc-redux', action);
	}

	return result;
};

const receiveActions = dispatch => {
	ipcRenderer.on('xproc-redux', (event, arg) => {
		console.log('renderer: receiveActions', arg)
		dispatch(arg);
	});
};

module.exports = {sendActions, receiveActions};
