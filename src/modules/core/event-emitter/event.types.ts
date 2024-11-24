// src/modules/core/event-emitter/event.types.ts

export type EventHandler<T = any> = (payload: T) => Promise<void> | void;

export interface IEventEmitter {
  emit<T>(event: string, payload: T): Promise<void>;
  on<T>(event: string, handler: EventHandler<T>, priority?: number): void;
  off(event: string, handler: EventHandler): void;
}
