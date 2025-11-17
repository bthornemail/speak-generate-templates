import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { createAppRouter } from './router.jsx'

// Register navigator protocol handler for canvasl://
// Only register if we're on a secure context (HTTPS or localhost)
if ('registerProtocolHandler' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  try {
    // Register canvasl:// protocol handler
    navigator.registerProtocolHandler(
      'web+canvasl',
      `${window.location.origin}/canvas/%s`,
      'CANVASL Protocol Handler'
    );
    console.log('✅ Registered canvasl:// protocol handler');
  } catch (error) {
    console.warn('⚠️ Protocol handler registration failed:', error);
  }
}

// Handle canvasl:// protocol URLs
// This only runs for actual protocol URLs, not regular HTTP/HTTPS
function handleProtocolURL() {
  const href = window.location.href;
  const protocol = window.location.protocol;
  
  // Only handle if this is actually a protocol handler URL
  if (protocol === 'web+canvasl:' || (href.startsWith('canvasl://') && protocol !== 'http:' && protocol !== 'https:')) {
    try {
      // Replace protocol for URL parsing
      const urlString = href.replace(/^(web\+canvasl|canvasl):/, 'http:');
      const url = new URL(urlString);
      const path = url.pathname;
      
      // Extract node ID or other parameters
      const nodeId = path.split('/').filter(p => p).pop();
      
      // Redirect to the appropriate route
      if (nodeId && nodeId !== '') {
        window.location.replace(`${window.location.origin}/canvas/${nodeId}`);
      } else {
        window.location.replace(`${window.location.origin}/canvas`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to handle protocol URL:', error);
    }
  }
}

// Only handle protocol URLs on page load if we're actually on a protocol URL
// This check ensures we don't interfere with normal HTTP/HTTPS navigation
const isProtocolURL = window.location.protocol === 'web+canvasl:' || 
                     (window.location.href.startsWith('canvasl://') && 
                      window.location.protocol !== 'http:' && 
                      window.location.protocol !== 'https:');

if (isProtocolURL) {
  handleProtocolURL();
}

// Listen for protocol handler invocations (only if supported)
if ('registerProtocolHandler' in navigator) {
  window.addEventListener('protocol-handler', (event) => {
    console.log('Protocol handler invoked:', event);
    handleProtocolURL();
  });
}

const router = createAppRouter();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
