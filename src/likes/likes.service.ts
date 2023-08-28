import { Like, LikeDocument } from './likes.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class LikesService {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async create(owner: string, post: string): Promise<LikeDocument> {
    return this.likeModel.create({ owner, post });
  }

  async delete(owner: string, post: string): Promise<LikeDocument> {
    return this.likeModel.findOneAndDelete({ owner, post }).exec();
  }

  async count(post: string): Promise<number> {
    return this.likeModel.countDocuments({ post }).exec();
  }

  async isLiked(owner: string, post: string): Promise<any> {
    return this.likeModel.exists({ owner, post }).exec();
  }
}
