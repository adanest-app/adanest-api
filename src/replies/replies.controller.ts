import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { RepliesService } from './replies.service';

@Controller('replies')
export class RepliesController {
  constructor(
    private repliesService: RepliesService,
    private commentsService: CommentsService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() reply: CreateReplyDto): Promise<any> {
    if (!(await this.commentsService.isExists(reply.comment))) {
      throw new NotFoundException('Comment Not Found');
    }
    Object.assign(reply, { owner: req.user.userId });
    return this.repliesService.create(reply);
  }

  @Get(':id')
  async findAll(@Param('id') id: string): Promise<any> {
    return this.repliesService.findAll(id);
  }

  @Get('/comment/:id')
  async findRepliesByComment(@Param('id') id: string): Promise<any> {
    return this.repliesService.findRepliesByComment(id);
  }

  @Put(':replyId')
  async update(
    @Req() req: any,
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: UpdateReplyDto,
  ): Promise<any> {
    if (!this.repliesService.checkReplyOwner(replyId, req.user.userId)) {
      throw new NotFoundException('Reply not found');
    }

    return this.repliesService.update(replyId, updateReplyDto);
  }

  @Delete(':replyId')
  async remove(
    @Req() req: any,
    @Param('replyId') replyId: string,
  ): Promise<any> {
    if (!this.repliesService.checkReplyOwner(replyId, req.user.userId)) {
      throw new NotFoundException('Reply not found');
    }
    return this.repliesService.remove(replyId);
  }
}
