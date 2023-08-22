import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            hashPassword: jest.fn(),
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login return access_token and user', async () => {
    const fakeUser = {
      _id: '1',
      username: 'test',
    };

    jest.spyOn(authService, 'generateToken').mockResolvedValue('token');
    const result = await controller.login({ user: fakeUser });
    expect(result).toEqual({
      access_token: 'token',
      user: {
        id: fakeUser._id,
        username: fakeUser.username,
      },
    });
  });

  it('should forgotPassword return Forgot password email sent', async () => {
    jest.spyOn(authService, 'forgotPassword').mockResolvedValue(undefined);
    const result = await controller.forgotPassword({ email: 'email' });
    expect(result).toEqual('Forgot password email sent');
  });

  it('should resetPassword return Reset password success', async () => {
    jest.spyOn(authService, 'resetPassword').mockResolvedValue(undefined);
    jest.spyOn(usersService, 'hashPassword').mockResolvedValue('password');
    const result = await controller.resetPassword({
      password: 'password',
      token: 'token',
    });
    expect(result).toEqual('Reset password success');
  });
});
