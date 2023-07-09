import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDTO } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose, { Model } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import ImageKit from 'imagekit';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async getUserPassword(userId: string): Promise<UserDocument> {
    return this.userModel.findById(userId).select('password').exec();
  }

  createUser(user: CreateUserDTO): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  getUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  getUserById(userId: string): Promise<UserDocument> {
    return this.userModel.findById(userId).exec();
  }

  getUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  getUserByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  getUsersByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ role }).exec();
  }

  isExists(userId: string): Promise<any> {
    return this.userModel.exists({ _id: userId }).exec();
  }

  async isEmailTaken(email: string): Promise<boolean> {
    return !!(await this.userModel.exists({ email }).exec());
  }

  deleteUser(userId: string): Promise<mongoose.mongo.DeleteResult> {
    return this.userModel.deleteOne({ _id: userId }).exec();
  }

  updateUser(
    userId: string,
    newUser: Partial<UserDocument>,
  ): Promise<mongoose.UpdateWriteOpResult> {
    // prettier-ignore
    if (newUser.email) this.userModel.updateOne({ _id: userId }, { isVerified: false }).exec();
    return this.userModel.updateOne({ _id: userId }, newUser).exec();
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(parseInt(this.configService.get('salt_rounds')));
    return hash(password, salt);
  }

  async uploadAvatar(
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
        fileName: `avatar-${userId}.${file.mimetype.split('/')[1]}`,
        folder: '/adanest-avatars',
        useUniqueFileName: false,
      });
      return res?.url;
    } catch (err) {
      throw new ForbiddenException(err.message);
    }
  }
}
