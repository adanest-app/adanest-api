import mongoose, { Model, UpdateWriteOpResult } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Reply, ReplyDocument } from './schemas/reply.schema';
import { CreateReplyDto } from './dto/create-reply.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RepliesService {
  constructor(@InjectModel(Reply.name) private replyModel: Model<Reply>) {}

  async create(reply: CreateReplyDto): Promise<ReplyDocument> {
    return this.replyModel.create(reply);
  }

  async findAll(commentId: string): Promise<ReplyDocument[]> {
    return this.replyModel
      .find({ comment: commentId })
      .populate('owner', '_id username email firstName lastName')
      .exec();
  }

  async update(
    replyId: string,
    reply: Partial<ReplyDocument>,
  ): Promise<UpdateWriteOpResult> {
    return this.replyModel.updateOne({ _id: replyId }, reply).exec();
  }

  async remove(replyId: string): Promise<mongoose.mongo.DeleteResult> {
    return this.replyModel.deleteOne({ _id: replyId }).exec();
  }

  async checkReplyOwner(replyId: string, owner: string): Promise<boolean> {
    const reply = await this.replyModel.findById(replyId).exec();
    if (!reply) throw new NotFoundException('Reply not found');
    return reply.owner.toString() === owner.toString();
  }

  async findRepliesByComment(commentId: string): Promise<ReplyDocument[]> {
    return this.replyModel
      .find({ comment: commentId })
      .populate('owner')
      .sort({ createdAt: 'desc' })
      .exec();
  }
}
