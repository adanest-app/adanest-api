import { CommentsController } from './comments.controller';
import { CommentDocument } from './schema/comment.schema';
import { PostsService } from '../posts/posts.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWriteOpResult, mongo } from 'mongoose';
import { CommentsService } from './comments.service';
import { createMock } from '@golevelup/ts-jest';

const fakeComment = {
  _id: '60f1b2b5b5f9d7a9c4c8c7a9',
  content: 'test content',
  owner: '60f1b2b5b5f9d7a9c4c8c7a8',
  post: 'test post',
};

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  let postService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn().mockResolvedValueOnce(fakeComment),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            checkCommentOwner: jest.fn(),
            findCommentsByPost: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: {
            isExists: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
    postService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(commentsController).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if post not found', async () => {
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      jest.spyOn(postService, 'isExists').mockResolvedValueOnce(null);

      await expect(
        commentsController.create(req, fakeComment),
      ).rejects.toThrowError('Post Not Found');
    });

    it('should create a comment', async () => {
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      const result = {
        ...fakeComment,
        owner: req.user.userId,
      };

      jest
        .spyOn(postService, 'isExists')
        .mockResolvedValueOnce({ _id: fakeComment.post });

      jest
        .spyOn(commentsService, 'create')
        .mockResolvedValueOnce(createMock<CommentDocument>(result));

      expect(await commentsController.create(req, fakeComment)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should find all comments', async () => {
      const comments = [fakeComment];

      jest
        .spyOn(commentsService, 'findAll')
        .mockResolvedValueOnce(comments as any);

      expect(await commentsController.findAll()).toBe(comments);
    });

    it('should return empty array if no comments found', async () => {
      jest.spyOn(commentsService, 'findAll').mockResolvedValueOnce([]);

      expect(await commentsController.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find one comment', async () => {
      jest
        .spyOn(commentsService, 'findOne')
        .mockResolvedValueOnce(fakeComment as any);

      expect(await commentsController.findOne(fakeComment._id)).toBe(
        fakeComment,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if comment not found', async () => {
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      jest
        .spyOn(commentsService, 'checkCommentOwner')
        .mockResolvedValueOnce(false);

      await expect(
        commentsController.update(req, fakeComment._id, fakeComment),
      ).rejects.toThrowError('Comment not found');
    });

    it('should update a comment', async () => {
      const updateResult = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      jest
        .spyOn(commentsService, 'checkCommentOwner')
        .mockResolvedValueOnce(true);

      jest
        .spyOn(commentsService, 'update')
        .mockResolvedValueOnce(updateResult as UpdateWriteOpResult);

      expect(
        await commentsController.update(req, fakeComment._id, fakeComment),
      ).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    const deleteResult = {
      acknowledged: true,
      deletedCount: 1,
    };
    it('should throw NotFoundException if comment not found', async () => {
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      jest
        .spyOn(commentsService, 'checkCommentOwner')
        .mockResolvedValueOnce(false);

      await expect(
        commentsController.remove(req, fakeComment._id),
      ).rejects.toThrowError('Comment not found');
    });

    it('should remove a comment', async () => {
      const req = {
        user: {
          userId: '60f1b2b5b5f9d7a9c4c8c7a8',
        },
      };

      jest
        .spyOn(commentsService, 'checkCommentOwner')
        .mockResolvedValueOnce(true);

      jest
        .spyOn(commentsService, 'remove')
        .mockResolvedValueOnce(deleteResult as mongo.DeleteResult);

      expect(await commentsController.remove(req, fakeComment._id)).toEqual(
        deleteResult,
      );
    });
  });

  describe('findCommentsByPost', () => {
    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(postService, 'isExists').mockResolvedValueOnce(null);

      await expect(
        commentsController.findCommentsByPost(fakeComment.post),
      ).rejects.toThrowError('Post Not Found');
    });

    it('should find all comments by post', async () => {
      const comments = [fakeComment];

      jest
        .spyOn(postService, 'isExists')
        .mockResolvedValueOnce({ _id: fakeComment.post });

      jest
        .spyOn(commentsService, 'findCommentsByPost')
        .mockResolvedValueOnce(comments as any);

      expect(
        await commentsController.findCommentsByPost(fakeComment.post),
      ).toBe(comments);
    });

    it('should return empty array if no comments found', async () => {
      jest
        .spyOn(postService, 'isExists')
        .mockResolvedValueOnce({ _id: fakeComment.post });

      jest
        .spyOn(commentsService, 'findCommentsByPost')
        .mockResolvedValueOnce([]);

      expect(
        await commentsController.findCommentsByPost(fakeComment.post),
      ).toEqual([]);
    });
  });
});
