import { Exclude, Expose, Transform } from 'class-transformer';
import mongoose from 'mongoose';

export class UserEntity {
  @Exclude()
  _id: mongoose.Types.ObjectId;

  firstName: string;
  lastName: string;
  email: string;
  username: string;

  @Expose()
  get fullname(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  @Transform(({ value }) => value.toHexString(), { toPlainOnly: true })
  @Expose()
  get id(): mongoose.Types.ObjectId {
    return this._id;
  }

  @Exclude()
  password: string;

  role: string;
  isVerified: boolean;
  avatar: string;
  bio: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
