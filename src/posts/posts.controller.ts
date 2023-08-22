import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/auth-guard.metadata';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private userService: UsersService,
  ) {}

  @Public()
  @Get()
  async getPosts(@Query('type') type: string): Promise<any> {
    return this.postsService.getPosts(type);
  }

  @Public()
  @Get('/p/:id')
  async getPost(@Param() { id }: GetPostDto): Promise<any> {
    return this.postsService.getPost(id);
  }

  @Public()
  @Get('/search')
  async searchPosts(@Query() req: any): Promise<any> {
    return this.postsService.searchPosts(req);
  }

  @Post()
  async createPost(@Req() req: any, @Body() body: CreatePostDto): Promise<any> {
    if (!(await this.userService.isExists(req.user.userId))) {
      throw new NotFoundException('Owner Not Found');
    }
    Object.assign(body, { owner: req.user.userId });
    return this.postsService.createPost(body);
  }

  @Put(':id')
  async updatePost(
    @Req() req: any,
    @Param() { id }: GetPostDto,
    @Body() body: UpdatePostDto,
  ): Promise<any> {
    if (!(await this.postsService.checkOwner(id, req.user.userId))) {
      return 'You are not owner of this post';
    }

    return this.postsService.updatePost(id, body);
  }
  @Delete(':id')
  async deletePost(@Req() req: any, @Param() { id }: GetPostDto): Promise<any> {
    if (!(await this.postsService.checkOwner(id, req.user.userId))) {
      return 'You are not owner of this post';
    }
    return this.postsService.deletePost(id);
  }

  @Post('/upload/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*',
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10,
        })
        .build(),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    if (await this.userService.isExists(req.user.userId)) {
      const url = await this.postsService.uploadCover(req.user.userId, file);
      if (url) {
        return url;
      } else {
        throw new BadRequestException('Upload Failed');
      }
    }
    throw new NotFoundException('User Not Found');
  }
}
