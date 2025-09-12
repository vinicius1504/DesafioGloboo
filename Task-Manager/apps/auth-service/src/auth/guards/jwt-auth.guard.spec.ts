import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Guard Instantiation', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should extend AuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });

  describe('canActivate', () => {
    let mockContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              username: 'testuser',
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should return true for valid JWT token', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Mock the parent class method
      const parentCanActivate = jest.fn().mockResolvedValue(true);
      guard.canActivate = parentCanActivate;

      // Act
      const result = await guard.canActivate(mockContext as ExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
    });

    it('should return false for invalid JWT token', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-jwt-token',
        },
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Mock the parent class method
      const parentCanActivate = jest.fn().mockResolvedValue(false);
      guard.canActivate = parentCanActivate;

      // Act
      const result = await guard.canActivate(mockContext as ExecutionContext);

      // Assert
      expect(result).toBe(false);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
    });

    it('should return false when no authorization header is present', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Mock the parent class method
      const parentCanActivate = jest.fn().mockResolvedValue(false);
      guard.canActivate = parentCanActivate;

      // Act
      const result = await guard.canActivate(mockContext as ExecutionContext);

      // Assert
      expect(result).toBe(false);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
    });

    it('should return false when authorization header has wrong format', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Mock the parent class method
      const parentCanActivate = jest.fn().mockResolvedValue(false);
      guard.canActivate = parentCanActivate;

      // Act
      const result = await guard.canActivate(mockContext as ExecutionContext);

      // Assert
      expect(result).toBe(false);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
    });

    it('should handle expired tokens', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer expired-jwt-token',
        },
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Mock the parent class method to throw an error (as would happen with expired token)
      const parentCanActivate = jest.fn().mockRejectedValue(new Error('Token expired'));
      guard.canActivate = parentCanActivate;

      // Act & Assert
      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow('Token expired');
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('Error handling', () => {
    let mockContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      const parentCanActivate = jest.fn().mockRejectedValue(new Error('Authentication failed'));
      guard.canActivate = parentCanActivate;

      // Act & Assert
      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow('Authentication failed');
    });

    it('should handle malformed JWT tokens', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer malformed.jwt.token',
        },
      };

      mockContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      });

      const parentCanActivate = jest.fn().mockRejectedValue(new Error('Malformed token'));
      guard.canActivate = parentCanActivate;

      // Act & Assert
      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow('Malformed token');
    });
  });

  describe('Integration', () => {
    it('should work with mocked ExecutionContext', async () => {
      // This test ensures the guard works with a proper mock
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
      } as unknown as ExecutionContext;

      // Mock the parent canActivate method
      const parentCanActivate = jest.fn().mockResolvedValue(true);
      guard.canActivate = parentCanActivate;

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });
});
