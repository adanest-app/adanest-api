import mongoose, { UpdateWriteOpResult } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PostDocument } from './schemas/post.schema';
import { PostsController } from './posts.controller';
import { createMock } from '@golevelup/ts-jest';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            getPosts: jest.fn(),
            getPost: jest.fn(),
            searchPosts: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            checkOwner: jest.fn(),
            uploadCover: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            isExists: jest.fn(),
          },
        },
      ],
    }).compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('getPosts', () => {
    it('should return an array of posts', async () => {
      const result = [
        {
          _id: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a1'),
          title: 'test',
          content: 'test',
          type: 'blog',
          owner: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a0'),
        },
      ];
      jest
        .spyOn(postsService, 'getPosts')
        .mockResolvedValueOnce(result as PostDocument[]);

      expect(await postsController.getPosts('blog')).toBe(result);
    });

    it('should return an empty array', async () => {
      const result = [];
      jest
        .spyOn(postsService, 'getPosts')
        .mockResolvedValueOnce(result as PostDocument[]);

      expect(await postsController.getPosts('blog')).toBe(result);
    });
  });

  describe('getPost', () => {
    it('should return a post', async () => {
      const result = {
        _id: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a1'),
        title: 'test',
        content: 'test',
        type: 'blog',
        owner: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a0'),
      };
      jest
        .spyOn(postsService, 'getPost')
        .mockResolvedValueOnce(result as PostDocument);

      expect(
        await postsController.getPost({ id: '60f1b5b6b3e9a1f9c8f3b1a1' }),
      ).toBe(result);
    });

    it('should return null', async () => {
      const result = null;
      jest
        .spyOn(postsService, 'getPost')
        .mockResolvedValueOnce(result as PostDocument);

      expect(
        await postsController.getPost({ id: '60f1b5b6b3e9a1f9c8f3b1a1' }),
      ).toBe(result);
    });
  });

  describe('searchPosts', () => {
    it('should return an array of posts', async () => {
      const result = [
        {
          _id: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a1'),
          title: 'test',
          content: 'test',
          type: 'blog',
          owner: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a0'),
        },
      ];
      jest
        .spyOn(postsService, 'searchPosts')
        .mockResolvedValueOnce(result as PostDocument[]);

      expect(
        await postsController.searchPosts({
          q: 'test',
          limit: 10,
          offset: 0,
          sort: 'desc',
          sortField: 'title',
          owner: '60f1b5b6b3e9a1f9c8f3b1a0',
          type: 'blog',
        }),
      ).toBe(result);
    });

    it('should return an empty array', async () => {
      const result = [];
      jest
        .spyOn(postsService, 'searchPosts')
        .mockResolvedValueOnce(result as PostDocument[]);

      expect(
        await postsController.searchPosts({
          q: 'test',
          limit: 10,
          offset: 0,
          sort: 'desc',
          sortField: 'title',
          owner: '60f1b5b6b3e9a1f9c8f3b1a0',
          type: 'blog',
        }),
      ).toBe(result);
    });
  });

  describe('createPost', () => {
    it('should throw NotFoundException', async () => {
      jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(false);

      await expect(
        postsController.createPost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          {
            title: 'test',
            content: 'test',
            type: 'blog',
            cover: 'https://test.com',
          },
        ),
      ).rejects.toThrow('Owner Not Found');
    });

    it('should return a post', async () => {
      jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
      const result = {
        _id: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a1'),
        title: 'test',
        content: 'test',
        type: 'blog',
        owner: new mongoose.Types.ObjectId('60f1b5b6b3e9a1f9c8f3b1a0'),
      };
      jest
        .spyOn(postsService, 'createPost')
        .mockResolvedValueOnce(result as PostDocument);

      expect(
        await postsController.createPost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          {
            title: 'test',
            content: 'test',
            type: 'blog',
            cover: 'https://test.com',
          },
        ),
      ).toBe(result);
    });
  });

  describe('updatePost', () => {
    it('should return You are not owner of this post', async () => {
      jest.spyOn(postsService, 'checkOwner').mockResolvedValueOnce(false);

      expect(
        await postsController.updatePost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          { id: '60f1b5b6b3e9a1f9c8f3b1a1' },
          {
            title: 'test',
            content: 'test',
            type: 'blog',
            cover: 'https://test.com',
          },
        ),
      ).toBe('You are not owner of this post');
    });

    it('should success updated a post', async () => {
      jest.spyOn(postsService, 'checkOwner').mockResolvedValueOnce(true);
      const result = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      jest
        .spyOn(postsService, 'updatePost')
        .mockResolvedValueOnce(result as UpdateWriteOpResult);

      expect(
        await postsController.updatePost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          { id: '60f1b5b6b3e9a1f9c8f3b1a1' },
          {
            title: 'test',
            content: 'test',
            type: 'blog',
            cover: 'https://test.com',
          },
        ),
      ).toBe(result);
    });
  });

  describe('deletePost', () => {
    it('should return You are not owner of this post', async () => {
      jest.spyOn(postsService, 'checkOwner').mockResolvedValueOnce(false);

      expect(
        await postsController.deletePost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          { id: '60f1b5b6b3e9a1f9c8f3b1a1' },
        ),
      ).toBe('You are not owner of this post');
    });

    it('should success deleted a post', async () => {
      jest.spyOn(postsService, 'checkOwner').mockResolvedValueOnce(true);
      const result = {
        acknowledged: true,
        deletedCount: 1,
      };
      jest
        .spyOn(postsService, 'deletePost')
        .mockResolvedValueOnce(result as mongoose.mongo.DeleteResult);

      expect(
        await postsController.deletePost(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          { id: '60f1b5b6b3e9a1f9c8f3b1a1' },
        ),
      ).toBe(result);
    });
  });

  describe('uploadAvatar', () => {
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(postsService, 'updatePost').mockResolvedValueOnce(null);

      await expect(
        postsController.uploadCover(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          createMock<Express.Multer.File>({
            buffer: Buffer.from('test'),
            originalname: 'test.png',
            mimetype: 'image/png',
          }),
        ),
      ).rejects.toThrow('User Not Found');
    });

    it('should throw BadRequestException if upload failed', async () => {
      jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
      jest.spyOn(postsService, 'updatePost').mockResolvedValueOnce(null);

      await expect(
        postsController.uploadCover(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          createMock<Express.Multer.File>({
            buffer: Buffer.from('test'),
            originalname: 'test.png',
            mimetype: 'image/png',
          }),
        ),
      ).rejects.toThrow('Upload Failed');
    });

    it('should return a url', async () => {
      jest.spyOn(usersService, 'isExists').mockResolvedValueOnce(true);
      jest
        .spyOn(postsService, 'uploadCover')
        .mockResolvedValueOnce('https://test.com');

      expect(
        await postsController.uploadCover(
          { user: { userId: '60f1b5b6b3e9a1f9c8f3b1a0' } },
          createMock<Express.Multer.File>({
            buffer: Buffer.from('test'),
            originalname: 'test.png',
            mimetype: 'image/png',
          }),
        ),
      ).toBe('https://test.com');
    });
  });
});
