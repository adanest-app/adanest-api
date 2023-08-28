import { Test, TestingModule } from '@nestjs/testing';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { faker } from '@faker-js/faker';

const fakeLikeData = {
  owner: faker.database.mongodbObjectId(),
  post: faker.database.mongodbObjectId(),
};

describe('LikesController', () => {
  let controller: LikesController;
  let likesService: LikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [
        {
          provide: LikesService,
          useValue: {
            isLiked: jest.fn().mockResolvedValue({ _id: fakeLikeData.owner }),
            delete: jest.fn(),
            create: jest.fn(),
            count: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    controller = module.get<LikesController>(LikesController);
    likesService = module.get<LikesService>(LikesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('like', () => {
    it('should return true if the user has liked the post', async () => {
      const result = await controller.like(
        { user: { userId: fakeLikeData.owner } },
        { postId: fakeLikeData.post },
      );
      expect(result).toBe(true);
    });

    it('should return false if the user has not liked the post', async () => {
      jest.spyOn(likesService, 'isLiked').mockResolvedValueOnce(null);
      const result = await controller.like(
        { user: { userId: fakeLikeData.owner } },
        { postId: fakeLikeData.post },
      );
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the number of likes', async () => {
      const result = await controller.count({ postId: fakeLikeData.post });
      expect(result).toBe(1);
    });
  });

  describe('isLiked', () => {
    it('should return true if the user has liked the post', async () => {
      const result = await controller.isLiked(
        { user: { userId: fakeLikeData.owner } },
        { postId: fakeLikeData.post },
      );
      expect(result).toBe(true);
    });

    it('should return false if the user has not liked the post', async () => {
      jest.spyOn(likesService, 'isLiked').mockResolvedValueOnce(null);
      const result = await controller.isLiked(
        { user: { userId: fakeLikeData.owner } },
        { postId: fakeLikeData.post },
      );
      expect(result).toBe(false);
    });
  });
});
