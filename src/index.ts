class Websocket {
  private ws: WebSocket;

  private events: { event: string; handler: (message?: unknown) => {} }[] = [];
  private eventOpen = (event: Event) => {};
  private eventClose = (event: CloseEvent) => {};
  private eventError = (event: Event) => {};

  constructor(url: string) {
    this.ws = new WebSocket(url);

    this.ws.addEventListener("message", (event) => {
      if (this.events.length > 0) {
        try {
          const msg = JSON.parse(event.data) as { event: string; message: unknown };
          this.events.forEach((event) => {
            if (event.event === msg.event) event.handler(msg.message);
          });
        } catch {}
      }
    });

    this.ws.addEventListener("open", this.eventOpen);
    this.ws.addEventListener("close", this.eventClose);
    this.ws.addEventListener("error", this.eventError);
  }

  send(event: string, message?: unknown) {
    this.ws.send(JSON.stringify({ event, message }));
  }

  on(event: string, callback: (message?: unknown) => {}) {
    this.events.push({ event, handler: callback });
  }

  onOpen(callback: (event: Event) => void) {
    this.eventOpen = callback;
  }

  onClose(callback: (event: CloseEvent) => void) {
    this.eventClose = callback;
  }

  onError(callback: (event: Event) => void) {
    this.eventError = callback;
  }

  close() {
    this.ws.close();
  }
}

export { Websocket };
