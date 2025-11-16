/**
 * Animated Stars Background Component
 * 
 * Creates a beautiful animated starfield background with twinkling stars
 */

import { useEffect, useRef } from 'react';
import './StarsBackground.css';

export default function StarsBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing stars
    container.innerHTML = '';

    // Generate stars with different sizes and speeds
    const starCount = 200; // Number of stars
    const layers = 3; // Different depth layers

    for (let layer = 0; layer < layers; layer++) {
      const layerStars = Math.floor(starCount / layers);
      const size = 1 + layer * 0.5; // Different sizes per layer
      const speed = 0.5 + layer * 0.3; // Different animation speeds
      const opacity = 0.3 + layer * 0.2; // Different opacities

      for (let i = 0; i < layerStars; i++) {
        const star = document.createElement('div');
        star.className = `star star-layer-${layer}`;
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random animation delay for natural twinkling
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 3; // 2-5 seconds
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = opacity;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;
        
        container.appendChild(star);
      }
    }

    // Add some shooting stars occasionally
    const createShootingStar = () => {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      
      const startX = Math.random() * 100;
      const startY = Math.random() * 30; // Start from top area
      
      shootingStar.style.left = `${startX}%`;
      shootingStar.style.top = `${startY}%`;
      
      container.appendChild(shootingStar);
      
      // Remove after animation
      setTimeout(() => {
        if (shootingStar.parentNode) {
          shootingStar.remove();
        }
      }, 3000);
    };

    // Create shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        createShootingStar();
      }
    }, 5000);

    return () => {
      clearInterval(shootingStarInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className="stars-background" aria-hidden="true">
      {/* Stars are generated dynamically */}
    </div>
  );
}
