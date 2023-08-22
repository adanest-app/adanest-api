import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ObjectId, UpdateWriteOpResult } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDocument } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { createMock } from '@golevelup/ts-jest';
import { UsersService } from './users.service';

const fakeUser = {
  username: 'test',
  email: 'test@test.com',
  password: 'test',
  firstName: 'test',
  lastName: 'test',
};

const id = '60f1b2b5b5f9d7a9c4c8c7a9';

const fakeUserId = { _id: id, id, userId: id };

const fakeUserWithId = { ...fakeUser, _id: id };

describe('UserController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
            isExists: jest.fn(),
            isEmailTaken: jest.fn(),
            deleteUser: jest.fn(),
            hashPassword: jest.fn().mockResolvedValueOnce('hashedPassword'),
            updateUser: jest.fn(),
            uploadAvatar: jest.fn(),
          },
        },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get users', async () => {
    const user = createMock<UserDocument[]>([fakeUser]);
    jest.spyOn(usersService, 'getUsers').mockResolvedValueOnce(user);

    expect(await controller.getUsers()).toEqual(user);
  });

  it('should get user', async () => {
    const user = fakeUserWithId;
    jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(
      createMock<UserDocument>({
        toObject: jest.fn().mockReturnValueOnce(user),
      }),
    );
    expect(await controller.getUser({ id })).toEqual(user);
  });

  it('should get undefined user', async () => {
    jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(undefined);
    jest
      .spyOn(usersService, 'getUserByUsername')
      .mockResolvedValueOnce(undefined);
    expect(await controller.getUser({ id })).toEqual({});
  });

  it('should get user by username', async () => {
    const user = fakeUserWithId;
    jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(undefined);
    jest.spyOn(usersService, 'getUserByUsername').mockResolvedValueOnce(
      createMock<UserDocument>({
        toObject: jest.fn().mockReturnValueOnce(user),
      }),
    );
    expect(await controller.getUser({ username: fakeUser.username })).toEqual(
      user,
    );
  });

  it('should create user', async () => {
    const user = createMock<UserDocument>(fakeUser);
    jest.spyOn(usersService, 'createUser').mockResolvedValueOnce(user);
    jest.spyOn(usersService, 'isEmailTaken').mockResolvedValueOnce(false);

    expect(await controller.createUser(user)).toEqual('User created');
  });

  it('should not create user if email is taken', async () => {
    const user = createMock<UserDocument>(fakeUser);
    jest.spyOn(usersService, 'isEmailTaken').mockResolvedValueOnce(true);

    await expect(controller.createUser(user)).rejects.toThrow('User Is Exists');
  });

  it('should delete user', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'deleteUser').mockResolvedValueOnce({
      deletedCount: 1,
      acknowledged: true,
    });
    expect(await controller.deleteUser({ user: fakeUserId })).toEqual(
      'User deleted',
    );
  });

  it('should not delete user if user not exists', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(false);
    await expect(controller.deleteUser({ user: fakeUserId })).rejects.toThrow(
      'User Not Found',
    );
  });

  it('should update user', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'getUserByUsername').mockResolvedValueOnce(
      createMock<UserDocument>({
        id: id as any as ObjectId,
        ...fakeUserWithId,
      }),
    );
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(
      createMock<UserDocument>({
        id: id as any as ObjectId,
        ...fakeUserWithId,
      }),
    );
    jest.spyOn(usersService, 'updateUser').mockResolvedValueOnce(
      createMock<UpdateWriteOpResult>({
        modifiedCount: 1,
      }),
    );
    expect(
      await controller.updateUser({ user: fakeUserId }, { firstName: 'hello' }),
    ).toEqual('User updated');
  });

  it('should not update user if user not exists', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(false);
    await expect(
      controller.updateUser({ user: fakeUserId }, fakeUserWithId),
    ).rejects.toThrow('User Not Found');
  });

  it('should not update user if username is taken', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    const getUserByUsername = jest
      .spyOn(usersService, 'getUserByUsername')
      .mockResolvedValue(
        createMock<UserDocument>({
          id: 1 as any as ObjectId,
          ...fakeUserWithId,
        }),
      );
    await expect(
      controller.updateUser({ user: fakeUserId }, fakeUserWithId),
    ).rejects.toThrow('Username is taken');
    expect(getUserByUsername).toBeCalledTimes(1);
    expect(getUserByUsername).toBeCalledWith(fakeUserWithId.username);
  });

  it('should not update user if email is taken', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(
      createMock<UserDocument>({
        id: 1 as any as ObjectId,
        ...fakeUserWithId,
      }),
    );
    await expect(
      controller.updateUser({ user: fakeUserId }, fakeUserWithId),
    ).rejects.toThrow('Email is taken');
  });

  it('should update user password', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'updateUser').mockResolvedValueOnce(
      createMock<UpdateWriteOpResult>({
        modifiedCount: 1,
      }),
    );
    expect(
      await controller.updateUser(
        { user: fakeUserId },
        {
          password: 'baru',
        },
      ),
    ).toEqual('User updated');
  });

  it('should upload user avatar', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'uploadAvatar').mockResolvedValueOnce('url.com');
    jest.spyOn(usersService, 'updateUser').mockResolvedValueOnce(
      createMock<UpdateWriteOpResult>({
        modifiedCount: 1,
      }),
    );
    expect(
      await controller.uploadAvatar(
        { user: fakeUserId },
        createMock<Express.Multer.File>(),
      ),
    ).toEqual('url.com');
  });

  it('should not upload user avatar if user not exists', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(false);
    await expect(
      controller.uploadAvatar(
        { user: fakeUserId },
        createMock<Express.Multer.File>(),
      ),
    ).rejects.toThrow('User Not Found');
  });

  it('should not upload user avatar if upload failed', async () => {
    jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
    jest.spyOn(usersService, 'uploadAvatar').mockResolvedValueOnce(undefined);
    await expect(
      controller.uploadAvatar(
        { user: fakeUserId },
        createMock<Express.Multer.File>(),
      ),
    ).rejects.toThrow('Upload Failed');
  });
});
