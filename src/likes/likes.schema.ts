import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Like {
  @Prop({
    ref: 'User',
    required: true,
  })
  owner: mongoose.Schema.Types.ObjectId;

  @Prop({
    ref: 'Post',
    required: true,
  })
  post: mongoose.Schema.Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.set('autoIndex', false);
