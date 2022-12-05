import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider, Link, createHashRouter } from 'react-router-dom';

import KLine from './pages/k-line';
import LongRoll from './pages/long-roll';
import ShortRoll from './pages/short-roll';

import './index.css';

const router = createHashRouter([
  {
    path: '/',
    element: <div style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
      <Link to="/long-roll">多头滚仓策略</Link>
      <Link to="/short-roll">空头滚仓策略</Link>
      <Link to="/k-line">K线</Link>
    </div>,
  },
  {
    path: '/long-roll',
    element: <LongRoll />,
  },
  {
    path: '/short-roll',
    element: <ShortRoll />,
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

