import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model, UpdateWriteOpResult } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private configService: ConfigService,
  ) {}

  async getPosts(type: string): Promise<PostDocument[]> {
    return this.postModel.find({ type }).populate('owner').exec();
  }

  async getPost(postId: string): Promise<PostDocument> {
    await this.postModel
      .updateOne(
        { _id: new mongoose.mongo.ObjectId(postId) },
        { $inc: { visitor: 1 } },
      )
      .exec();
    return this.postModel.findById(postId).populate('owner').exec();
  }

  async searchPosts({
    q,
    limit = 0,
    offset = 0,
    sort,
    sortField,
    owner,
    type = 'blog',
  }): Promise<PostDocument[]> {
    return this.postModel
      .find({ type })
      .find(q ? { $text: { $search: q } } : {})
      .find(owner ? { owner } : {})
      .populate('owner')
      .skip(offset)
      .limit(limit)
      .sort({ [sortField]: sort })
      .exec();
  }

  async createPost(post: CreatePostDto): Promise<PostDocument> {
    return this.postModel.create(post);
  }

  async updatePost(
    postId: string,
    post: Partial<PostDocument>,
  ): Promise<UpdateWriteOpResult> {
    return this.postModel
      .updateOne({ _id: new mongoose.mongo.ObjectId(postId) }, post)
      .exec();
  }

  async deletePost(postId: string): Promise<mongoose.mongo.DeleteResult> {
    return this.postModel
      .deleteOne({ _id: new mongoose.mongo.ObjectId(postId) })
      .exec();
  }

  async checkOwner(postId: string, owner: string): Promise<boolean> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post.owner.toString() === owner.toString();
  }

  async isExists(postId: string): Promise<any> {
    return this.postModel
      .exists({ _id: new mongoose.mongo.ObjectId(postId) })
      .exec();
  }

  async uploadCover(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string | null> {
    const imagekit = new ImageKit({
      publicKey: this.configService.get('imagekit.publicKey'),
      privateKey: this.configService.get('imagekit.privateKey'),
      urlEndpoint: this.configService.get('imagekit.urlEndpoint'),
    });
    try {
      const res = await imagekit.upload({
        file: file.buffer,
        fileName: `cover-${userId}.${file.mimetype.split('/')[1]}`,
        folder: '/adanest-covers',
      });
      return res?.url;
    } catch (err) {
      throw new ForbiddenException(err.message);
    }
  }
}
