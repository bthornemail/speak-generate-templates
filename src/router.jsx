import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import CANVASL from './canvasl/CANVASL.jsx';
import ProjectiveView from './canvasl/views/ProjectiveView.jsx';
import AffineView from './canvasl/views/AffineView.jsx';
import DimensionalView from './canvasl/views/DimensionalView.jsx';

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
        },
        // Projective and Affine plane routes
        {
          path: 'projective',
          element: <ProjectiveView />
        },
        {
          path: 'affine',
          element: <AffineView />
        },
        // Dimensional routes (0D-4D)
        {
          path: '0D',
          element: <DimensionalView />
        },
        {
          path: '1D',
          element: <DimensionalView />
        },
        {
          path: '2D',
          element: <DimensionalView />
        },
        {
          path: '3D',
          element: <DimensionalView />
        },
        {
          path: '4D',
          element: <DimensionalView />
        },
        // Alternative dimensional route pattern
        {
          path: 'dimension/:dimension',
          element: <DimensionalView />
        }
      ]
    }
  ]);
}

