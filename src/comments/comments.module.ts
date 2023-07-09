import { Comment, CommentSchema } from './schema/comment.schema';
import { CommentsController } from './comments.controller';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsService } from './comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
    PostsModule,
  ],
  exports: [CommentsService],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
