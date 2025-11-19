# Docker Setup Guide

This guide explains how to build and run the CanvasL application with Docker Compose, including the TURN/COTURN server for WebRTC collaboration.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- At least 2GB of free disk space

## Quick Start

1. **Copy environment variables template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and configure:
   - TURN server credentials (for WebRTC)
   - Port mappings (if different from defaults)
   - COTURN realm and credentials

3. **Build and start services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - App: http://localhost:8080 (or your configured `HOST_PORT`)
   - Health check: http://localhost:8080/health

5. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # App only
   docker-compose logs -f app
   
   # COTURN only
   docker-compose logs -f coturn
   ```

6. **Stop services:**
   ```bash
   docker-compose down
   ```

## Environment Variables

### Application Configuration

- `HOST_PORT` - Host port mapping for the app (default: 8080)
- `APP_PORT` - Container port for the app (default: 80)

### TURN Server Configuration (WebRTC)

These variables are prefixed with `VITE_` to be accessible in the browser:

- `VITE_TURN_SERVER_URL` - TURN server URL (e.g., `turn:coturn:3478`)
  - Format: `turn:hostname:port` or `turns:hostname:port` (for TLS)
  - Default: `turn:coturn:3478`
- `VITE_TURN_USERNAME` - TURN server username
- `VITE_TURN_PASSWORD` - TURN server password

### COTURN Server Configuration

- `COTURN_PORT` - COTURN server port (default: 3478)
- `COTURN_REALM` - COTURN realm (default: `canvasl.local`)
- `COTURN_USER` - COTURN username
- `COTURN_PASS` - COTURN password

## Port Mappings

| Service | Container Port | Host Port (default) | Protocol |
|---------|---------------|-------------------|----------|
| App (nginx) | 80 | 8080 | TCP |
| COTURN STUN/TURN | 3478 | 3478 | UDP/TCP |
| COTURN RTP Relay | 49152-65535 | 49152-65535 | UDP |

## Architecture

### Services

1. **app** - Vite React application served via nginx
   - Multi-stage Docker build
   - Production-optimized static files
   - SPA routing support

2. **coturn** - TURN/STUN server for WebRTC
   - Handles NAT traversal for WebRTC connections
   - Provides relay services for peer-to-peer communication
   - Configured via `coturn.conf`

### Network

Both services run on a shared bridge network (`canvasl-network`) allowing them to communicate using service names as hostnames.

## Building

### Build images:
```bash
docker-compose build
```

### Build without cache:
```bash
docker-compose build --no-cache
```

### Build specific service:
```bash
docker-compose build app
```

## Development

### Rebuild after code changes:
```bash
docker-compose up -d --build
```

### View container status:
```bash
docker-compose ps
```

### Execute commands in container:
```bash
# App container
docker-compose exec app sh

# COTURN container
docker-compose exec coturn sh
```

## Testing WebRTC/TURN Server

### 1. Check COTURN is running:
```bash
docker-compose logs coturn
```

You should see COTURN startup messages and "listening" status.

### 2. Test STUN server:
Use an online STUN/TURN tester or browser console:

```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:localhost:3478' }
  ]
});

pc.createDataChannel('test');
pc.createOffer().then(offer => pc.setLocalDescription(offer));
```

### 3. Test TURN server:
```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { 
      urls: 'turn:localhost:3478',
      username: 'canvasl',
      credential: 'your-password'
    }
  ]
});
```

### 4. Check ICE candidates:
Monitor browser console for ICE candidate events. You should see:
- Host candidates (direct connection)
- SRFLX candidates (STUN reflexive)
- Relay candidates (TURN relay) - indicates TURN is working

## Troubleshooting

### App not accessible

1. **Check if container is running:**
   ```bash
   docker-compose ps
   ```

2. **Check app logs:**
   ```bash
   docker-compose logs app
   ```

3. **Verify port mapping:**
   ```bash
   docker-compose port app 80
   ```

4. **Check nginx configuration:**
   ```bash
   docker-compose exec app nginx -t
   ```

### WebRTC connections failing

1. **Verify TURN server is accessible:**
   ```bash
   docker-compose logs coturn | grep -i "listening"
   ```

2. **Check TURN credentials:**
   - Verify `.env` file has correct `VITE_TURN_USERNAME` and `VITE_TURN_PASSWORD`
   - Ensure COTURN credentials match: `COTURN_USER` and `COTURN_PASS`

3. **Test TURN server directly:**
   ```bash
   # Install turnutils (if available)
   turnutils_stunclient localhost
   ```

4. **Check firewall:**
   - Ensure UDP port 3478 is open
   - Ensure UDP ports 49152-65535 are open (for RTP relay)

5. **Verify environment variables in browser:**
   Open browser console and check:
   ```javascript
   console.log(import.meta.env.VITE_TURN_SERVER_URL);
   ```

### COTURN not starting

1. **Check COTURN logs:**
   ```bash
   docker-compose logs coturn
   ```

2. **Verify configuration file:**
   ```bash
   docker-compose exec coturn cat /etc/coturn/turnserver.conf
   ```

3. **Check port conflicts:**
   ```bash
   netstat -tuln | grep 3478
   ```

### Build failures

1. **Clear Docker cache:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   ```

3. **Check Dockerfile syntax:**
   ```bash
   docker build -t test-build .
   ```

## Production Deployment

### Security Considerations

1. **Change default passwords:**
   - Update `COTURN_PASS` in `.env`
   - Update `VITE_TURN_PASSWORD` in `.env`
   - Use strong, unique passwords

2. **Configure external IP:**
   - Set `COTURN_EXTERNAL_IP` in `.env` to your public IP
   - Or configure COTURN to auto-detect external IP

3. **Enable TLS (optional):**
   - Configure TLS certificates in `coturn.conf`
   - Use `turns:` protocol instead of `turn:`
   - Update `VITE_TURN_SERVER_URL` to use `turns:`

4. **Restrict access:**
   - Update `allowed-peer-ip` in `coturn.conf`
   - Configure firewall rules
   - Use reverse proxy with authentication

5. **Environment variables:**
   - Never commit `.env` file to version control
   - Use secrets management in production
   - Rotate credentials regularly

### Performance Tuning

1. **Resource limits:**
   Add to `docker-compose.yml`:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
     coturn:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 256M
   ```

2. **COTURN relay range:**
   Adjust `min-port` and `max-port` in `coturn.conf` based on expected load.

3. **Nginx caching:**
   Adjust cache headers in `nginx.conf` based on your needs.

## Additional Resources

- [COTURN Documentation](https://github.com/coturn/coturn)
- [WebRTC TURN Server Setup](https://webrtc.org/getting-started/turn-server)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this documentation
3. Check application logs in browser console
4. Verify environment variables are set correctly

