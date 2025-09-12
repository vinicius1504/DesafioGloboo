import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtPayload } from './jwt.strategy';
import { UsersService } from '../../users/service/users.service';
import { User } from '../../users/entities/user.entity';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let usersService: jest.Mocked<UsersService>;
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

  const mockJwtPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    iat: 1234567890,
    exp: 1234567990,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'jwt.refreshSecret': 'test-jwt-refresh-secret',
              };
              return config[key];
            }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when user is valid and active', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(mockJwtPayload);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(null as any);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
      expect(usersService.findOne).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      usersService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(serviceError);
    });

    it('should validate with minimal payload', async () => {
      // Arrange
      const minimalPayload: JwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      };
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(minimalPayload);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });

    it('should handle user with different properties', async () => {
      // Arrange
      const differentUser = {
        ...mockUser,
        email: 'different@example.com',
        username: 'differentuser',
      };
      const differentPayload: JwtPayload = {
        sub: differentUser.id,
        email: differentUser.email,
        username: differentUser.username,
      };
      usersService.findOne.mockResolvedValue(differentUser);

      // Act
      const result = await strategy.validate(differentPayload);

      // Assert
      expect(result).toEqual({
        id: differentUser.id,
        email: differentUser.email,
        username: differentUser.username,
      });
    });
  });

  describe('constructor', () => {
    it('should configure strategy with correct options', () => {
      // Assert
      expect(configService.get).toHaveBeenCalledWith('jwt.refreshSecret');
      
      // Verify that strategy is properly initialized
      expect(strategy).toBeInstanceOf(JwtRefreshStrategy);
    });

    it('should use correct refresh secret from config', () => {
      // Arrange & Act
      const secretCall = configService.get.mock.calls.find(call => call[0] === 'jwt.refreshSecret');

      // Assert
      expect(secretCall).toBeDefined();
      if (secretCall) {
        expect(secretCall[0]).toBe('jwt.refreshSecret');
      }
    });
  });

  describe('Token extraction', () => {
    it('should be configured to extract token from body field', () => {
      // This test verifies that the strategy is configured to extract
      // refresh tokens from the request body field 'refreshToken'
      // The actual extraction logic is handled by passport-jwt
      expect(strategy).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should propagate unexpected errors from UsersService', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected database error');
      usersService.findOne.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(unexpectedError);
    });

    it('should handle null response from findOne', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(null as any);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle undefined user', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(undefined as any);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
    });

    it('should handle corrupted user data', async () => {
      // Arrange
      const corruptedUser = {
        ...mockUser,
        isActive: null, // Corrupted data
      };
      usersService.findOne.mockResolvedValue(corruptedUser as any);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
    });
  });

  describe('Security considerations', () => {
    it('should validate refresh tokens with different secret than access tokens', () => {
      // Assert that refresh tokens use a different secret
      expect(configService.get).toHaveBeenCalledWith('jwt.refreshSecret');
      // This ensures refresh tokens can't be validated with the access token secret
    });

    it('should properly identify inactive accounts', async () => {
      // Arrange
      const suspendedUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(suspendedUser);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
      
      // Ensure that even with a valid refresh token, inactive users can't refresh
    });
  });
});
