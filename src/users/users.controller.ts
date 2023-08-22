import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserEntity } from './serialization/user.serialization';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/auth-guard.metadata';
import { CreateUserDTO } from './dto/create-user.dto';
import { NewUserDTO } from './dto/update-user.dto';
import { GetUserDTO } from './dto/get-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<any> {
    return this.usersService.getUsers();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/q')
  async getUser(@Query() { id, username }: GetUserDTO): Promise<UserEntity> {
    return new UserEntity(
      (await this.usersService.getUserById(id))?.toObject() ||
        (await this.usersService.getUserByUsername(username))?.toObject(),
    );
  }

  @Public()
  @Post()
  async createUser(@Body() user: CreateUserDTO): Promise<string> {
    if (await this.usersService.isEmailTaken(user.email)) {
      throw new BadRequestException('User Is Exists');
    }
    user.password = await this.usersService.hashPassword(user.password);

    await this.usersService.createUser(user);
    return 'User created';
  }

  @Delete()
  async deleteUser(@Req() req: any): Promise<string> {
    if (await this.usersService.isExists(req.user.userId)) {
      await this.usersService.deleteUser(req.user.userId);
      return 'User deleted';
    }
    throw new NotFoundException('User Not Found');
  }

  @Put()
  async updateUser(
    @Req() req: any,
    @Body() newUser: NewUserDTO,
  ): Promise<string> {
    if (await this.usersService.isExists(req.user.userId)) {
      let user = await this.usersService.getUserByUsername(newUser.username);
      if (user?.username?.length > 0 && user.id !== req.user.userId) {
        throw new BadRequestException('Username is taken');
      }
      user = await this.usersService.getUserByEmail(newUser.email);
      if (user?.email?.length > 0 && user.id !== req.user.userId) {
        throw new BadRequestException('Email is taken');
      }
      if (newUser.password?.length > 0) {
        newUser.password = await this.usersService.hashPassword(
          newUser.password,
        );
      }
      await this.usersService.updateUser(req.user.userId, newUser);
      return 'User updated';
    }
    throw new NotFoundException('User Not Found');
  }

  @Post('/upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
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
    if (await this.usersService.isExists(req.user.userId)) {
      const url = await this.usersService.uploadAvatar(req.user.userId, file);
      if (url) {
        await this.usersService.updateUser(req.user.userId, { avatar: url });
        return url;
      } else {
        throw new BadRequestException('Upload Failed');
      }
    }
    throw new NotFoundException('User Not Found');
  }
}
