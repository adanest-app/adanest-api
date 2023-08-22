import mongoose, { Model, UpdateWriteOpResult } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async create(chat: any): Promise<Chat> {
    return this.chatModel.create(chat);
  }

  async getMessages(
    sender: string,
    receiver: string,
    isAdmin = false,
  ): Promise<Chat[]> {
    let query = {};
    if (isAdmin) {
      query = {
        $or: [
          {
            sender,
          },
          { receiver },
        ],
      };
    } else if (sender && receiver) {
      query = {
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      };
    }
    return this.chatModel
      .find(query)
      .populate('sender')
      .populate('receiver')
      .sort({ createdAt: 1 })
      .exec();
  }

  async updateState(
    chatId: string,
    state: number,
  ): Promise<UpdateWriteOpResult> {
    return this.chatModel
      .updateOne({ _id: new mongoose.mongo.ObjectId(chatId) }, { state })
      .exec();
  }
}
