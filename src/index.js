import React from 'react';
import ReactDOM from 'react-dom/client';

import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';

import KLine from './pages/k-line';
import LongRoll from './pages/long-roll';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div style={{ padding: 16, display: 'flex', flexDirection: 'column ` `' }}>
      <Link to="/long-roll">多头滚仓策略</Link>
      <Link to="/k-line">K线</Link>
    </div>,
  },
  {
    path: '/long-roll',
    element: <LongRoll />,
  },
  {
    path: '/k-line',
    element: <KLine />,
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

