/**
 * TensorFlow Model Import/Export
 * 
 * Handles importing and exporting TensorFlow.js models
 */

import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow Model Import/Export Handler
 */
export class ModelImportExport {
  /**
   * Export model to file
   * 
   * @param {tf.LayersModel} model - TensorFlow model
   * @param {string} format - Export format ('json', 'weights', 'full')
   * @returns {Promise<Blob>} Model file blob
   */
  async exportModel(model, format = 'json') {
    if (!model) {
      throw new Error('Model is required');
    }

    let content = '';
    let mimeType = 'application/json';
    let extension = 'json';

    switch (format) {
      case 'json':
        // Export model architecture as JSON
        const modelJson = model.toJSON();
        content = JSON.stringify(modelJson, null, 2);
        break;

      case 'weights':
        // Export weights only
        const weights = await model.getWeights();
        const weightData = weights.map(w => ({
          shape: w.shape,
          dtype: w.dtype,
          data: Array.from(w.dataSync())
        }));
        content = JSON.stringify(weightData, null, 2);
        break;

      case 'full':
        // Export full model (architecture + weights)
        const fullModel = {
          architecture: model.toJSON(),
          weights: await this.getWeightsAsArray(model)
        };
        content = JSON.stringify(fullModel, null, 2);
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * Get model weights as array
   * 
   * @param {tf.LayersModel} model - TensorFlow model
   * @returns {Promise<Array>} Weights array
   */
  async getWeightsAsArray(model) {
    const weights = await model.getWeights();
    return weights.map(w => ({
      shape: w.shape,
      dtype: w.dtype,
      data: Array.from(w.dataSync())
    }));
  }

  /**
   * Import model from file
   * 
   * @param {File|Blob|string} source - Model source (File, Blob, or URL)
   * @param {Object} options - Import options
   * @returns {Promise<tf.LayersModel>} Loaded model
   */
  async importModel(source, options = {}) {
    if (typeof source === 'string') {
      // Load from URL or IndexedDB
      if (source.startsWith('indexeddb://')) {
        return await tf.loadLayersModel(source);
      } else {
        return await tf.loadLayersModel(source);
      }
    } else if (source instanceof File || source instanceof Blob) {
      // Load from file/blob
      const text = await this.readBlobAsText(source);
      const modelData = JSON.parse(text);
      
      return await this.createModelFromData(modelData, options);
    } else {
      throw new Error('Invalid source type');
    }
  }

  /**
   * Create model from JSON data
   * 
   * @param {Object} modelData - Model data
   * @param {Object} options - Model options
   * @returns {Promise<tf.LayersModel>} Created model
   */
  async createModelFromData(modelData, options = {}) {
    if (modelData.architecture && modelData.weights) {
      // Full model with architecture and weights
      const model = tf.sequential();
      
      // Reconstruct layers from architecture
      for (const layerConfig of modelData.architecture.config.layers) {
        const layer = this.createLayerFromConfig(layerConfig);
        model.add(layer);
      }

      // Set weights
      if (modelData.weights && modelData.weights.length > 0) {
        const weightTensors = modelData.weights.map(w => 
          tf.tensor(w.data, w.shape, w.dtype)
        );
        model.setWeights(weightTensors);
        
        // Cleanup temporary tensors
        weightTensors.forEach(t => t.dispose());
      }

      // Compile model
      model.compile(options.compile || {
        optimizer: 'adam',
        loss: 'meanSquaredError'
      });

      return model;
    } else if (modelData.config) {
      // Architecture only
      return tf.sequential(modelData);
    } else {
      throw new Error('Invalid model data format');
    }
  }

  /**
   * Create layer from config
   * 
   * @param {Object} layerConfig - Layer configuration
   * @returns {tf.layers.Layer} Layer instance
   */
  createLayerFromConfig(layerConfig) {
    const className = layerConfig.class_name;
    const config = layerConfig.config;

    switch (className) {
      case 'Dense':
        return tf.layers.dense(config);
      case 'Conv2D':
        return tf.layers.conv2d(config);
      case 'LSTM':
        return tf.layers.lstm(config);
      case 'Dropout':
        return tf.layers.dropout(config);
      default:
        throw new Error(`Unsupported layer type: ${className}`);
    }
  }

  /**
   * Read blob as text
   * 
   * @param {Blob|File} blob - Blob to read
   * @returns {Promise<string>} Text content
   */
  readBlobAsText(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read blob'));
      reader.readAsText(blob);
    });
  }

  /**
   * Download model file
   * 
   * @param {Blob} blob - Model blob
   * @param {string} filename - Filename
   */
  downloadModel(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export and download model
   * 
   * @param {tf.LayersModel} model - Model to export
   * @param {string} format - Export format
   * @param {string} filename - Optional filename
   */
  async exportAndDownload(model, format = 'json', filename = null) {
    const blob = await this.exportModel(model, format);
    const extension = format === 'json' ? 'json' : 'json';
    const name = filename || `tf-model-${Date.now()}.${extension}`;
    this.downloadModel(blob, name);
  }

  /**
   * Save model to IndexedDB
   * 
   * @param {tf.LayersModel} model - Model to save
   * @param {string} name - Model name
   * @returns {Promise<void>}
   */
  async saveToIndexedDB(model, name) {
    const url = `indexeddb://${name}`;
    await model.save(url);
  }

  /**
   * Load model from IndexedDB
   * 
   * @param {string} name - Model name
   * @returns {Promise<tf.LayersModel>} Loaded model
   */
  async loadFromIndexedDB(name) {
    const url = `indexeddb://${name}`;
    return await tf.loadLayersModel(url);
  }
}

