import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUserResponse = new UserResponseDto({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword', // This will be excluded
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const mockAuthResponse = new AuthResponseDto(
    mockUserResponse,
    'access-token-123',
    'refresh-token-123',
    900 // 15 minutes
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
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
      authService.register.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result).toBeInstanceOf(AuthResponseDto);
    });

    it('should throw ConflictException when registration fails', async () => {
      // Arrange
      const conflictError = new ConflictException('User with this email or username already exists');
      authService.register.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(conflictError);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle validation errors properly', async () => {
      // Arrange
      const invalidRegisterDto = {
        email: 'invalid-email', // Invalid email format
        username: '', // Empty username
        password: '123', // Too short password
      } as RegisterDto;
      
      const validationError = new Error('Validation failed');
      authService.register.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(validationError);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      login: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result).toBeInstanceOf(AuthResponseDto);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      const unauthorizedError = new UnauthorizedException('Invalid credentials');
      authService.login.mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(unauthorizedError);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when account is deactivated', async () => {
      // Arrange
      const deactivatedError = new UnauthorizedException('Account is deactivated');
      authService.login.mockRejectedValue(deactivatedError);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(deactivatedError);
    });

    it('should handle login with username', async () => {
      // Arrange
      const loginDtoWithUsername = {
        login: 'testuser',
        password: 'password123',
      };
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(loginDtoWithUsername);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDtoWithUsername);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token-123',
    };

    it('should successfully refresh tokens', async () => {
      // Arrange
      const newMockAuthResponse = new AuthResponseDto(
        mockUserResponse,
        'new-access-token-123',
        'new-refresh-token-123',
        900
      );
      authService.refresh.mockResolvedValue(newMockAuthResponse);

      // Act
      const result = await controller.refresh(refreshTokenDto);

      // Assert
      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(result).toEqual(newMockAuthResponse);
      expect(result.accessToken).toBe('new-access-token-123');
      expect(result.refreshToken).toBe('new-refresh-token-123');
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      // Arrange
      const invalidTokenError = new UnauthorizedException('Invalid refresh token');
      authService.refresh.mockRejectedValue(invalidTokenError);

      // Act & Assert
      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(invalidTokenError);
      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    });

    it('should throw UnauthorizedException with expired refresh token', async () => {
      // Arrange
      const expiredTokenDto = {
        refreshToken: 'expired-refresh-token',
      };
      const expiredTokenError = new UnauthorizedException('Invalid refresh token');
      authService.refresh.mockRejectedValue(expiredTokenError);

      // Act & Assert
      await expect(controller.refresh(expiredTokenDto)).rejects.toThrow(expiredTokenError);
      expect(authService.refresh).toHaveBeenCalledWith(expiredTokenDto.refreshToken);
    });

    it('should handle malformed refresh token', async () => {
      // Arrange
      const malformedTokenDto = {
        refreshToken: 'malformed.token.here',
      };
      const malformedTokenError = new UnauthorizedException('Invalid refresh token');
      authService.refresh.mockRejectedValue(malformedTokenError);

      // Act & Assert
      await expect(controller.refresh(malformedTokenDto)).rejects.toThrow(malformedTokenError);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'flow@example.com',
        username: 'flowuser',
        password: 'password123',
      };

      const loginDto: LoginDto = {
        login: 'flow@example.com',
        password: 'password123',
      };

      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'initial-refresh-token',
      };

      authService.register.mockResolvedValue(mockAuthResponse);
      authService.login.mockResolvedValue(mockAuthResponse);
      authService.refresh.mockResolvedValue(new AuthResponseDto(
        mockUserResponse,
        'refreshed-access-token',
        'refreshed-refresh-token',
        900
      ));

      // Act & Assert - Register
      const registerResult = await controller.register(registerDto);
      expect(registerResult).toEqual(mockAuthResponse);

      // Act & Assert - Login
      const loginResult = await controller.login(loginDto);
      expect(loginResult).toEqual(mockAuthResponse);

      // Act & Assert - Refresh
      const refreshResult = await controller.refresh(refreshTokenDto);
      expect(refreshResult.accessToken).toBe('refreshed-access-token');

      // Verify all services were called correctly
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    });
  });
});
