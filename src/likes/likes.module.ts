import { LikesController } from './likes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './likes.schema';
import { LikesService } from './likes.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
