// src/__tests__/unit/user/user.service.test.ts
import { container } from '../../helpers/test-container';
import { TestFactory } from '../../helpers/test-factory';
import { UserService } from '../../../modules/features/user/user.service';
import { CreateUserDTO } from '../../../modules/features/user/user.types';
import { ValidationError } from '../../../common/utils/error-handler';
import { TestContainer } from '../../helpers/test-container';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = container.resolve('userService');
  });

  afterEach(async () => {
    await TestContainer.resetDatabase();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const dto: CreateUserDTO = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = await userService.createUser(dto);

      expect(user).toBeDefined();
      expect(user.name).toBe(dto.name);
      expect(user.email).toBe(dto.email);
      expect(user.passwordHash).toBeDefined();
      expect(user.id).toBeDefined();
    });

    it('should throw ValidationError if email already exists', async () => {
      // Create a user first
      const existingUser = await TestFactory.createUser({
        email: 'existing@example.com'
      });

      const dto: CreateUserDTO = {
        name: 'John Doe',
        email: existingUser.email,
        password: 'password123'
      };

      await expect(userService.createUser(dto)).rejects.toThrow(
        ValidationError
      );
    });
  });

  // Add more test cases for other UserService methods
});
