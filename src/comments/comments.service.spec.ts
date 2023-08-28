import { Model, Query, UpdateWriteOpResult, mongo } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';

const fakeComment = {
  _id: '60f1b2b5b5f9d7a9c4c8c7a9',
  content: 'test content',
  owner: 'test owner',
  post: 'test post',
};

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentModel: Model<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Comment.name),
          useValue: {
            create: jest.fn().mockResolvedValueOnce(fakeComment),
            find: jest.fn(),
            findById: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            exists: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    commentModel = module.get<Model<Comment>>(getModelToken(Comment.name));
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      expect(await commentsService.create(fakeComment)).toBe(fakeComment);
    });
  });

  describe('findAll', () => {
    it('should find all comments', async () => {
      const comments = [fakeComment];
      jest.spyOn(commentModel, 'find').mockReturnValueOnce(
        createMock<Query<CommentDocument[], CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(comments),
        }),
      );
      expect(await commentsService.findAll()).toBe(comments);
    });

    it('should return empty array if no comments found', async () => {
      jest.spyOn(commentModel, 'find').mockReturnValueOnce(
        createMock<Query<CommentDocument[], CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce([]),
        }),
      );
      expect(await commentsService.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find one comment', async () => {
      jest.spyOn(commentModel, 'findById').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce(fakeComment),
        }),
      );
      expect(await commentsService.findOne(fakeComment._id)).toBe(fakeComment);
    });
  });

  describe('findCommentsByPost', () => {
    it('should find comments by post', async () => {
      const comments = [fakeComment];
      jest.spyOn(commentModel, 'find').mockReturnValueOnce(
        createMock<Query<CommentDocument[], CommentDocument>>({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce(comments),
        }),
      );
      expect(await commentsService.findCommentsByPost(fakeComment.post)).toBe(
        comments,
      );
    });

    it('should return empty array if no comments found', async () => {
      jest.spyOn(commentModel, 'find').mockReturnValueOnce(
        createMock<Query<CommentDocument[], CommentDocument>>({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce([]),
        }),
      );
      expect(
        await commentsService.findCommentsByPost(fakeComment.post),
      ).toEqual([]);
    });
  });

  describe('update', () => {
    const updateResult = {
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    };
    it('should update a comment', async () => {
      jest.spyOn(commentModel, 'updateOne').mockReturnValueOnce(
        createMock<Query<UpdateWriteOpResult, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(updateResult),
        }),
      );
      expect(
        await commentsService.update(fakeComment._id, fakeComment.content),
      ).toBe(updateResult);
    });
  });

  describe('remove', () => {
    const deleteResult = {
      acknowledged: true,
      deletedCount: 1,
    };
    it('should remove a comment', async () => {
      jest.spyOn(commentModel, 'deleteOne').mockReturnValueOnce(
        createMock<Query<mongo.DeleteResult, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(deleteResult),
        }),
      );
      expect(await commentsService.remove(fakeComment._id)).toBe(deleteResult);
    });
  });

  describe('checkCommentOwner', () => {
    it('should return true if comment owner is the same as the given owner', async () => {
      jest.spyOn(commentModel, 'findById').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(fakeComment),
        }),
      );
      expect(
        await commentsService.checkCommentOwner(
          fakeComment._id,
          fakeComment.owner,
        ),
      ).toBe(true);
    });

    it('should return false if comment owner is not the same as the given owner', async () => {
      jest.spyOn(commentModel, 'findById').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(fakeComment),
        }),
      );
      expect(
        await commentsService.checkCommentOwner(fakeComment._id, 'fake owner'),
      ).toBe(false);
    });

    it('should throw NotFoundException if comment not found', async () => {
      jest.spyOn(commentModel, 'findById').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(undefined),
        }),
      );
      await expect(
        commentsService.checkCommentOwner(fakeComment._id, fakeComment.owner),
      ).rejects.toThrow('Comment not found');
    });
  });

  describe('isExists', () => {
    it('should return ObjectId if comment exists', async () => {
      const commentId = {
        _id: new mongo.ObjectId(fakeComment._id),
      };
      jest.spyOn(commentModel, 'exists').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(commentId),
        }),
      );
      expect(await commentsService.isExists(fakeComment._id)).toBe(commentId);
    });

    it('should return null if comment not exists', async () => {
      jest.spyOn(commentModel, 'exists').mockReturnValueOnce(
        createMock<Query<CommentDocument, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      );
      expect(await commentsService.isExists(fakeComment._id)).toBe(null);
    });
  });

  describe('count', () => {
    it('should return number of comments', async () => {
      const count = 1;
      jest.spyOn(commentModel, 'countDocuments').mockReturnValueOnce(
        createMock<Query<number, CommentDocument>>({
          exec: jest.fn().mockResolvedValueOnce(count),
        }),
      );
      expect(await commentsService.count(fakeComment.post)).toBe(count);
    });
  });
});
