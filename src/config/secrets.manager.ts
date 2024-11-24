export interface ISecretsManager {
  getSecret<T>(key: string): Promise<T>;
}
