/**
 * Animation Engine for Canvas Rendering
 * 
 * Provides smooth animations using requestAnimationFrame
 * - Node position interpolation
 * - Edge animation (flowing particles)
 * - Transition effects
 * - Performance optimization
 */

export class AnimationEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.animationId = null;
    this.isRunning = false;
    this.animations = new Map();
    this.particles = [];
    this.lastFrameTime = 0;
  }

  /**
   * Start animation loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this._animate();
  }

  /**
   * Stop animation loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main animation loop
   */
  _animate() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update animations
    this._updateAnimations(deltaTime);

    // Update particles
    this._updateParticles(deltaTime);

    // Continue animation loop
    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /**
   * Update all active animations
   * 
   * @param {number} deltaTime - Time since last frame (ms)
   */
  _updateAnimations(deltaTime) {
    for (const [id, animation] of this.animations.entries()) {
      animation.update(deltaTime);
      
      if (animation.isComplete()) {
        this.animations.delete(id);
      }
    }
  }

  /**
   * Update particle system
   * 
   * @param {number} deltaTime - Time since last frame (ms)
   */
  _updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return !particle.isDead();
    });
  }

  /**
   * Animate node position
   * 
   * @param {string} nodeId - Node ID
   * @param {object} from - Starting position {x, y}
   * @param {object} to - Target position {x, y}
   * @param {number} duration - Animation duration (ms)
   * @param {function} easing - Easing function
   * @returns {Promise} Resolves when animation completes
   */
  animateNodePosition(nodeId, from, to, duration = 500, easing = this.easeInOutQuad) {
    return new Promise((resolve) => {
      const animation = {
        nodeId,
        from,
        to,
        duration,
        elapsed: 0,
        easing,
        update: (deltaTime) => {
          this.elapsed += deltaTime;
          const progress = Math.min(this.elapsed / duration, 1);
          const eased = easing(progress);
          
          const current = {
            x: from.x + (to.x - from.x) * eased,
            y: from.y + (to.y - from.y) * eased
          };
          
          // Store current position (will be used by renderer)
          this.current = current;
        },
        isComplete: () => this.elapsed >= duration,
        getCurrent: () => {
          const progress = Math.min(this.elapsed / duration, 1);
          const eased = easing(progress);
          return {
            x: from.x + (to.x - from.x) * eased,
            y: from.y + (to.y - from.y) * eased
          };
        }
      };

      this.animations.set(nodeId, animation);
      
      // Resolve when complete
      const checkComplete = () => {
        if (animation.isComplete()) {
          resolve(animation.getCurrent());
        } else {
          requestAnimationFrame(checkComplete);
        }
      };
      checkComplete();
    });
  }

  /**
   * Add flowing particle to edge
   * 
   * @param {object} from - Starting position {x, y}
   * @param {object} to - Target position {x, y}
   * @param {number} speed - Particle speed (pixels per second)
   */
  addEdgeParticle(from, to, speed = 100) {
    const particle = {
      x: from.x,
      y: from.y,
      from,
      to,
      progress: 0,
      speed: speed / 1000, // Convert to pixels per millisecond
      update: (deltaTime) => {
        this.progress += this.speed * deltaTime;
        if (this.progress >= 1) {
          this.progress = 0; // Loop particle
        }
        
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        this.x = from.x + dx * this.progress;
        this.y = from.y + dy * this.progress;
      },
      isDead: () => false, // Particles loop forever
      render: (ctx) => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    this.particles.push(particle);
  }

  /**
   * Get current animated position for node
   * 
   * @param {string} nodeId - Node ID
   * @param {object} defaultPos - Default position if no animation
   * @returns {object} Current position {x, y}
   */
  getAnimatedPosition(nodeId, defaultPos) {
    const animation = this.animations.get(nodeId);
    if (animation) {
      return animation.getCurrent();
    }
    return defaultPos;
  }

  /**
   * Render particles
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderParticles(ctx) {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  /**
   * Easing functions
   */
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
}


