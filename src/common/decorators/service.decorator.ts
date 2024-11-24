// src/common/decorators/service.decorator.ts

import 'reflect-metadata';
import { LifetimeType, Lifetime } from 'awilix';

export interface ServiceOptions {
  name?: string;
  lifetime?: LifetimeType;
  tags?: string[];
}

/**
 * Decorator to mark a class as a service to be registered with the DI container.
 * @param options Service registration options.
 */
export function Service(options: ServiceOptions = {}): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('service:name', options.name || target.name, target);
    Reflect.defineMetadata(
      'service:lifetime',
      options.lifetime || Lifetime.SINGLETON,
      target
    );
    Reflect.defineMetadata('service:tags', options.tags || [], target);
  };
}
