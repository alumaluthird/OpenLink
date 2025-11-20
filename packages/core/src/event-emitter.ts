import { EventEmitter, WalletEvent, EventCallback } from './types';

export class OpenLinkEventEmitter implements EventEmitter {
  private events: Map<WalletEvent, Set<EventCallback>> = new Map();

  on(event: WalletEvent, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: WalletEvent, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: WalletEvent, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: WalletEvent): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

