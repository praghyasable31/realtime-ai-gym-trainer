/**
 * Real-Time WebSocket client for Python AI Pose Service.
 * Manages frame streaming, throttling, automatic reconnect, and state telemetry.
 */

export class AIPoseClient {
  constructor(exercise, onResultCallback, onStatusCallback) {
    this.exercise = exercise;
    this.onResult = onResultCallback;
    this.onStatus = onStatusCallback;
    this.ws = null;
    this.isConnected = false;
    this.isStreaming = false;
    this.frameInterval = 65; // ~15-20 fps streaming to balance network & CPU
    this.lastFrameTime = 0;
    this.wsUrl = `ws://127.0.0.1:8000/ws/pose/${exercise}`;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatus) this.onStatus({ connected: true, engine: 'Python MediaPipe Service' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onResult) {
            this.onResult(data);
          }
        } catch (e) {
          console.error('Error parsing AI telemetry:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
        this.isConnected = false;
        if (this.onStatus) this.onStatus({ connected: false, error: 'AI Service unreachable' });
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onStatus) this.onStatus({ connected: false, message: 'Disconnected' });
      };
    } catch (e) {
      console.warn('Could not establish WebSocket:', e);
      this.isConnected = false;
      if (this.onStatus) this.onStatus({ connected: false, error: e.message });
    }
  }

  sendFrame(videoElement, canvasElement) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = Date.now();
    if (now - this.lastFrameTime < this.frameInterval) {
      return;
    }
    this.lastFrameTime = now;

    try {
      const ctx = canvasElement.getContext('2d');
      // Downsample slightly (e.g. 480x360) for fast transmission without losing landmark resolution
      canvasElement.width = 480;
      canvasElement.height = 360;
      ctx.drawImage(videoElement, 0, 0, 480, 360);

      // Low compression JPEG for speed
      const base64Data = canvasElement.toDataURL('image/jpeg', 0.65);
      this.ws.send(JSON.stringify({ image: base64Data }));
    } catch (e) {
      console.error('Error capturing or sending video frame:', e);
    }
  }

  resetSession() {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'reset' }));
    }
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}
