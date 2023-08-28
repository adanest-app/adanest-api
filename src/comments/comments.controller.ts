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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService,
  ) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() comment: CreateCommentDto,
  ): Promise<any> {
    if (!(await this.postsService.isExists(comment.post))) {
      throw new NotFoundException('Post Not Found');
    }

    Object.assign(comment, { owner: req.user.userId });

    return this.commentsService.create(comment);
  }

  @Get()
  async findAll(): Promise<any> {
    return this.commentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<any> {
    if (!(await this.commentsService.checkCommentOwner(id, req.user.userId))) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentsService.update(id, updateCommentDto.content);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string): Promise<any> {
    if (!(await this.commentsService.checkCommentOwner(id, req.user.userId))) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentsService.remove(id);
  }

  @Get('post/:id')
  async findCommentsByPost(@Param('id') postId: string): Promise<any> {
    if (!(await this.postsService.isExists(postId))) {
      throw new NotFoundException('Post Not Found');
    }

    return this.commentsService.findCommentsByPost(postId);
  }

  @Get('post/:id/count')
  async count(@Param('id') postId: string): Promise<any> {
    if (!(await this.postsService.isExists(postId))) {
      throw new NotFoundException('Post Not Found');
    }

    return this.commentsService.count(postId);
  }
}
