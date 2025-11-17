/**
 * WASM ML Engine
 * 
 * WASM ML engine for automaton state embeddings using TensorFlow.js WASM backend
 * Generates embeddings for automaton states, enabling semantic search
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import { ModelImportExport } from './model-import-export.js';

// Set WASM paths (CDN)
setWasmPaths('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.15.0/dist/');

/**
 * WASM ML Engine for Automaton State Embeddings
 */
export class WASMMLEngine {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.embeddingCache = new Map(); // Cache embeddings by state hash
    this.modelImportExport = new ModelImportExport();
  }

  /**
   * Initialize WASM backend and load embedding model
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Set WASM backend
      await tf.setBackend('wasm');
      await tf.ready();

      console.log('[WASM ML] Backend initialized:', tf.getBackend());

      // Load or create embedding model
      this.model = await this.loadEmbeddingModel();

      this.initialized = true;
      console.log('[WASM ML] Engine initialized');
    } catch (error) {
      console.error('[WASM ML] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for automaton state
   * 
   * @param {Object} state - Automaton state with vector clock
   * @returns {Promise<Float32Array>} Embedding vector
   */
  async embedAutomatonState(state) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check cache
    const stateHash = this.hashState(state);
    if (this.embeddingCache.has(stateHash)) {
      return this.embeddingCache.get(stateHash);
    }

    // Extract features from automaton state
    const features = this.extractFeatures(state);

    // Convert to tensor
    const inputTensor = tf.tensor2d([features]);

    // Generate embedding
    const embeddingTensor = this.model.predict(inputTensor);
    const embeddingArray = await embeddingTensor.data();

    // Cleanup tensors
    inputTensor.dispose();
    embeddingTensor.dispose();

    // Convert to Float32Array
    const embedding = new Float32Array(embeddingArray);

    // Cache embedding
    this.embeddingCache.set(stateHash, embedding);

    return embedding;
  }

  /**
   * Extract features from automaton state for embedding
   * 
   * @param {Object} state - Automaton state
   * @returns {number[]} Feature vector
   */
  extractFeatures(state) {
    const features = [];

    // 1. Vector clock features
    const clock = state.vectorClock || new Map();
    const maxAutomatonId = Math.max(...Array.from(clock.keys()), 10); // Support up to 10 automata
    for (let i = 0; i <= maxAutomatonId; i++) {
      features.push(clock.get(i) || 0);
    }

    // 2. Dimensional features (0D-7D)
    features.push(state.dimension || 0);
    features.push(state.betti?.length || 0);
    features.push(state.euler || 0);

    // 3. State features
    const cellCounts = state.cellCounts || {};
    features.push(cellCounts.C0 || 0);
    features.push(cellCounts.C1 || 0);
    features.push(cellCounts.C2 || 0);
    features.push(cellCounts.C3 || 0);
    features.push(cellCounts.C4 || 0);

    // 4. Network features
    features.push(state.peerCount || 0);
    features.push(state.activeAppCount || 0);

    // 5. Running state (binary)
    features.push(state.running ? 1 : 0);

    // Normalize features
    return this.normalizeFeatures(features);
  }

  /**
   * Load or create embedding model
   * 
   * @returns {Promise<tf.LayersModel>} Embedding model
   */
  async loadEmbeddingModel() {
    // Try to load from IndexedDB cache
    try {
      const cached = await tf.io.loadModel('indexeddb://automaton-embedding-model');
      console.log('[WASM ML] Loaded cached model from IndexedDB');
      return cached;
    } catch (error) {
      console.log('[WASM ML] No cached model found, creating new model');
      // Create new model if not cached
      const model = this.createEmbeddingModel();
      
      // Save to IndexedDB for future use
      try {
        await model.save('indexeddb://automaton-embedding-model');
        console.log('[WASM ML] Saved model to IndexedDB');
      } catch (saveError) {
        console.warn('[WASM ML] Failed to save model to IndexedDB:', saveError);
      }
      
      return model;
    }
  }

  /**
   * Create embedding model architecture
   * 
   * @returns {tf.LayersModel} Embedding model
   */
  createEmbeddingModel() {
    // Input size: variable (depends on number of automata + features)
    // For now, use fixed size: 11 (automata) + 3 (dimension features) + 5 (cell counts) + 2 (network) + 1 (running) = 22
    const inputSize = 22;

    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.dense({
          inputShape: [inputSize],
          units: 256,
          activation: 'relu',
          name: 'input'
        }),
        // Hidden layers
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          name: 'hidden1'
        }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'hidden2'
        }),
        // Output layer (embedding dimension)
        tf.layers.dense({
          units: 384,
          activation: 'linear',
          name: 'embedding'
        })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    console.log('[WASM ML] Created embedding model');
    return model;
  }

  /**
   * Normalize features to [0, 1] range
   * 
   * @param {number[]} features - Feature values
   * @returns {number[]} Normalized features
   */
  normalizeFeatures(features) {
    if (features.length === 0) return features;

    const max = Math.max(...features.map(Math.abs), 1);
    return features.map(f => Math.max(0, Math.min(1, f / max)));
  }

  /**
   * Compute cosine similarity between embeddings
   * 
   * @param {Float32Array} embedding1 - First embedding
   * @param {Float32Array} embedding2 - Second embedding
   * @returns {number} Cosine similarity (0-1)
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Hash state for caching
   * 
   * @param {Object} state - Automaton state
   * @returns {string} State hash
   */
  hashState(state) {
    const clockStr = Array.from(state.vectorClock || new Map())
      .sort(([a], [b]) => a - b)
      .map(([id, tick]) => `${id}:${tick}`)
      .join(',');
    
    return `${state.id}-${state.dimension}-${clockStr}-${state.running ? 1 : 0}`;
  }

  /**
   * Clear embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
  }

  /**
   * Check if engine is initialized
   * 
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Export model to file
   * 
   * @param {string} format - Export format ('json', 'weights', 'full')
   * @returns {Promise<Blob>} Model file blob
   */
  async exportModel(format = 'json') {
    if (!this.model) {
      throw new Error('No model to export');
    }

    return await this.modelImportExport.exportModel(this.model, format);
  }

  /**
   * Import model from file
   * 
   * @param {File|Blob|string} source - Model source
   * @param {Object} options - Import options
   * @returns {Promise<void>}
   */
  async importModel(source, options = {}) {
    const importedModel = await this.modelImportExport.importModel(source, options);
    
    // Replace current model
    if (this.model) {
      this.model.dispose();
    }
    
    this.model = importedModel;
    
    // Save to IndexedDB
    try {
      await this.modelImportExport.saveToIndexedDB(this.model, 'automaton-embedding-model');
      console.log('[WASM ML] Model imported and saved to IndexedDB');
    } catch (error) {
      console.warn('[WASM ML] Failed to save imported model:', error);
    }
  }

  /**
   * Export and download model
   * 
   * @param {string} format - Export format
   * @param {string} filename - Optional filename
   */
  async exportAndDownload(format = 'json', filename = null) {
    if (!this.model) {
      throw new Error('No model to export');
    }

    await this.modelImportExport.exportAndDownload(this.model, format, filename);
  }

  /**
   * Load model from IndexedDB
   * 
   * @param {string} name - Model name
   * @returns {Promise<void>}
   */
  async loadModelFromIndexedDB(name = 'automaton-embedding-model') {
    try {
      const model = await this.modelImportExport.loadFromIndexedDB(name);
      
      if (this.model) {
        this.model.dispose();
      }
      
      this.model = model;
      console.log('[WASM ML] Model loaded from IndexedDB');
    } catch (error) {
      console.warn('[WASM ML] Failed to load model from IndexedDB:', error);
      throw error;
    }
  }
}

