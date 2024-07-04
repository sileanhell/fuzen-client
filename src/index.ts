class Websocket {
  public raw: WebSocket;

  private events: Map<string, (message: unknown) => void> = new Map();
  private sends: Set<string> = new Set();

  public isConnected: boolean = false;
  private connect = (event: Event) => {};
  private disconnect = (event: CloseEvent) => {};
  private error = (event: Event) => {};

  constructor(url: string) {
    this.raw = new WebSocket(url, "Fuzen");

    this.raw.addEventListener("message", (event) => {
      if (this.events.size > 0) {
        try {
          const msg = JSON.parse(event.data) as { event: string; message: unknown };
          const element = this.events.get(msg.event);
          if (element) element(msg.message);
        } catch {}
      }
    });

    this.raw.addEventListener("open", (event) => {
      this.isConnected = true;
      this.sends.forEach((item) => this.raw.send(item));
      this.sends.clear();
      this.connect(event);
    });
    this.raw.addEventListener("close", (event) => {
      this.isConnected = false;
      this.disconnect(event);
    });
    this.raw.addEventListener("error", this.error);
  }

  send(event: string, message?: unknown) {
    if (this.isConnected) {
      this.raw.send(JSON.stringify({ event, message }));
    } else {
      this.sends.add(JSON.stringify({ event, message }));
    }
  }

  on(event: string, callback: (message: unknown) => void) {
    const isExist = this.events.get(event);

    if (!isExist) {
      this.events.set(event, callback);
    } else {
      console.error(`You are trying to listen to the \'${event}\' event twice.\nOff the old listener before using the new one.`);
    }
  }

  off(event: string) {
    const isExist = this.events.get(event);
    if (isExist) this.events.delete(event);
    return !!isExist;
  }

  onResponse(event: string, message?: unknown) {
    return new Promise((resolve) => {
      this.events.set(event, (message) => {
        this.events.delete(event);
        resolve(message);
      });
      this.send(event, message);
    });
  }

  onConnect(callback: (event: Event) => void) {
    this.connect = callback;
  }

  onDisconnect(callback: (event: CloseEvent) => void) {
    this.disconnect = callback;
  }

  onError(callback: (event: Event) => void) {
    this.error = callback;
  }

  close() {
    this.raw.close();
  }
}

export { Websocket };
