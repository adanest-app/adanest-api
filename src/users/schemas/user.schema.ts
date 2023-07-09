import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../enum/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ unique: true, index: true, required: true })
  email: string;

  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ default: '' })
  lastName?: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: [Role.ADMIN, Role.USER], default: Role.USER })
  role?: string;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: 'https://picsum.photos/200' })
  avatar?: string;

  @Prop({ default: 'Hello World!' })
  bio?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('autoIndex', false);
