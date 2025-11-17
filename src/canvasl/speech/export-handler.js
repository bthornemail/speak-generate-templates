/**
 * Speech-to-Text Export Handler
 * 
 * Exports transcripts and command history to files
 */

import { IndexedDBStore } from '../storage/idb.js';

/**
 * Export Handler for Speech-to-Text
 */
export class SpeechExportHandler {
  constructor() {
    this.db = new IndexedDBStore();
    this.initialized = false;
  }

  /**
   * Initialize export handler
   */
  async initialize() {
    if (this.initialized) return;
    await this.db.init();
    this.initialized = true;
  }

  /**
   * Export command history to text file
   * 
   * @param {string} format - Export format (txt, json, csv)
   * @returns {Promise<Blob>} File blob
   */
  async exportCommandHistory(format = 'txt') {
    if (!this.initialized) {
      await this.initialize();
    }

    const history = await this.db.getCommandHistory(1000);
    
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    switch (format) {
      case 'json':
        content = JSON.stringify(history, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      
      case 'csv':
        content = 'Timestamp,Type,Command\n';
        history.forEach(cmd => {
          const timestamp = new Date(cmd.timestamp).toISOString();
          const command = cmd.command.replace(/"/g, '""');
          content += `"${timestamp}","${cmd.type}","${command}"\n`;
        });
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      
      case 'txt':
      default:
        content = 'Command History\n';
        content += '='.repeat(50) + '\n\n';
        history.forEach((cmd, index) => {
          const timestamp = new Date(cmd.timestamp).toLocaleString();
          content += `${index + 1}. [${timestamp}] (${cmd.type})\n`;
          content += `   ${cmd.command}\n\n`;
        });
        break;
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * Export transcripts to text file
   * 
   * @param {Array} transcripts - Array of transcript objects
   * @param {string} format - Export format (txt, json)
   * @returns {Promise<Blob>} File blob
   */
  async exportTranscripts(transcripts, format = 'txt') {
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'json') {
      content = JSON.stringify(transcripts, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = 'Speech Transcripts\n';
      content += '='.repeat(50) + '\n\n';
      transcripts.forEach((transcript, index) => {
        const timestamp = transcript.timestamp 
          ? new Date(transcript.timestamp).toLocaleString()
          : 'Unknown';
        content += `${index + 1}. [${timestamp}] (${transcript.confidence ? Math.round(transcript.confidence * 100) + '%' : 'N/A'})\n`;
        content += `   ${transcript.text}\n\n`;
      });
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * Download file
   * 
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  downloadFile(blob, filename) {
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
   * Export command history and download
   * 
   * @param {string} format - Export format
   */
  async exportAndDownloadHistory(format = 'txt') {
    const blob = await this.exportCommandHistory(format);
    const extension = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    const filename = `canvasl-command-history-${Date.now()}.${extension}`;
    this.downloadFile(blob, filename);
  }

  /**
   * Export transcripts and download
   * 
   * @param {Array} transcripts - Transcripts array
   * @param {string} format - Export format
   */
  async exportAndDownloadTranscripts(transcripts, format = 'txt') {
    const blob = await this.exportTranscripts(transcripts, format);
    const extension = format === 'json' ? 'json' : 'txt';
    const filename = `canvasl-transcripts-${Date.now()}.${extension}`;
    this.downloadFile(blob, filename);
  }
}

