import { Challenge, ChallengeDocument } from './challenge.schema';
import { ChallengeService } from './challenge.service';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model, Query } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';

const challenge = {
  _id: '60f1b2b5b5f9d7a9c4c8c7a9',
  challenger: 'test',
  started: true,
};

describe('ChallengeService', () => {
  let service: ChallengeService;
  let challengeModel: Model<ChallengeDocument>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeService,
        {
          provide: getModelToken(Challenge.name),
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue(createMock<ChallengeDocument>(challenge)),
            find: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChallengeService>(ChallengeService);
    challengeModel = module.get<Model<ChallengeDocument>>(
      getModelToken(Challenge.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isStarted', () => {
    it('should return true if challenge started', async () => {
      const challenger = 'test';
      const challenge = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a9',
        challenger,
        started: true,
      };
      jest.spyOn(challengeModel, 'findOne').mockReturnValue(
        createMock<Query<ChallengeDocument, unknown>>({
          exec: jest
            .fn()
            .mockResolvedValueOnce(createMock<ChallengeDocument>(challenge)),
        }),
      );
      const result = await service.isStarted(challenger);
      expect(result).toBe(true);
    });

    it('should return false if challenge not started', async () => {
      const challenger = 'test';
      const challenge = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a9',
        challenger,
        started: false,
      };
      jest.spyOn(challengeModel, 'findOne').mockReturnValue(
        createMock<Query<ChallengeDocument, unknown>>({
          exec: jest
            .fn()
            .mockResolvedValueOnce(createMock<ChallengeDocument>(challenge)),
        }),
      );
      const result = await service.isStarted(challenger);
      expect(result).toBe(false);
    });
  });

  describe('start', () => {
    it('should return true if challenge started', async () => {
      const challenger = 'test';
      const challenge = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a9',
        challenger,
        started: true,
      };
      jest.spyOn(service, 'isStarted').mockResolvedValueOnce(false);

      const result = await service.start(challenger, 1);
      expect(result).toBe(true);
    });

    it('should return false if challenge not started', async () => {
      const challenger = 'test';
      const challenge = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a9',
        challenger,
        started: false,
      };
      jest.spyOn(service, 'isStarted').mockResolvedValueOnce(true);
      const result = await service.start(challenger, 1);
      expect(result).toBe(false);
    });
  });

  describe('findByChallenger', () => {
    it('should return challenge', async () => {
      const challenger = 'test';
      const challenge = {
        _id: '60f1b2b5b5f9d7a9c4c8c7a9',
        challenger,
        started: false,
      };
      jest.spyOn(challengeModel, 'find').mockReturnValue(
        createMock<Query<ChallengeDocument[], ChallengeDocument, unknown>>({
          exec: jest.fn().mockResolvedValueOnce([challenge]),
        }),
      );
      const result = await service.findByChallenger(challenger);
      expect(result).toEqual([challenge]);
    });
  });

  describe('stop', () => {
    it('should return challenge', async () => {
      const challenger = 'test';
      const challenge = {
        _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
        challenger,
        started: false,
        startedAt: Date.now(),
        endedAt: Date.now() + 1000000,
      };
      jest.spyOn(service, 'isStarted').mockResolvedValue(true);
      jest
        .spyOn(service, 'findByChallenger')
        .mockResolvedValueOnce([createMock<ChallengeDocument>(challenge)]);
      jest.spyOn(service, 'update').mockResolvedValueOnce(
        createMock<any>({
          _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
        }),
      );
      await service.stop(challenger);
      expect(service.findByChallenger).toBeCalledWith(challenger, true);
      expect(service.update).toBeCalled;
    });

    it('should return challenge', async () => {
      const challenger = 'test';
      const challenge = {
        _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
        challenger,
        started: false,
        startedAt: Date.now(),
        endedAt: Date.now() - 20000,
      };
      jest.spyOn(service, 'isStarted').mockResolvedValue(true);
      jest
        .spyOn(service, 'findByChallenger')
        .mockResolvedValueOnce([createMock<ChallengeDocument>(challenge)]);
      jest.spyOn(service, 'update').mockResolvedValueOnce(
        createMock<any>({
          _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
        }),
      );
      await service.stop(challenger);
      expect(service.findByChallenger).toBeCalledWith(challenger, true);
      expect(service.update).toBeCalledWith(
        false,
        false,
        true,
        challenge._id.toString(),
      );
    });

    it('should return null', async () => {
      const challenger = 'test';

      jest.spyOn(service, 'isStarted').mockResolvedValue(false);

      expect(await service.stop(challenger)).toBe(null);
    });
  });

  describe('update', () => {
    it('should return challenge', async () => {
      const challenge = {
        _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
        challenger: 'test',
        started: false,
        startedAt: Date.now(),
        endedAt: Date.now(),
      };
      jest.spyOn(challengeModel, 'findById').mockReturnValueOnce(
        createMock<Query<any, ChallengeDocument, unknown>>({
          exec: jest
            .fn()
            .mockResolvedValue(createMock<ChallengeDocument>(challenge)),
        }),
      );
      jest.spyOn(challengeModel, 'findByIdAndUpdate').mockReturnValue(
        createMock<Query<any, ChallengeDocument, unknown>>({
          exec: jest.fn().mockResolvedValue(createMock<any>(challenge as any)),
        }),
      );
      await service.update(
        false,
        true,
        false,
        challenge._id.toString(),
        Date.now(),
      );
      expect(challengeModel.findByIdAndUpdate).toBeCalled();
    });
  });
});
