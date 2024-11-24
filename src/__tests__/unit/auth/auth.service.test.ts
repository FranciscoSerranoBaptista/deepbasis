import { container } from '../../helpers/test-container';
import { AuthService } from '../../../modules/features/auth/auth.service';
import { LoginDTO } from '../../../modules/features/auth/auth.types';
import { TestFactory } from '../../helpers/test-factory';
import { ValidationError } from '../../../common/utils/error-handler';
import { comparePasswords, hashPassword } from '../../../common/utils/helpers';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = container.resolve('authService');
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Create a test user
      const password = 'testPassword123';
      const user = await TestFactory.createUser({
        email: 'test@example.com',
        passwordHash: await hashPassword(password)
      });

      const loginDto: LoginDTO = {
        email: user.email,
        password: password
      };

      const result = await authService.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ValidationError with invalid credentials', async () => {
      // Create a test user
      const user = await TestFactory.createUser({
        email: 'test@example.com',
        passwordHash: await hashPassword('correctPassword')
      });

      const loginDto: LoginDTO = {
        email: user.email,
        password: 'wrongPassword'
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        ValidationError
      );
    });
  });
});
