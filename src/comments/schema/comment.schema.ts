import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  owner: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Post' })
  post: mongoose.Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.set('autoIndex', false);
