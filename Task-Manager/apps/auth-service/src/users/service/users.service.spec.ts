import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';








jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    username: 'newuser',
    password: 'plainPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      const hashedPassword = '$2b$12$newhashedpassword';
      repository.findOne.mockResolvedValue(null); // No existing user
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockReturnValue({
        ...mockCreateUserDto,
        password: hashedPassword,
      } as User);
      repository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: [
          { email: mockCreateUserDto.email },
          { username: mockCreateUserDto.username },
        ],
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 12);
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        new ConflictException('User with this email or username already exists')
      );
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of users without password', async () => {
      // Arrange
      const mockUsers = [mockUser, { ...mockUser, id: 'another-id', email: 'another@example.com' }];
      repository.find.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const email = 'test@example.com';
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when found by username', async () => {
      // Arrange
      const username = 'testuser';
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByUsername(username);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by username', async () => {
      // Arrange
      const username = 'nonexistentuser';
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByUsername(username);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      username: 'updateduser',
    };

    it('should successfully update user without password', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateUserDto };
      
      // Mock findOne to return existing user first, then updated user
      repository.findOne
        .mockResolvedValueOnce(mockUser) // First call in update method
        .mockResolvedValueOnce(updatedUser); // Second call in findOne method

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should successfully update user with password', async () => {
      // Arrange
      const updateUserDtoWithPassword = {
        ...updateUserDto,
        password: 'newPassword123',
      };
      const hashedPassword = '$2b$12$newhashedpassword';
      const updatedUser = { ...mockUser, ...updateUserDto, password: hashedPassword };

      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      repository.findOne
        .mockResolvedValueOnce(mockUser) // First call in update method
        .mockResolvedValueOnce(updatedUser); // Second call in findOne method

      // Act
      const result = await service.update(userId, updateUserDtoWithPassword);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(repository.update).toHaveBeenCalledWith(userId, {
        ...updateUserDtoWithPassword,
        password: hashedPassword,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should not hash password when password is empty string', async () => {
      // Arrange
      const updateUserDtoWithEmptyPassword = {
        ...updateUserDto,
        password: '',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      repository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      // Act
      const result = await service.update(userId, updateUserDtoWithEmptyPassword);

      // Assert
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDtoWithEmptyPassword);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should successfully remove user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      await service.remove(userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = '$2b$12$hashedpassword';
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validatePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when password is invalid', async () => {
      // Arrange
      const plainPassword = 'wrongpassword';
      const hashedPassword = '$2b$12$hashedpassword';
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validatePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('setCurrentRefreshToken', () => {
    it('should update user refresh token', async () => {
      // Arrange
      const hashedToken = 'hashed-refresh-token';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      await service.setCurrentRefreshToken(hashedToken, userId);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(userId, {});
    });
  });
});
