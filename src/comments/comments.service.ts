import { Comment, CommentDocument } from './schema/comment.schema';
import mongoose, { Model, UpdateWriteOpResult } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(comment: CreateCommentDto): Promise<CommentDocument> {
    return this.commentModel.create(comment);
  }

  async findAll(): Promise<CommentDocument[]> {
    return this.commentModel.find().exec();
  }

  async findOne(commentId: string): Promise<CommentDocument> {
    return this.commentModel
      .findById(commentId)
      .populate('owner')
      .populate('post')
      .exec();
  }

  async findCommentsByPost(postId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ post: postId })
      .populate('owner')
      .sort({ createdAt: 'desc' })
      .exec();
  }

  async update(
    commentId: string,
    content: string,
  ): Promise<UpdateWriteOpResult> {
    return this.commentModel
      .updateOne({ _id: new mongoose.mongo.ObjectId(commentId) }, { content })
      .exec();
  }

  async remove(commentId: string) {
    return this.commentModel
      .deleteOne({ _id: new mongoose.mongo.ObjectId(commentId) })
      .exec();
  }

  async checkCommentOwner(commentId: string, owner: string): Promise<boolean> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return comment.owner.toString() === owner.toString();
  }

  async isExists(commentId: string): Promise<any> {
    return this.commentModel
      .exists({ _id: new mongoose.mongo.ObjectId(commentId) })
      .exec();
  }
}
