import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { createMock } from '@golevelup/ts-jest';
import { ChatService } from './chat.service';
import mongoose from 'mongoose';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            getMessages: jest.fn(),
            create: jest.fn(),
            updateState: jest.fn(),
            deleteMessage: jest.fn(),
            getMessageById: jest.fn(),
          },
        },

        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
            getUsersByRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get messages if admin', async () => {
    const req = {
      user: {
        userId: '123',
      },
    };
    const user = {
      role: 'admin',
    };
    const messages = [];
    jest
      .spyOn(userService, 'getUserById')
      .mockResolvedValueOnce(createMock<UserDocument>(user));
    jest.spyOn(chatService, 'getMessages').mockResolvedValueOnce(messages);
    expect(await controller.getMessages(req, req.user.userId)).toBe(messages);
  });

  it('should get messages if not admin', async () => {
    const req = {
      user: {
        userId: '123',
      },
    };
    const user = {
      role: 'user',
    };
    const admin = {
      _id: '123',
    };
    const messages = [];
    jest
      .spyOn(userService, 'getUserById')
      .mockResolvedValueOnce(createMock<UserDocument>(user));
    jest
      .spyOn(userService, 'getUsersByRole')
      .mockResolvedValueOnce([createMock<UserDocument>(admin)]);
    jest.spyOn(chatService, 'getMessages').mockResolvedValueOnce(messages);
    expect(await controller.getMessages(req, req.user.userId)).toBe(messages);
  });

  it('should send message if admin', async () => {
    const req = {
      user: {
        userId: '5f9d4f8d1d9d9b1b3c9c8d9a',
      },
    };
    const user = {
      role: 'admin',
    };

    const message = {
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };
    jest
      .spyOn(userService, 'getUserById')
      .mockResolvedValueOnce(createMock<UserDocument>(user));
    jest.spyOn(chatService, 'create').mockResolvedValueOnce(message);
    expect(
      await controller.sendMessage(
        req,
        message.receiver.toString(),
        message.message,
      ),
    ).toBe(message);
  });

  it('should send message if not admin', async () => {
    const req = {
      user: {
        userId: '5f9d4f8d1d9d9b1b3c9c8d9a',
      },
    };
    const user = {
      role: 'user',
    };
    const admin = {
      _id: '5f9d4f8d1d9d9b1b3c9c8d9b',
    };
    const message = {
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };
    jest
      .spyOn(userService, 'getUserById')
      .mockResolvedValueOnce(createMock<UserDocument>(user));
    jest
      .spyOn(userService, 'getUsersByRole')
      .mockResolvedValueOnce([createMock<UserDocument>(admin)]);
    jest.spyOn(chatService, 'create').mockResolvedValueOnce(message);
    expect(
      await controller.sendMessage(
        req,
        message.receiver.toString(),
        message.message,
      ),
    ).toBe(message);
  });

  it('should not read message if not owner', async () => {
    const message = {
      _id: '5f9d4f8d1d9d9b1b3c9c8d9a',
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };
    jest.spyOn(chatService, 'getMessageById').mockResolvedValueOnce(message);
    expect(
      await controller.readMessage(
        {
          user: {
            userId: '5f9d4f8d1d9d9b1b3c9c8d9c',
          },
        },
        message._id,
      ),
    ).toBe('You are not receiver of this message');
  });

  it('should read message', async () => {
    const message = {
      _id: '5f9d4f8d1d9d9b1b3c9c8d9a',
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };
    jest.spyOn(chatService, 'getMessageById').mockResolvedValueOnce(message);
    jest.spyOn(chatService, 'updateState').mockResolvedValueOnce({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
    });
    expect(
      await controller.readMessage(
        {
          user: {
            userId: message.receiver.toString(),
          },
        },
        message._id,
      ),
    ).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
    });
  });

  it('should not delete message if not owner', async () => {
    const message = {
      _id: '5f9d4f8d1d9d9b1b3c9c8d9a',
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };

    jest.spyOn(chatService, 'getMessageById').mockResolvedValueOnce(message);
    expect(
      await controller.deleteMessage(
        {
          user: {
            userId: '5f9d4f8d1d9d9b1b3c9c8d9c',
          },
        },
        message._id,
      ),
    ).toBe('You are not owner of this message');
  });

  it('should delete message', async () => {
    const message = {
      _id: '5f9d4f8d1d9d9b1b3c9c8d9a',
      sender: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9a'),
      receiver: new mongoose.Types.ObjectId('5f9d4f8d1d9d9b1b3c9c8d9b'),
      message: 'message',
      state: 'sent',
    };
    jest.spyOn(chatService, 'getMessageById').mockResolvedValueOnce(message);
    jest.spyOn(chatService, 'deleteMessage').mockResolvedValueOnce({
      acknowledged: true,
      deletedCount: 1,
    });
    expect(
      await controller.deleteMessage(
        {
          user: {
            userId: message.sender.toString(),
          },
        },
        message._id,
      ),
    ).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
  });
});
