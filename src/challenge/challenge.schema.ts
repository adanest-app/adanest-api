import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ChallengeDocument = HydratedDocument<Challenge>;

@Schema({ versionKey: false })
export class Challenge {
  @Prop({ required: true, default: false })
  lost: boolean;

  @Prop({ required: true, default: false })
  won: boolean;

  @Prop({ default: false })
  started: boolean;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop({ default: Date.now })
  endedAt: Date;

  @Prop({ default: 0 })
  relapseAt: Date;

  @Prop({ ref: 'User' })
  challenger: mongoose.Types.ObjectId;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

ChallengeSchema.set('autoIndex', false);
