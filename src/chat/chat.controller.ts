import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ChatState } from './enum/chat-state.enum';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private userService: UsersService,
  ) {}

  @Get()
  async getMessages(@Req() req: any, @Query('from') from: string) {
    const userId = req.user.userId;
    if ((await this.userService.getUserById(userId)).role === 'admin') {
      return this.chatService.getMessages(userId, userId, true);
    } else if (from) {
      const admin = (await this.userService.getUsersByRole('admin')).filter(
        (user) => user._id.toString() === from,
      )[0];
      return this.chatService.getMessages(userId, admin._id.toString());
    }
  }

  @Post('send')
  async sendMessage(
    @Req() req: any,
    @Body('to') to: string,
    @Body('message') message: string,
  ) {
    const userId = req.user.userId;
    if ((await this.userService.getUserById(userId)).role === 'admin') {
      return this.chatService.create({
        sender: userId,
        receiver: to,
        message,
        state: ChatState.SENT,
      });
    }
    const admin = (await this.userService.getUsersByRole('admin')).filter(
      (user) => user._id.toString() === to,
    )[0];
    return this.chatService.create({
      sender: userId,
      receiver: admin._id.toString(),
      message,
      state: ChatState.SENT,
    });
  }

  @Put('read/:messageId')
  async readMessage(@Req() req: any, @Param('messageId') id: string) {
    const message = await this.chatService.getMessageById(id);
    if (message.receiver.toString() !== req.user.userId) {
      return 'You are not receiver of this message';
    }

    return this.chatService.updateState(id, ChatState.READ);
  }

  @Delete(':messageId')
  async deleteMessage(@Req() req: any, @Param('messageId') id: string) {
    const message = await this.chatService.getMessageById(id);
    if (message.sender.toString() !== req.user.userId) {
      return 'You are not owner of this message';
    }

    return this.chatService.deleteMessage(id);
  }
}
