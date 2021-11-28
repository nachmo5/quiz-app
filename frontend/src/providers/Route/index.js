import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes.js';

const RouteProvider = () => {
  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </Router>
  );
};

export default RouteProvider;
