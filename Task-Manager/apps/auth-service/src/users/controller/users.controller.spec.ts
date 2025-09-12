import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserResponse = new UserResponseDto(mockUser);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('should successfully create a new user', async () => {
      // Arrange
      const newUser = { ...mockUser, ...createUserDto };
      usersService.create.mockResolvedValue(newUser);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.email).toBe(createUserDto.email);
      expect(result.username).toBe(createUserDto.username);
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      const conflictError = new ConflictException('User with this email or username already exists');
      usersService.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow(conflictError);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors properly', async () => {
      // Arrange
      const validationError = new Error('Validation failed');
      usersService.create.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow(validationError);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      // Arrange
      const users = [
        mockUser,
        { ...mockUser, id: 'another-id', email: 'another@example.com', username: 'anotheruser' },
      ];
      usersService.findAll.mockResolvedValue(users);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[1]).toBeInstanceOf(UserResponseDto);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      usersService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      usersService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(serviceError);
    });
  });

  describe('findOne', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return user when found', async () => {
      // Arrange
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException(`User with ID ${userId} not found`);
      usersService.findOne.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.findOne(userId)).rejects.toThrow(notFoundError);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle invalid UUID format', async () => {
      // Arrange
      const invalidId = 'invalid-uuid';
      const validationError = new Error('Invalid UUID format');
      usersService.findOne.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.findOne(invalidId)).rejects.toThrow(validationError);
    });
  });

  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      username: 'updateduser',
    };

    it('should successfully update user', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateUserDto };
      usersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, updateUserDto);

      // Assert
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.email).toBe(updateUserDto.email);
      expect(result.username).toBe(updateUserDto.username);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException(`User with ID ${userId} not found`);
      usersService.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(notFoundError);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should handle update with password', async () => {
      // Arrange
      const updateWithPassword = {
        ...updateUserDto,
        password: 'newPassword123',
      };
      const updatedUser = { ...mockUser, ...updateWithPassword };
      usersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, updateWithPassword);

      // Assert
      expect(usersService.update).toHaveBeenCalledWith(userId, updateWithPassword);
      expect(result).toBeInstanceOf(UserResponseDto);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate = { email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, ...partialUpdate };
      usersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, partialUpdate);

      // Assert
      expect(usersService.update).toHaveBeenCalledWith(userId, partialUpdate);
      expect(result.email).toBe(partialUpdate.email);
      expect(result.username).toBe(mockUser.username); // Should keep original username
    });
  });

  describe('remove', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should successfully remove user', async () => {
      // Arrange
      usersService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(usersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException(`User with ID ${userId} not found`);
      usersService.remove.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(notFoundError);
      expect(usersService.remove).toHaveBeenCalledWith(userId);
    });

    it('should handle database errors during removal', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      usersService.remove.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(databaseError);
    });
  });

  describe('Guard Integration', () => {
    it('should be protected by JwtAuthGuard', () => {
      // Get the guard from the controller metadata
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user lifecycle', async () => {
      // Arrange
      const createDto: CreateUserDto = {
        email: 'lifecycle@example.com',
        username: 'lifecycleuser',
        password: 'password123',
      };

      const updateDto: UpdateUserDto = {
        email: 'updated-lifecycle@example.com',
        username: 'updated-lifecycleuser',
      };

      const createdUser = { ...mockUser, ...createDto, id: 'new-user-id' };
      const updatedUser = { ...createdUser, ...updateDto };

      usersService.create.mockResolvedValue(createdUser);
      usersService.findOne.mockResolvedValue(createdUser);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.remove.mockResolvedValue(undefined);

      // Act & Assert - Create
      const createResult = await controller.create(createDto);
      expect(createResult.email).toBe(createDto.email);
      expect(createResult.username).toBe(createDto.username);

      // Act & Assert - Find
      const findResult = await controller.findOne('new-user-id');
      expect(findResult.id).toBe('new-user-id');

      // Act & Assert - Update
      const updateResult = await controller.update('new-user-id', updateDto);
      expect(updateResult.email).toBe(updateDto.email);

      // Act & Assert - Remove
      const removeResult = await controller.remove('new-user-id');
      expect(removeResult).toBeUndefined();

      // Verify all services were called correctly
      expect(usersService.create).toHaveBeenCalledWith(createDto);
      expect(usersService.findOne).toHaveBeenCalledWith('new-user-id');
      expect(usersService.update).toHaveBeenCalledWith('new-user-id', updateDto);
      expect(usersService.remove).toHaveBeenCalledWith('new-user-id');
    });
  });
});
