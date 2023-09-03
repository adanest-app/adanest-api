import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';

const fakeChallenge = {
  _id: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
  challenger: new mongoose.Types.ObjectId('60f1b2b5b5f9d7a9c4c8c7a9'),
  started: true,
};

describe('ChallengeController', () => {
  let controller: ChallengeController;
  let service: ChallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeController],
      providers: [
        {
          provide: ChallengeService,
          useValue: {
            start: jest.fn(),
            stop: jest.fn().mockResolvedValue(fakeChallenge),
            isStarted: jest.fn(),
            findByChallenger: jest.fn().mockResolvedValue([fakeChallenge]),
          },
        },
      ],
    }).compile();

    controller = module.get<ChallengeController>(ChallengeController);
    service = module.get<ChallengeService>(ChallengeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('start', () => {
    it('should return true if challenge started', async () => {
      const userId = 'test';
      const endedAt = 1626451200000;
      jest.spyOn(service, 'start').mockResolvedValueOnce(true);
      expect(await controller.start({ user: { userId } }, endedAt)).toBe(true);
    });
  });

  describe('stop', () => {
    it('should return true if challenge stopped', async () => {
      const userId = 'test';

      expect(await controller.stop({ user: { userId } })).toEqual(
        fakeChallenge,
      );
    });
  });

  describe('isStarted', () => {
    it('should return true if challenge started', async () => {
      const userId = 'test';
      jest.spyOn(service, 'isStarted').mockResolvedValueOnce(true);
      expect(await controller.isStarted({ user: { userId } })).toBe(true);
    });
  });

  describe('getChallenge', () => {
    it('should return challenge', async () => {
      const userId = 'test';
      const started = true;
      expect(
        await controller.getChallenge({ user: { userId } }, started),
      ).toEqual([fakeChallenge]);
    });
  });
});
