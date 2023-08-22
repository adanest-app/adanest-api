import { UploadOptions } from 'imagekit/dist/libs/interfaces';
import { Model, Query, UpdateWriteOpResult } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { DeleteResult } from 'mongodb';
import ImageKit from 'imagekit';

jest.mock('imagekit');

const fakeUser = {
  username: 'test',
  email: 'test@test.com',
  password: 'test',
  firstName: 'test',
  lastName: 'test',
};
const fakeUserId = { _id: '60f1b2b5b5f9d7a9c4c8c7a9' };

const fakeUserWithId = { ...fakeUser, ...fakeUserId };

const fakeUserRole = {
  role: 'admin',
  ...fakeUserWithId,
};

const mockUserModel = () => ({
  create: jest.fn().mockResolvedValueOnce(fakeUser),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  exists: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementationOnce(
              (key: string) =>
                ({
                  salt_rounds: 10,
                }[key]),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    expect(await service.createUser(fakeUser)).toEqual(fakeUser);
  });

  it('should get all users', async () => {
    jest.spyOn(userModel, 'find').mockReturnValueOnce(
      createMock<Query<UserDocument[], UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce([fakeUser]),
      }),
    );
    expect(await service.getUsers()).toEqual([fakeUser]);
  });

  it('should get a user by id', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(fakeUserWithId),
      }),
    );
    expect(await service.getUserById(fakeUserWithId._id)).toEqual(
      fakeUserWithId,
    );
  });

  it('should get a user by email', async () => {
    jest.spyOn(userModel, 'findOne').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(fakeUser),
      }),
    );
    expect(await service.getUserByEmail(fakeUser.email)).toEqual(fakeUser);
  });

  it('should get a user by username', async () => {
    jest.spyOn(userModel, 'findOne').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(fakeUser),
      }),
    );
    expect(await service.getUserByUsername(fakeUser.username)).toEqual(
      fakeUser,
    );
  });

  it('should get users by role', async () => {
    jest.spyOn(userModel, 'find').mockReturnValueOnce(
      createMock<Query<UserDocument[], UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce([fakeUserRole]),
      }),
    );
    expect(await service.getUsersByRole(fakeUserRole.role)).toEqual([
      fakeUserRole,
    ]);
  });

  it('should check if a user exists', async () => {
    jest.spyOn(userModel, 'exists').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(fakeUserId),
      }),
    );

    expect(await service.isExists(fakeUserId._id)).toEqual(fakeUserId);
  });

  it('should return true if a user exists by email', async () => {
    jest.spyOn(userModel, 'exists').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(fakeUser),
      }),
    );

    expect(await service.isEmailTaken(fakeUser.email)).toEqual(true);
  });

  it('should return false if a user not exists by email', async () => {
    jest.spyOn(userModel, 'exists').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce(undefined),
      }),
    );

    expect(await service.isEmailTaken(fakeUser.email)).toEqual(false);
  });

  it('should delete a user', async () => {
    jest.spyOn(userModel, 'deleteOne').mockReturnValueOnce(
      createMock<Query<DeleteResult, UserDocument>>({
        exec: jest.fn().mockResolvedValueOnce({ deletedCount: 1 }),
      }),
    );

    expect(await service.deleteUser(fakeUserWithId._id)).toEqual({
      deletedCount: 1,
    });
  });

  it('should update a user firstName', async () => {
    const updateOneMock = jest
      .spyOn(userModel, 'updateOne')
      .mockReturnValueOnce(
        createMock<Query<UpdateWriteOpResult, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce({ modifiedCount: 1 }),
        }),
      );
    const updatedName = { firstName: 'test update' };
    expect(await service.updateUser(fakeUserWithId._id, updatedName)).toEqual({
      modifiedCount: 1,
    });
    expect(updateOneMock).toBeCalledWith(
      { _id: fakeUserWithId._id },
      updatedName,
    );
  });

  it('should hash a password', async () => {
    const hash = jest.spyOn(service, 'hashPassword');
    const password = 'test';
    const hashedPassword = await service.hashPassword(password);
    expect(hash).toBeCalledWith(password);
    expect(hashedPassword).not.toEqual(password);
  });

  it('should upload a profile picture return url', async () => {
    jest
      .spyOn(ImageKit.prototype, 'upload')
      .mockImplementation(async (options: UploadOptions) => {
        expect(options).toEqual({
          file: expect.any(Buffer),
          fileName: expect.any(String),
          folder: expect.any(String),
          useUniqueFileName: expect.any(Boolean),
        });
        return {
          url: 'https://test.com',
        };
      });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    expect(await service.uploadAvatar(fakeUserWithId._id, file)).toEqual(
      'https://test.com',
    );
  });

  it('should upload a profile picture return null', async () => {
    jest
      .spyOn(ImageKit.prototype, 'upload')
      .mockImplementation(async (options: UploadOptions) => {
        expect(options).toEqual({
          file: expect.any(Buffer),
          fileName: expect.any(String),
          folder: expect.any(String),
          useUniqueFileName: expect.any(Boolean),
        });
        return undefined;
      });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    expect(
      await service.uploadAvatar(fakeUserWithId._id, file),
    ).toBeUndefined();
  });

  it('should throw ForbiddenException if upload failed', async () => {
    jest.spyOn(ImageKit.prototype, 'upload').mockImplementation(async () => {
      throw new Error('Upload failed');
    });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    await expect(
      service.uploadAvatar(fakeUserWithId._id, file),
    ).rejects.toThrowError('Upload failed');
  });

  it('should get a user password', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce(
      createMock<Query<UserDocument, UserDocument>>({
        select: jest
          .fn()
          .mockReturnThis()
          .mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
              exec: jest.fn().mockResolvedValueOnce({ password: 'test' }),
            }),
          ),
      }),
    );
    expect(await service.getUserPassword(fakeUserWithId._id)).toEqual({
      password: 'test',
    });
  });
});
