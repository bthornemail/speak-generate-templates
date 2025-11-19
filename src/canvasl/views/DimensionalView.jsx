/**
 * Dimensional View Component
 * 
 * Wrapper component that filters and displays canvas content based on dimension (0D-4D)
 */

import { useParams } from 'react-router-dom';
import CANVASL from '../CANVASL.jsx';

export default function DimensionalView() {
  const { dimension } = useParams();
  
  // Parse dimension from URL
  // Route can be "/0D" or "/dimension/0D"
  let dim = null;
  if (dimension) {
    // Handle "0D" format
    const match = dimension.match(/(\d+)D/);
    if (match) {
      dim = parseInt(match[1]);
    } else {
      // Handle numeric format
      dim = parseInt(dimension);
    }
  }
  
  // Validate dimension is 0-4
  if (dim !== null && (dim < 0 || dim > 4)) {
    dim = null;
  }
  
  return (
    <CANVASL 
      filterDimension={dim}
      viewType="dimensional"
    />
  );
}

