import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ChatState } from './enum/chat-state.enum';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Chat {
  @Prop({ required: true })
  message: string;

  @Prop({ ref: 'User', type: mongoose.Types.ObjectId })
  sender: mongoose.Types.ObjectId;

  @Prop({ ref: 'User', type: mongoose.Types.ObjectId })
  receiver: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: [ChatState.SENT, ChatState.DELIVERED, ChatState.READ],
  })
  state: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.set('autoIndex', false);
