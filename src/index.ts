class Websocket {
  public raw: WebSocket;

  private events: { event: string; handler: (message: unknown) => void }[] = [];
  private sends: string[] = [];

  public isConnected: boolean = false;
  private connect = (event: Event) => {};
  private disconnect = (event: CloseEvent) => {};
  private error = (event: Event) => {};

  constructor(url: string) {
    this.raw = new WebSocket(url);

    this.raw.addEventListener("message", (event) => {
      if (this.events.length > 0) {
        try {
          const msg = JSON.parse(event.data) as { event: string; message: unknown };
          this.events.forEach((event) => {
            if (event.event === msg.event) event.handler(msg.message);
          });
        } catch {}
      }
    });

    this.raw.addEventListener("open", (event) => {
      this.isConnected = true;
      this.sends.forEach((item) => this.raw.send(item));
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
      this.sends.push(JSON.stringify({ event, message }));
    }
  }

  on(event: string, callback: (message: unknown) => void) {
    this.events.push({ event, handler: callback });
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
