import { Challenge, ChallengeDocument } from './challenge.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<Challenge>,
  ) {}

  async isStarted(challenger: string): Promise<boolean> {
    const challenge = await this.challengeModel
      .findOne({
        challenger,
        started: true,
      })
      .exec();
    return challenge && challenge.started;
  }

  async start(challenger: string, endedAt: number): Promise<boolean> {
    const started = await this.isStarted(challenger);

    if (started) {
      return false;
    }

    await this.challengeModel.create({
      endedAt,
      challenger,
      started: true,
    });
    return true;
  }

  async findByChallenger(
    challenger: string,
    started = false,
  ): Promise<ChallengeDocument[]> {
    return this.challengeModel
      .find({
        challenger,
        started,
      })
      .exec();
  }

  async stop(challenger: string): Promise<ChallengeDocument> {
    const started = await this.isStarted(challenger);
    if (started) {
      const challenge = await this.findByChallenger(challenger, true);
      if (challenge) {
        const startedAt = new Date() as unknown as number;
        const endedAt = challenge[0].endedAt as unknown as number;
        const remaining = (endedAt - startedAt) / (1000 * 60 * 60 * 24);
        if (remaining < 0) {
          return this.update(false, false, true, challenge[0]._id.toString());
        } else {
          return this.update(
            false,
            true,
            false,
            challenge[0]._id.toString(),
            Date.now(),
          );
        }
      }
    }
    return null;
  }

  async update(
    started: boolean,
    lost: boolean,
    won: boolean,
    id: string,
    relapseAt?: number,
  ): Promise<ChallengeDocument> {
    const challenge = await this.challengeModel.findById(id).exec();
    if (challenge) {
      await this.challengeModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          { started, lost, won, relapseAt },
          {
            new: true,
          },
        )
        .exec();
    }
    return challenge;
  }
}
