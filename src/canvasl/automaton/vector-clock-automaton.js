/**
 * Vector Clock Automaton Base
 * 
 * Base class for automata with vector clock state tracking
 */

import { VectorClock } from './vector-clock.js';

/**
 * Base Vector Clock Automaton
 * 
 * Provides vector clock state tracking for distributed causality
 */
export class VectorClockAutomaton {
  constructor(id, metaLog = null) {
    this.id = id;
    this.metaLog = metaLog;
    this.vectorClock = new VectorClock(id);
    this.state = {
      id,
      dimension: 0,
      running: false,
      vectorClock: this.vectorClock.toMap(),
      cellCounts: {
        C0: 0,
        C1: 0,
        C2: 0,
        C3: 0,
        C4: 0
      }
    };
  }

  /**
   * Tick automaton (increment own vector clock)
   * 
   * @param {Object} swarm - Swarm context (optional)
   * @returns {Promise<void>}
   */
  async tick(swarm = null) {
    // Increment own tick
    this.vectorClock.tick();
    
    // Update state
    this.state.vectorClock = this.vectorClock.toMap();
    
    // Store tick in Meta-Log
    if (this.metaLog) {
      await this.storeTickInMetaLog();
    }
    
    // Execute automaton-specific tick logic
    await this.executeTick(swarm);
  }

  /**
   * Receive message from another automaton
   * 
   * @param {number} from - Sender automaton ID
   * @param {Object} message - Message object
   * @returns {Promise<void>}
   */
  async receive(from, message) {
    // Merge vector clock from message
    if (message.vectorClock) {
      const otherClock = message.vectorClock instanceof Map 
        ? message.vectorClock 
        : new Map(Object.entries(message.vectorClock));
      
      this.vectorClock = this.vectorClock.merge(otherClock);
      this.state.vectorClock = this.vectorClock.toMap();
    }
    
    // Store received message in Meta-Log
    if (this.metaLog) {
      await this.storeReceiveInMetaLog(from, message);
    }
    
    // Execute automaton-specific receive logic
    await this.executeReceive(from, message);
  }

  /**
   * Send message to another automaton
   * 
   * @param {number} to - Recipient automaton ID
   * @param {Object} message - Message object
   * @returns {Promise<void>}
   */
  async send(to, message) {
    // Include current vector clock in message
    const messageWithClock = {
      ...message,
      vectorClock: this.vectorClock.toMap(),
      from: this.id,
      timestamp: Date.now() // Optional metadata
    };
    
    // Store sent message in Meta-Log
    if (this.metaLog) {
      await this.storeSendInMetaLog(to, messageWithClock);
    }
    
    // Execute automaton-specific send logic
    await this.executeSend(to, messageWithClock);
  }

  /**
   * Get current state
   * 
   * @returns {Object} Current automaton state
   */
  getState() {
    return {
      ...this.state,
      vectorClock: this.vectorClock.toMap()
    };
  }

  /**
   * Check if this automaton happens before another
   * 
   * @param {number} otherId - Other automaton ID
   * @param {Map<number, number>} otherClock - Other automaton's vector clock
   * @returns {boolean} True if this happens before other
   */
  happensBefore(otherId, otherClock) {
    return this.vectorClock.happensBefore(otherClock);
  }

  /**
   * Check if this automaton is concurrent with another
   * 
   * @param {number} otherId - Other automaton ID
   * @param {Map<number, number>} otherClock - Other automaton's vector clock
   * @returns {boolean} True if concurrent
   */
  isConcurrent(otherId, otherClock) {
    return this.vectorClock.isConcurrent(otherClock);
  }

  /**
   * Get causal chain
   * 
   * @returns {Array<{automatonId: number, tick: number}>} Causal chain
   */
  getCausalChain() {
    return this.vectorClock.getCausalChain();
  }

  /**
   * Store tick in Meta-Log
   * 
   * @returns {Promise<void>}
   */
  async storeTickInMetaLog() {
    if (!this.metaLog || !this.metaLog.datalog) return;

    try {
      const tick = this.vectorClock.getTick();
      const fact = {
        predicate: 'automaton_tick',
        args: [this.id, this.id, tick]
      };

      if (this.metaLog.datalog.addFacts) {
        this.metaLog.datalog.addFacts([fact]);
      }
    } catch (error) {
      console.warn(`[Automaton ${this.id}] Failed to store tick in Meta-Log:`, error);
    }
  }

  /**
   * Store receive event in Meta-Log
   * 
   * @param {number} from - Sender automaton ID
   * @param {Object} message - Received message
   * @returns {Promise<void>}
   */
  async storeReceiveInMetaLog(from, message) {
    if (!this.metaLog || !this.metaLog.datalog) return;

    try {
      // Store vector clock ticks from received message
      if (message.vectorClock) {
        const clockFacts = Array.from(message.vectorClock.entries()).map(([peer, tick]) => ({
          predicate: 'automaton_tick',
          args: [this.id, peer, tick]
        }));

        if (this.metaLog.datalog.addFacts) {
          this.metaLog.datalog.addFacts(clockFacts);
        }
      }

      // Store receive event
      const receiveFact = {
        predicate: 'automaton_receive',
        args: [this.id, from, message.type || 'message']
      };

      if (this.metaLog.datalog.addFacts) {
        this.metaLog.datalog.addFacts([receiveFact]);
      }
    } catch (error) {
      console.warn(`[Automaton ${this.id}] Failed to store receive in Meta-Log:`, error);
    }
  }

  /**
   * Store send event in Meta-Log
   * 
   * @param {number} to - Recipient automaton ID
   * @param {Object} message - Sent message
   * @returns {Promise<void>}
   */
  async storeSendInMetaLog(to, message) {
    if (!this.metaLog || !this.metaLog.datalog) return;

    try {
      const sendFact = {
        predicate: 'automaton_send',
        args: [this.id, to, message.type || 'message']
      };

      if (this.metaLog.datalog.addFacts) {
        this.metaLog.datalog.addFacts([sendFact]);
      }
    } catch (error) {
      console.warn(`[Automaton ${this.id}] Failed to store send in Meta-Log:`, error);
    }
  }

  /**
   * Execute automaton-specific tick logic
   * Override in subclasses
   * 
   * @param {Object} swarm - Swarm context
   * @returns {Promise<void>}
   */
  async executeTick(swarm) {
    // Override in subclasses
  }

  /**
   * Execute automaton-specific receive logic
   * Override in subclasses
   * 
   * @param {number} from - Sender automaton ID
   * @param {Object} message - Received message
   * @returns {Promise<void>}
   */
  async executeReceive(from, message) {
    // Override in subclasses
  }

  /**
   * Execute automaton-specific send logic
   * Override in subclasses
   * 
   * @param {number} to - Recipient automaton ID
   * @param {Object} message - Message to send
   * @returns {Promise<void>}
   */
  async executeSend(to, message) {
    // Override in subclasses
  }
}

