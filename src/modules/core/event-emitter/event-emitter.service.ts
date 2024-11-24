// src/modules/core/event-emitter/event-emitter.service.ts

import { EventEmitter } from "events";
import { IEventEmitter, EventHandler } from "./event.types";
import { Service } from "../../../common/decorators/service.decorator";
import { Lifetime } from "awilix";

@Service({ name: "EventEmitter", lifetime: Lifetime.SINGLETON })
export class EventEmitterService implements IEventEmitter {
  private emitter: EventEmitter;

  constructor() {
      this.emitter = new EventEmitter();
      // Set a higher limit for event listeners if needed
      this.emitter.setMaxListeners(100);
    }

  async emit<T>(event: string, payload: T): Promise<void> {
      this.emitter.emit(event, payload);
    }

    on<T>(event: string, handler: EventHandler<T>): void {
      this.emitter.on(event, handler);
    }

    off(event: string, handler: EventHandler): void {
      this.emitter.off(event, handler);
    }
}
