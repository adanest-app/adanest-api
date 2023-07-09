import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReplyDocument = HydratedDocument<Reply>;

@Schema({ timestamps: true, versionKey: false })
export class Reply {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comment: mongoose.Types.ObjectId;

  @Prop()
  content: string;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

ReplySchema.set('autoIndex', false);
