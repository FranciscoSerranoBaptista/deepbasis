// src/modules/features/auth/auth.service.ts

import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { UserService } from '../user/user.service';
import {
  LoginDTO,
  AuthToken,
  RegisterDTO,
  RefreshTokenDTO
} from './auth.types';
import { User } from '../user/user.entity';
import {
  comparePasswords,
  hashPassword,
  generateJWT,
  verifyJWT
} from '../../../common/utils/helpers';
import { ValidationError } from '../../../common/utils/error-handler';
import { ConfigService } from '../../../config/config.service';

@Service({ lifetime: Lifetime.SCOPED })
export class AuthService {
  private jwtSecret: string;

  constructor(
    private userService: UserService,
    private configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('auth.jwtSecret');
  }

  async register(dto: RegisterDTO): Promise<AuthToken> {
    const user = await this.userService.createUser(dto);
    return this.generateTokens(user);
  }

  async login(dto: LoginDTO): Promise<AuthToken> {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) {
      throw new ValidationError('Invalid email or password.');
    }

    const passwordValid = await comparePasswords(
      dto.password,
      user.passwordHash
    );
    if (!passwordValid) {
      throw new ValidationError('Invalid email or password.');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDTO): Promise<AuthToken> {
    const payload = verifyJWT(dto.refreshToken, this.jwtSecret);

    if (!payload || !payload.userId) {
      throw new ValidationError('Invalid refresh token.');
    }

    const user = await this.userService.getUserById(payload.userId);
    if (!user) {
      throw new ValidationError('User not found.');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User): AuthToken {
    const accessToken = generateJWT({ userId: user.id }, this.jwtSecret, '15m');
    const refreshToken = generateJWT({ userId: user.id }, this.jwtSecret, '7d');
    return { accessToken, refreshToken };
  }
}
