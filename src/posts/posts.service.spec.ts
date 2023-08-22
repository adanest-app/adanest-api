import mongoose, { Model, Query, UpdateWriteOpResult } from 'mongoose';
import { UploadOptions } from 'imagekit/dist/libs/interfaces';
import { Post, PostDocument } from './schemas/post.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { PostsService } from './posts.service';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

jest.mock('imagekit');

describe('PostService', () => {
  let postsService: PostsService;
  let postModel: Model<Post>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn().mockResolvedValueOnce({
              _id: '60c5b8b0f0d8f7b5a4b3b0b1',
              title: 'Test Post',
              content: 'Test Content',
              type: 'blog',
              owner: '60c5b8b0f0d8f7b5a4b3b0b1',
            }),
            exists: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementationOnce(
              (key: string) =>
                ({
                  salt_rounds: 10,
                }[key]),
            ),
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
  });

  it('should be defined', () => {
    expect(postsService).toBeDefined();
  });

  it('should return an array of posts', async () => {
    const result = [
      {
        _id: '60c5b8b0f0d8f7b5a4b3b0b1',
        title: 'Test Post',
        content: 'Test Content',
        type: 'blog',
        owner: {
          _id: '60c5b8b0f0d8f7b5a4b3b0b1',
          name: 'Test User',
          email: 'email@email.com',
          password: 'password',
          avatar: 'avatar',
          role: 'admin',
          createdAt: '2021-06-13T15:00:00.000Z',
          updatedAt: '2021-06-13T15:00:00.000Z',
          __v: 0,
        },
        createdAt: '2021-06-13T15:00:00.000Z',
        updatedAt: '2021-06-13T15:00:00.000Z',
        __v: 0,
      },
    ];
    jest.spyOn(postModel, 'find').mockReturnValue(
      createMock<Query<PostDocument[], unknown>>({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
      }),
    );
    expect(await postsService.getPosts('blog')).toBe(result);
  });

  it('should return a post', async () => {
    const result = {
      _id: '60c5b8b0f0d8f7b5a4b3b0b1',
      title: 'Test Post',
      content: 'Test Content',
      type: 'blog',
      owner: {
        _id: '60c5b8b0f0d8f7b5a4b3b0b1',
        name: 'Test User',
        email: 'email',
        password: 'password',
        avatar: 'avatar',
        role: 'admin',
        createdAt: '2021-06-13T15:00:00.000Z',
        updatedAt: '2021-06-13T15:00:00.000Z',
        __v: 0,
      },
      createdAt: '2021-06-13T15:00:00.000Z',
      updatedAt: '2021-06-13T15:00:00.000Z',
      __v: 0,
    };
    jest.spyOn(postModel, 'updateOne').mockReturnValue(
      createMock<Query<UpdateWriteOpResult, unknown>>({
        exec: jest.fn().mockResolvedValue(
          createMock<UpdateWriteOpResult>({
            acknowledged: true,
            modifiedCount: 1,
            upsertedCount: 0,
            upsertedId: null,
            matchedCount: 1,
          }),
        ),
      }),
    );
    jest.spyOn(postModel, 'findById').mockReturnValue(
      createMock<Query<PostDocument, unknown>>({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
      }),
    );
    expect(await postsService.getPost('60c5b8b0f0d8f7b5a4b3b0b1')).toBe(result);
  });

  it('should return an array of posts from search', async () => {
    const result = [
      {
        _id: '60c5b8b0f0d8f7b5a4b3b0b1',
        title: 'Test Post',
        content: 'Test Content',
        type: 'blog',
        owner: {
          _id: '60c5b8b0f0d8f7b5a4b3b0b1',
          name: 'Test User',
          email: 'email@email.com',
          password: 'password',
          avatar: 'avatar',
          role: 'admin',
          createdAt: '2021-06-13T15:00:00.000Z',
          updatedAt: '2021-06-13T15:00:00.000Z',
          __v: 0,
        },
        createdAt: '2021-06-13T15:00:00.000Z',
        updatedAt: '2021-06-13T15:00:00.000Z',
        __v: 0,
      },
    ];

    jest.spyOn(postModel, 'find').mockReturnValue(
      createMock<Query<Post[], unknown>>({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
      }),
    );

    expect(
      await postsService.searchPosts({
        q: 'Test',
        owner: '60c5b8b0f0d8f7b5a4b3b0b1',
      }),
    ).toBe(result);
  });

  it('should create a post', async () => {
    const result = {
      _id: '60c5b8b0f0d8f7b5a4b3b0b1',
      title: 'Test Post',
      content: 'Test Content',
      type: 'blog',
      owner: '60c5b8b0f0d8f7b5a4b3b0b1',
    };

    expect(
      await postsService.createPost({
        title: 'Test Post',
        content: 'Test Content',
        type: 'blog',
        cover: 'cover',
      }),
    ).toEqual(result);
  });

  it('should update a post', async () => {
    const result = {
      acknowledged: true,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
      matchedCount: 1,
    };

    jest.spyOn(postModel, 'updateOne').mockReturnValueOnce(
      createMock<Query<UpdateWriteOpResult, unknown>>({
        exec: jest.fn().mockResolvedValueOnce(result as UpdateWriteOpResult),
      }),
    );

    expect(
      await postsService.updatePost('60c5b8b0f0d8f7b5a4b3b0b1', {
        title: 'Test Post',
        content: 'Test Content',
        type: 'blog',
        cover: 'cover',
      }),
    ).toBe(result);
  });

  it('should delete a post', async () => {
    const result = {
      deletedCount: 1,
    } as mongoose.mongo.DeleteResult;

    jest.spyOn(postModel, 'deleteOne').mockReturnValueOnce(
      createMock<Query<mongoose.mongo.DeleteResult, PostDocument>>({
        exec: jest.fn().mockResolvedValueOnce(result),
      }),
    );

    expect(await postsService.deletePost('60c5b8b0f0d8f7b5a4b3b0b1')).toBe(
      result,
    );
  });

  it('should check owner of a post', async () => {
    const result = true;

    jest.spyOn(postModel, 'findById').mockReturnValueOnce(
      createMock<Query<PostDocument, unknown>>({
        exec: jest.fn().mockResolvedValueOnce({
          _id: '60c5b8b0f0d8f7b5a4b3b0b1',
          title: 'Test Post',
          content: 'Test Content',
          type: 'blog',
          owner: '60c5b8b0f0d8f7b5a4b3b0b1',
        }),
      }),
    );

    expect(
      await postsService.checkOwner(
        '60c5b8b0f0d8f7b5a4b3b0b1',
        '60c5b8b0f0d8f7b5a4b3b0b1',
      ),
    ).toBe(result);
  });

  it('should checkOwner throw an error if post not found', async () => {
    jest.spyOn(postModel, 'findById').mockReturnValueOnce(
      createMock<Query<PostDocument, unknown>>({
        exec: jest.fn().mockResolvedValueOnce(null),
      }),
    );

    await expect(
      postsService.checkOwner(
        '60c5b8b0f0d8f7b5a4b3b0b1',
        '60c5b8b0f0d8f7b5a4b3b0b1',
      ),
    ).rejects.toThrowError('Post not found');
  });

  it('should check owner return false if owner not same', async () => {
    const result = false;

    jest.spyOn(postModel, 'findById').mockReturnValueOnce(
      createMock<Query<PostDocument, unknown>>({
        exec: jest.fn().mockResolvedValueOnce({
          _id: '60c5b8b0f0d8f7b5a4b3b0b1',
          title: 'Test Post',
          content: 'Test Content',
          type: 'blog',
          owner: '60c5b8b0f0d8f7b5a4b3b0b1',
        }),
      }),
    );

    expect(
      await postsService.checkOwner(
        '60c5b8b0f0d8f7b5a4b3b0b1',
        '60c5b8b0f0d8f7b5a4b3b0b2',
      ),
    ).toBe(result);
  });

  it('should check if post exists', async () => {
    const result = {
      _id: '60c5b8b0f0d8f7b5a4b3b0b1',
    };

    jest.spyOn(postModel, 'exists').mockReturnValueOnce(
      createMock<Query<{ _id: mongoose.Types.ObjectId }, PostDocument>>({
        exec: jest.fn().mockResolvedValueOnce(result),
      }),
    );

    expect(await postsService.isExists('60c5b8b0f0d8f7b5a4b3b0b1')).toBe(
      result,
    );
  });

  it('should upload a cover and return url', async () => {
    jest
      .spyOn(ImageKit.prototype, 'upload')
      .mockImplementation(async (options: UploadOptions) => {
        expect(options).toEqual({
          file: expect.any(Buffer),
          fileName: expect.any(String),
          folder: expect.any(String),
        });
        return {
          url: 'https://test.com',
        };
      });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    expect(
      await postsService.uploadCover('60c5b8b0f0d8f7b5a4b3b0b1', file),
    ).toEqual('https://test.com');
  });

  it('should upload a cover and return null', async () => {
    jest
      .spyOn(ImageKit.prototype, 'upload')
      .mockImplementation(async (options: UploadOptions) => {
        expect(options).toEqual({
          file: expect.any(Buffer),
          fileName: expect.any(String),
          folder: expect.any(String),
        });
        return undefined;
      });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    expect(
      await postsService.uploadCover('60c5b8b0f0d8f7b5a4b3b0b1', file),
    ).toBeUndefined();
  });

  it('should throw ForbiddenException if upload failed', async () => {
    jest.spyOn(ImageKit.prototype, 'upload').mockImplementation(async () => {
      throw new Error('Upload failed');
    });

    const file = createMock<Express.Multer.File>({
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    });

    await expect(
      postsService.uploadCover('60c5b8b0f0d8f7b5a4b3b0b1', file),
    ).rejects.toThrowError('Upload failed');
  });
});
