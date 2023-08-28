import { Test, TestingModule } from '@nestjs/testing';
import { Like, LikeDocument } from './likes.schema';
import mongoose, { Model, Query } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { LikesService } from './likes.service';
import { faker } from '@faker-js/faker';

const fakeLikeData = {
  owner: faker.database.mongodbObjectId(),
  post: faker.database.mongodbObjectId(),
};

type ObjectId = {
  _id: mongoose.Types.ObjectId;
};

describe('LikesService', () => {
  let service: LikesService;
  let likeModel: Model<Like>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: getModelToken(Like.name),
          useValue: {
            create: jest.fn().mockResolvedValue(fakeLikeData),
            findOneAndDelete: jest.fn().mockResolvedValue(fakeLikeData),
            countDocuments: jest.fn().mockResolvedValue(1),
            exists: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    likeModel = module.get<Model<Like>>(getModelToken(Like.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call likeModel.create', async () => {
      await service.create(fakeLikeData.owner, fakeLikeData.post);
      expect(likeModel.create).toHaveBeenCalledWith(fakeLikeData);
    });

    it('should return the result of likeModel.create', async () => {
      const result = await service.create(
        fakeLikeData.owner,
        fakeLikeData.post,
      );
      expect(result).toEqual(fakeLikeData);
    });
  });

  describe('delete', () => {
    it('should call likeModel.findOneAndDelete', async () => {
      jest.spyOn(likeModel, 'findOneAndDelete').mockReturnValue(
        createMock<Query<LikeDocument, LikeDocument>>({
          exec: jest.fn(),
        }),
      );
      await service.delete(fakeLikeData.owner, fakeLikeData.post);
      expect(likeModel.findOneAndDelete).toHaveBeenCalledWith({
        owner: fakeLikeData.owner,
        post: fakeLikeData.post,
      });
    });

    it('should return the result of likeModel.findOneAndDelete', async () => {
      jest.spyOn(likeModel, 'findOneAndDelete').mockReturnValue(
        createMock<Query<LikeDocument, LikeDocument>>({
          exec: jest.fn().mockResolvedValue(fakeLikeData),
        }),
      );
      const result = await service.delete(
        fakeLikeData.owner,
        fakeLikeData.post,
      );
      expect(result).toEqual(fakeLikeData);
    });
  });

  describe('count', () => {
    it('should call likeModel.countDocuments', async () => {
      jest.spyOn(likeModel, 'countDocuments').mockReturnValue(
        createMock<Query<number, LikeDocument>>({
          exec: jest.fn(),
        }),
      );
      await service.count(fakeLikeData.post);
      expect(likeModel.countDocuments).toHaveBeenCalledWith({
        post: fakeLikeData.post,
      });
    });

    it('should return the result of likeModel.countDocuments', async () => {
      jest.spyOn(likeModel, 'countDocuments').mockReturnValue(
        createMock<Query<number, LikeDocument>>({
          exec: jest.fn().mockResolvedValue(1),
        }),
      );
      const result = await service.count(fakeLikeData.post);
      expect(result).toEqual(1);
    });
  });

  describe('isLiked', () => {
    it('should call likeModel.exists', async () => {
      jest.spyOn(likeModel, 'exists').mockReturnValue(
        createMock<Query<ObjectId, LikeDocument>>({
          exec: jest.fn(),
        }),
      );
      await service.isLiked(fakeLikeData.owner, fakeLikeData.post);
      expect(likeModel.exists).toHaveBeenCalledWith({
        owner: fakeLikeData.owner,
        post: fakeLikeData.post,
      });
    });

    it('should return ObjectId in the result of likeModel.exists', async () => {
      jest.spyOn(likeModel, 'exists').mockReturnValue(
        createMock<Query<ObjectId, LikeDocument>>({
          exec: jest.fn().mockResolvedValue({ _id: fakeLikeData.owner }),
        }),
      );
      const result = await service.isLiked(
        fakeLikeData.owner,
        fakeLikeData.post,
      );
      expect(result).toEqual({ _id: fakeLikeData.owner });
    });

    it('should return null in the result of likeModel.exists', async () => {
      jest.spyOn(likeModel, 'exists').mockReturnValue(
        createMock<Query<ObjectId, LikeDocument>>({
          exec: jest.fn().mockResolvedValue(null),
        }),
      );
      const result = await service.isLiked(
        fakeLikeData.owner,
        fakeLikeData.post,
      );
      expect(result).toEqual(null);
    });
  });
});
