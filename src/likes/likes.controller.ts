import { Controller, Get, Param, Put, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
import { PostIdDto } from './likes.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put(':postId')
  async like(@Req() req: any, @Param() param: PostIdDto): Promise<boolean> {
    if (await this.likesService.isLiked(req.user.userId, param.postId)) {
      await this.likesService.delete(req.user.userId, param.postId);
      return true;
    } else {
      await this.likesService.create(req.user.userId, param.postId);
      return false;
    }
  }

  @Get(':postId')
  async count(@Param() param: PostIdDto): Promise<number> {
    return this.likesService.count(param.postId);
  }

  @Get(':postId/liked')
  async isLiked(@Req() req: any, @Param() param: PostIdDto): Promise<boolean> {
    if (await this.likesService.isLiked(req.user.userId, param.postId)) {
      return true;
    }
    return false;
  }
}
