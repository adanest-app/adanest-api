import mongoose, { Model, Query, UpdateWriteOpResult } from 'mongoose';
import { Reply, ReplyDocument } from './schemas/reply.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { RepliesService } from './replies.service';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';

const fakeReply = {
  comment: '60f1b2b5b5f9d7a9c4c8c7a9',
  content: 'test content',
};

describe('RepliesService', () => {
  let repliesService: RepliesService;
  let replyModel: Model<ReplyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepliesService,
        {
          provide: getModelToken(Reply.name),
          useValue: {
            create: jest.fn().mockResolvedValueOnce(fakeReply),
            find: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    repliesService = module.get<RepliesService>(RepliesService);
    replyModel = module.get<Model<ReplyDocument>>(getModelToken(Reply.name));
  });

  it('should be defined', () => {
    expect(repliesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a reply', async () => {
      expect(await repliesService.create(fakeReply)).toBe(fakeReply);
    });
  });

  describe('findAll', () => {
    it('should return an array of replies', async () => {
      const result = [fakeReply];
      jest.spyOn(replyModel, 'find').mockReturnValueOnce(
        createMock<Query<ReplyDocument[], ReplyDocument>>({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce(result),
        }),
      );
      expect(await repliesService.findAll(fakeReply.comment)).toBe(result);
    });

    it('should return an empty array', async () => {
      jest.spyOn(replyModel, 'find').mockReturnValueOnce(
        createMock<Query<ReplyDocument[], ReplyDocument>>({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce([]),
        }),
      );
      expect(await repliesService.findAll(fakeReply.comment)).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a reply', async () => {
      const updatedReply = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a8',
        content: 'updated content',
      };
      const updateResult = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };

      jest.spyOn(replyModel, 'updateOne').mockReturnValueOnce(
        createMock<Query<UpdateWriteOpResult, ReplyDocument>>({
          exec: jest.fn().mockResolvedValueOnce(updateResult),
        }),
      );
      expect(
        await repliesService.update(updatedReply._id, {
          content: updatedReply.content,
        }),
      ).toBe(updateResult);
    });
  });

  describe('remove', () => {
    it('should remove a reply', async () => {
      const deletedReply = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a8',
      };
      const deleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      jest.spyOn(replyModel, 'deleteOne').mockReturnValueOnce(
        createMock<Query<mongoose.mongo.DeleteResult, ReplyDocument>>({
          exec: jest.fn().mockResolvedValueOnce(deleteResult),
        }),
      );
      expect(await repliesService.remove(deletedReply._id)).toBe(deleteResult);
    });
  });

  describe('checkReplyOwner', () => {
    it('should return true if reply owner is the same as the user', async () => {
      const reply = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a8',
        owner: '60f1b2b5b5f9d7a9c4c8c7a9',
      };
      jest.spyOn(replyModel, 'findById').mockReturnValueOnce(
        createMock<Query<ReplyDocument, ReplyDocument>>({
          exec: jest.fn().mockResolvedValueOnce(reply),
        }),
      );
      expect(await repliesService.checkReplyOwner(reply._id, reply.owner)).toBe(
        true,
      );
    });

    it('should return false if reply owner is not the same as the user', async () => {
      const reply = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a8',
        owner: '60f1b2b5b5f9d7a9c4c8c7a9',
      };
      jest.spyOn(replyModel, 'findById').mockReturnValueOnce(
        createMock<Query<ReplyDocument, ReplyDocument>>({
          exec: jest.fn().mockResolvedValueOnce(reply),
        }),
      );
      expect(
        await repliesService.checkReplyOwner(reply._id, 'fakeUserId'),
      ).toBe(false);
    });

    it('should throw NotFoundException if reply not found', async () => {
      const reply = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a8',
        owner: '60f1b2b5b5f9d7a9c4c8c7a9',
      };
      jest.spyOn(replyModel, 'findById').mockReturnValueOnce(
        createMock<Query<ReplyDocument, ReplyDocument>>({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      );
      await expect(
        repliesService.checkReplyOwner(reply._id, reply.owner),
      ).rejects.toThrowError('Reply not found');
    });
  });

  describe('findRepliesByComment', () => {
    it('should return an array of replies', async () => {
      const result = [fakeReply];
      jest.spyOn(replyModel, 'find').mockReturnValueOnce(
        createMock<Query<ReplyDocument[], ReplyDocument>>({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce(result),
        }),
      );
      expect(await repliesService.findRepliesByComment(fakeReply.comment)).toBe(
        result,
      );
    });

    it('should return an empty array', async () => {
      jest.spyOn(replyModel, 'find').mockReturnValueOnce(
        createMock<Query<ReplyDocument[], ReplyDocument>>({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce([]),
        }),
      );
      expect(
        await repliesService.findRepliesByComment(fakeReply.comment),
      ).toEqual([]);
    });
  });
});
