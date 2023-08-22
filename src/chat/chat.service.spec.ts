import { Model, Query, UpdateWriteOpResult } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { ChatService } from './chat.service';
import { Chat } from './chat.schema';

describe('ChatService', () => {
  let service: ChatService;
  let chatModel: Model<Chat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Chat.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatModel = module.get<Model<Chat>>(getModelToken(Chat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a chat', async () => {
    const chat = {
      sender: 'sender',
      receiver: 'receiver',
      message: 'message',
    };
    jest.spyOn(chatModel, 'create').mockResolvedValueOnce(chat as any);
    expect(await service.create(chat)).toBe(chat);
  });

  it('should get client messages ', async () => {
    const chat = {
      sender: 'sender',
      receiver: 'receiver',
      message: 'message',
    };
    jest.spyOn(chatModel, 'find').mockReturnValue(
      createMock<Query<Chat[], unknown>>({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([chat]),
      }),
    );

    expect(await service.getMessages('sender', 'receiver')).toEqual([chat]);
  });

  it('should get admin messages ', async () => {
    const chat = {
      sender: 'sender',
      receiver: 'receiver',
      message: 'message',
    };
    jest.spyOn(chatModel, 'find').mockReturnValue(
      createMock<Query<Chat[], unknown>>({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([chat]),
      }),
    );
    expect(await service.getMessages('sender', 'receiver', true)).toEqual([
      chat,
    ]);
  });

  it('should update state', async () => {
    const validObjectId = '60f1b5b6b3c1d32d6c5a7d3f';
    const res: UpdateWriteOpResult = {
      acknowledged: true,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
      matchedCount: 1,
    };
    jest.spyOn(chatModel, 'updateOne').mockReturnValue(
      createMock<Query<UpdateWriteOpResult, unknown>>({
        exec: jest.fn().mockResolvedValueOnce(res),
      }),
    );

    expect(await service.updateState(validObjectId, 1)).toEqual(res);
  });
});
