import React from 'react';
import ReactDOM from 'react-dom';
import DataProvider from './providers/Data';
import RouteProvider from './providers/Route/index.js';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <DataProvider>
      <RouteProvider />
    </DataProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
