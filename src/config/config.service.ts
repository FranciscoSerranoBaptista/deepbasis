// src/config/config.service.ts

import { parse } from 'dotenv';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../common/decorators/service.decorator';
import { IConfigService } from '../common/interfaces/config.interface';
import { IService } from '../common/interfaces/service.interface';
import { Logger } from '../modules/core/logger/logger.service';
import { AppConfig, ConfigSchema } from './config.schema';

@Service({ name: 'ConfigService' })
export class ConfigService implements IConfigService, IService {
  private config!: AppConfig;
  private readonly eventEmitter: EventEmitter;
  private readonly subscribers: Array<(newConfig: AppConfig) => void> = [];

  constructor(private readonly logger: Logger) {
    this.eventEmitter = new EventEmitter();
  }

  async initialize(): Promise<void> {
    this.loadConfig();
  }

  async start(): Promise<void> {
    // No specific start actions needed
  }

  async stop(): Promise<void> {
    // No specific stop actions needed
  }

  private loadConfig(): void {
    const env = process.env.NODE_ENV || 'development';
    const envConfigPath = path.resolve(__dirname, 'environments', `${env}.ts`);
    let envConfig = {};

    if (fs.existsSync(envConfigPath)) {
      envConfig = require(envConfigPath).default;
    }

    const defaultConfig = require('./environments/default.ts').default;

    // Load environment variables from .env file
    const envFilePath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envFilePath)) {
      const envFile = fs.readFileSync(envFilePath);
      const envVars = parse(envFile);
      for (const k in envVars) {
        process.env[k] = envVars[k];
      }
    }

    // Merge configurations: environment variables override file configurations
    const combinedConfig = {
      ...defaultConfig,
      ...envConfig,
      ...process.env
    };

    // Validate the configuration
    const parsedConfig = ConfigSchema.safeParse(combinedConfig);

    if (!parsedConfig.success) {
      this.logger.error('Configuration validation failed', {
        errors: parsedConfig.error.errors
      });
      throw new Error('Invalid configuration');
    }

    this.config = parsedConfig.data;
    this.logger.info('Configuration loaded successfully');
  }

  private watchConfigFile(): void {
    // Optional: Implement hot-reloading of configuration files if needed
  }

  public get<T>(key: string): T {
    const value = key.split('.').reduce((o, i) => {
      if (o === undefined || o === null) {
        throw new Error(`Configuration key '${key}' not found`);
      }
      return (o as any)[i];
    }, this.config);

    if (value === undefined || value === null) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    return value as T;
  }

  public getAll<T>(): T {
    return this.config as unknown as T;
  }

  public onChange(callback: (newConfig: AppConfig) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      callback(this.config);
    }
  }
}
