// src/common/interfaces/service.interface.ts

export interface IService {
  /**
   * Initialize the service. This method is used to set up any necessary
   * configurations or state before the service starts.
   */
  initialize(): Promise<void>;

  /**
   * Start the service. This method is called after initialization and is
   * responsible for starting any processes or listeners.
   */
  start(): Promise<void>;

  /**
   * Stop the service. This method is used to gracefully shut down the service,
   * closing any connections or freeing resources.
   */
  stop(): Promise<void>;
}
