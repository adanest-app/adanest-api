import { instanceToPlain } from 'class-transformer';
import { UserEntity } from './user.serialization';
import mongoose, { mongo } from 'mongoose';

describe('User Serialization', () => {
  it('should serialize user', async () => {
    const user = {
      _id: mongo.ObjectId.createFromHexString(
        '60f1b2b5b5f9d7a9c4c8c7a9',
      ) as any as mongoose.Types.ObjectId,
      username: 'username',
      email: 'email',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
      role: 'user',
      isVerified: true,
      avatar: 'avatar',
      bio: 'bio',
    };
    const serializedUser = instanceToPlain(new UserEntity(user));
    expect(serializedUser).toEqual({
      id: '60f1b2b5b5f9d7a9c4c8c7a9',
      username: 'username',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      role: 'user',
      isVerified: true,
      avatar: 'avatar',
      bio: 'bio',
      fullname: 'firstName lastName',
    });
  });
});
