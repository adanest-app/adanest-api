import { UserDocument } from 'src/users/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { Token } from './token/token.schema';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';

const fakeUser = {
  username: 'test',
  email: 'email@mail.com',
  password: 'test',
  firstName: 'test',
  _id: 1,
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let tokenModel: Model<Token>;
  let jwtService: JwtService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(Token.name),
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
            exists: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserByUsername: jest.fn().mockResolvedValue(fakeUser),
            getUserPassword: jest
              .fn()
              .mockResolvedValue({ password: fakeUser.password }),
            getUserByEmail: jest.fn().mockResolvedValue(fakeUser),
            updateUser: jest.fn().mockResolvedValue({
              acknowledged: true,
            }),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
            verifyAsync: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(
              (key: string) =>
                ({
                  salt_rounds: 10,
                  token: {
                    reset_password: '60s',
                  },
                }[key]),
            ),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    tokenModel = module.get<Model<Token>>(getModelToken(Token.name));
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should validate user by username', async () => {
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(undefined);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    expect(
      await authService.validateUser(fakeUser.username, fakeUser.password),
    ).toEqual(fakeUser);
  });

  it('should validate user by email', async () => {
    jest.spyOn(usersService, 'getUserByUsername').mockResolvedValue(undefined);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    expect(
      await authService.validateUser(fakeUser.email, fakeUser.password),
    ).toEqual(fakeUser);
  });

  it('should return null if user not found', async () => {
    jest.spyOn(usersService, 'getUserByUsername').mockResolvedValue(undefined);
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(undefined);
    expect(
      await authService.validateUser(fakeUser.email, fakeUser.password),
    ).toEqual(null);
  });

  it('should return null if password is incorrect', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    expect(
      await authService.validateUser(fakeUser.email, fakeUser.password),
    ).toEqual(null);
  });

  it('should generate token', async () => {
    const fakePayload = {
      username: fakeUser.username,
      sub: fakeUser._id,
      type: 'reset-password',
    };
    expect(await authService.generateToken(fakePayload, '60s')).toEqual(
      'token',
    );
  });

  it('should verify token', async () => {
    jest.spyOn(tokenModel, 'exists').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue({ _id: 1 }),
    } as any);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
      username: fakeUser.username,
      sub: fakeUser._id,
      type: 'reset-password',
    });
    expect(await authService.verifyToken('token', 'reset-password')).toEqual({
      username: fakeUser.username,
      sub: fakeUser._id,
      type: 'reset-password',
    });
  });

  it('should return null if token not found', async () => {
    jest.spyOn(tokenModel, 'exists').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(undefined),
    } as any);
    expect(await authService.verifyToken('token', 'reset-password')).toEqual(
      null,
    );
  });

  it('should throw BadRequestException if email not found', async () => {
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(undefined);
    await expect(authService.forgotPassword(fakeUser.email)).rejects.toThrow(
      'Email not found',
    );
  });

  it('should send forgot password token', async () => {
    jest
      .spyOn(usersService, 'getUserByEmail')
      .mockResolvedValueOnce(createMock<UserDocument>(fakeUser));
    jest.spyOn(authService, 'generateToken').mockResolvedValueOnce('token');
    await authService.forgotPassword(fakeUser.email);
    expect(mailerService.sendMail).toHaveBeenCalled();
  });

  it('should throw BadRequestException if token not found', async () => {
    jest.spyOn(authService, 'verifyToken').mockResolvedValueOnce(null);
    await expect(
      authService.resetPassword('token', 'new-password'),
    ).rejects.toThrow('Invalid Token');
  });

  it('should reset password', async () => {
    jest.spyOn(authService, 'verifyToken').mockResolvedValueOnce({
      username: fakeUser.username,
      sub: fakeUser._id,
      type: 'reset-password',
    });
    jest.spyOn(usersService, 'updateUser').mockResolvedValueOnce({
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
      username: fakeUser.username,
      sub: fakeUser._id,
      type: 'reset-password',
    });
    jest.spyOn(tokenModel, 'deleteOne').mockResolvedValueOnce(
      createMock<DeleteResult>({
        acknowledged: true,
        deletedCount: 1,
      }),
    );

    expect(await authService.resetPassword('token', 'new-password')).toEqual({
      message: 'Password berhasil diperbarui',
    });
  });
});
