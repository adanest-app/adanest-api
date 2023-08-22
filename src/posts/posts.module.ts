import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [PostsService],
  controllers: [PostsController],
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
  ],
  exports: [PostsService],
})
export class PostsModule {}
