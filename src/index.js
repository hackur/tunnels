import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import AppContainer from './containers/App';
import app from './reducers/app';
import debugMenu from 'debug-menu';


function startApp() {
  debugMenu.install();

  document.body.classList.add(
    'platform-' + process.platform
  );

  const store = createStore(app);
  const main = document.createElement('div');
  document.body.appendChild(main);
  render(
    <Provider store={store}>
      <AppContainer />
    </Provider>,
    main
  );
}

document.addEventListener('DOMContentLoaded', startApp);