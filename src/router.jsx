import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import CANVASL from './canvasl/CANVASL.jsx';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <CANVASL />
        },
        {
          path: 'canvas',
          element: <CANVASL />
        },
        {
          path: 'canvas/:nodeId',
          element: <CANVASL />
        }
      ]
    }
  ]);
}

