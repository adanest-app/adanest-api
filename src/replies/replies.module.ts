import { CommentsModule } from 'src/comments/comments.module';
import { Reply, ReplySchema } from './schemas/reply.schema';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reply.name,
        schema: ReplySchema,
      },
    ]),
    CommentsModule,
  ],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
