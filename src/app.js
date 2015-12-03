'use strict';

const join = require('path').join;
const nunjucks = require('nunjucks');
const domDelegate = require('dom-delegate');
const electron = require('electron');
const model = require('./model');
const tunnelsState = require('./tunnels-state');
const co = require('co');
const editTunnel = require('./edit.js');

function refreshList() {
  const tunnels = model.allTunnels();
  const template = nunjucks.render(
    join(__dirname, 'menu.html'),
    { tunnels, isOpen: tunnelsState.isOpen }
  );

  document.querySelector('.sidebar').innerHTML = template;
  editTunnel(tunnels[0].tunnelId);
}

function * openTunnels() {
  const openAtStartup = model.toOpenOnStartup();

  try {
    yield openAtStartup.map(tunnel =>
      tunnelsState.toggleState(tunnel.tunnelId)
        .catch(err => {
          err.message = `Cannot open tunnel ${tunnel.tunnelName}:\n${err.message}`;
          throw err;
        })
    );
  } catch (err) {
    electron.remote.dialog.showErrorBox(
      'Cannot open tunnel.',
      err.message
    );
  }
}

function * setup() {
  const delegate = domDelegate(document.body);

  delegate.on('click', '.new-tunnel', () => {
    const tunnel = model.createTunnel();
    editTunnel(tunnel.tunnelId);
  });

  delegate.on('click', '.edit', (e, target) => {
    const tunnelId = target.dataset.tunnelId;
    editTunnel(tunnelId);
  });

  delegate.on('click', '.toggle-state', co.wrap( function *(e, target) {
    const tunnelId = target.dataset.tunnelId;
    try {
      yield tunnelsState.toggleState(tunnelId);
      refreshList();
    } catch (err) {
      electron.remote.dialog.showErrorBox(
        'Cannot open tunnel.',
        err.message
      );
    }
  }));

  delegate.on('click', '.delete', (e, target) => {
    const tunnelId = target.dataset.tunnelId;
    const tunnelName = model.getTunnel(tunnelId).tunnelName;
    const confirmed = electron.remote.dialog.showMessageBox({
      buttons: ['Yes', 'No'],
      type: 'question',
      title: 'confirm deletion',
      message: `Delete tunnel ${tunnelName}?`
    }) === 0;

    if (confirmed) {
      model.removeTunnel(tunnelId);
      target.parentElement.parentElement.remove();
    }
  });

  yield openTunnels();

  refreshList();

}

co(setup());


