import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/service/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { User } from '../../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findOne: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const expectedTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce(expectedTokens.accessToken);
      jwtService.sign.mockReturnValueOnce(expectedTokens.refreshToken);
      configService.get.mockImplementation((key: string) => {
        const config = {
          JWT_SECRET: 'jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      });

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.user).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      }));
      expect(result.accessToken).toBe(expectedTokens.accessToken);
      expect(result.refreshToken).toBe(expectedTokens.refreshToken);
    });

    it('should throw ConflictException when user creation fails', async () => {
      // Arrange
      usersService.create.mockRejectedValue(new ConflictException('User already exists'));

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when unknown error occurs', async () => {
      // Arrange
      usersService.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Error creating user')
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      login: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with email', async () => {
      // Arrange
      const expectedTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce(expectedTokens.accessToken);
      jwtService.sign.mockReturnValueOnce(expectedTokens.refreshToken);
      configService.get.mockImplementation((key: string) => {
        const config = {
          JWT_SECRET: 'jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      });

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.login);
      expect(usersService.validatePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe(expectedTokens.accessToken);
    });

    it('should successfully login with username when email not found', async () => {
      // Arrange
      const loginDtoWithUsername = { ...loginDto, login: 'testuser' };
      const expectedTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce(expectedTokens.accessToken);
      jwtService.sign.mockReturnValueOnce(expectedTokens.refreshToken);
      configService.get.mockImplementation((key: string) => {
        const config = {
          JWT_SECRET: 'jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      });

      // Act
      const result = await service.login(loginDtoWithUsername);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDtoWithUsername.login);
      expect(usersService.findByUsername).toHaveBeenCalledWith(loginDtoWithUsername.login);
      expect(result).toBeInstanceOf(AuthResponseDto);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Account is deactivated')
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens', async () => {
      // Arrange
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        iat: 1234567890,
        exp: 1234567890,
      };

      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce(expectedTokens.accessToken);
      jwtService.sign.mockReturnValueOnce(expectedTokens.refreshToken);
      configService.get.mockImplementation((key: string) => {
        const config = {
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_SECRET: 'jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      });

      // Act
      const result = await service.refresh(refreshToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe(expectedTokens.accessToken);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const mockPayload = {
        sub: 'invalid-user-id',
        email: 'test@example.com',
        username: 'testuser',
        iat: 1234567890,
        exp: 1234567890,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(null as any);
      configService.get.mockReturnValue('refresh-secret');

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        iat: 1234567890,
        exp: 1234567890,
      };
      const inactiveUser = { ...mockUser, isActive: false };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(inactiveUser);
      configService.get.mockReturnValue('refresh-secret');

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });
  });

  describe('validateUser', () => {
    const mockPayload = {
      sub: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
    };

    it('should return user when valid', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(mockPayload);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
    usersService.findOne.mockResolvedValue(null as any);

      // Act
      const result = await service.validateUser(mockPayload);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(inactiveUser);

      // Act
      const result = await service.validateUser(mockPayload);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('parseExpireTime', () => {
    it('should parse seconds correctly', () => {
      // Act & Assert
      expect(service['parseExpireTime']('30s')).toBe(30);
    });

    it('should parse minutes correctly', () => {
      // Act & Assert
      expect(service['parseExpireTime']('15m')).toBe(900);
    });

    it('should parse hours correctly', () => {
      // Act & Assert
      expect(service['parseExpireTime']('2h')).toBe(7200);
    });

    it('should parse days correctly', () => {
      // Act & Assert
      expect(service['parseExpireTime']('7d')).toBe(604800);
    });

    it('should return default value for invalid format', () => {
      // Act & Assert
      expect(service['parseExpireTime']('invalid')).toBe(900); // 15 minutes default
    });

    it('should return default value for unknown unit', () => {
      // Act & Assert
      expect(service['parseExpireTime']('10x')).toBe(900); // 15 minutes default
    });
  });
});
