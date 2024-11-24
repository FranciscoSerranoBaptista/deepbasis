// src/index.ts

import { App } from './app';

async function main(): Promise<void> {
  const app = new App();

  async function shutdown(signal?: string): Promise<void> {
    try {
      console.log(`Received ${signal || 'shutdown'} signal`);
      await app.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  try {
    await app.start();

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception:', error);
      await shutdown();
    });

    process.on('unhandledRejection', async (reason) => {
      console.error('Unhandled Rejection:', reason);
      await shutdown();
    });
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

main();
