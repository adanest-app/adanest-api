import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Post {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  owner: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  cover: string;

  @Prop({
    enum: ['forum', 'blog'],
    default: 'blog',
  })
  type: string;

  @Prop({
    default: 0,
  })
  visitor: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', content: 'text' });
