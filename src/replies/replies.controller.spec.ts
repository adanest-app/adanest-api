import { CommentsService } from '../comments/comments.service';
import { RepliesController } from './replies.controller';
import mongoose, { UpdateWriteOpResult } from 'mongoose';
import { ReplyDocument } from './schemas/reply.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { RepliesService } from './replies.service';

const fakeReply = {
  comment: '60f1b2b5b5f9d7a9c4c8c7a9',
  content: 'test content',
};

const fakeAuth = {
  user: {
    userId: '60f1b2b5b5f9d7a9c4c8c7a8',
  },
};

describe('RepliesController', () => {
  let repliesController: RepliesController;
  let repliesService: RepliesService;
  let commentsService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepliesController],
      providers: [
        {
          provide: RepliesService,
          useValue: {
            create: jest.fn().mockResolvedValueOnce(fakeReply),
            findAll: jest.fn(),
            findRepliesByComment: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            checkReplyOwner: jest.fn(),
          },
        },
        {
          provide: CommentsService,
          useValue: {
            isExists: jest.fn(),
          },
        },
      ],
    }).compile();

    repliesController = module.get<RepliesController>(RepliesController);
    repliesService = module.get<RepliesService>(RepliesService);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(repliesController).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if comment not found', async () => {
      jest.spyOn(commentsService, 'isExists').mockResolvedValueOnce(false);
      await expect(
        repliesController.create(fakeAuth, fakeReply),
      ).rejects.toThrow('Comment Not Found');
    });

    it('should create a reply', async () => {
      jest.spyOn(commentsService, 'isExists').mockResolvedValueOnce(true);
      expect(await repliesController.create(fakeAuth, fakeReply)).toBe(
        fakeReply,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of replies', async () => {
      const result = [fakeReply];
      jest
        .spyOn(repliesService, 'findAll')
        .mockResolvedValueOnce(result as unknown as ReplyDocument[]);
      expect(await repliesController.findAll(fakeReply.comment)).toBe(result);
    });
  });

  describe('findRepliesByComment', () => {
    it('should return an array of replies', async () => {
      const result = [fakeReply];
      jest
        .spyOn(repliesService, 'findRepliesByComment')
        .mockResolvedValueOnce(result as unknown as ReplyDocument[]);
      expect(
        await repliesController.findRepliesByComment(fakeReply.comment),
      ).toBe(result);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if reply not found', async () => {
      jest
        .spyOn(repliesService, 'checkReplyOwner')
        .mockResolvedValueOnce(false);
      await expect(
        repliesController.update(fakeAuth, 'replyId', fakeReply),
      ).rejects.toThrow('Reply not found');
    });

    it('should update a reply', async () => {
      const updateResult = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      jest.spyOn(repliesService, 'checkReplyOwner').mockResolvedValueOnce(true);
      jest
        .spyOn(repliesService, 'update')
        .mockResolvedValueOnce(updateResult as unknown as UpdateWriteOpResult);
      expect(
        await repliesController.update(fakeAuth, 'replyId', fakeReply),
      ).toBe(updateResult);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if reply not found', async () => {
      jest
        .spyOn(repliesService, 'checkReplyOwner')
        .mockResolvedValueOnce(false);
      await expect(
        repliesController.remove(fakeAuth, 'replyId'),
      ).rejects.toThrow('Reply not found');
    });

    it('should remove a reply', async () => {
      const removeResult = {
        acknowledged: true,
        deletedCount: 1,
      };
      jest.spyOn(repliesService, 'checkReplyOwner').mockResolvedValueOnce(true);
      jest
        .spyOn(repliesService, 'remove')
        .mockResolvedValueOnce(
          removeResult as unknown as mongoose.mongo.DeleteResult,
        );
      expect(await repliesController.remove(fakeAuth, 'replyId')).toBe(
        removeResult,
      );
    });
  });
});
