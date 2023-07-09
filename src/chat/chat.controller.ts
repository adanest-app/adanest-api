import { Controller, Get, Req, Post, Body, Put } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ChatState } from './enum/chat-state.enum';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private userService: UsersService,
  ) {}

  @Get()
  async getMessages(@Req() req: any) {
    const userId = req.user.userId;
    if ((await this.userService.getUserById(userId))?.role === 'admin') {
      return this.chatService.getMessages(userId, userId, true);
    } else {
      const admin = (await this.userService.getUsersByRole('admin'))[0];
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
    const admin = (await this.userService.getUsersByRole('admin'))[0];
    return this.chatService.create({
      sender: userId,
      receiver: admin._id.toString(),
      message,
      state: ChatState.SENT,
    });
  }

  @Put('read')
  async readMessage(@Req() req: any, @Body('messageId') id: string) {
    return this.chatService.updateState(id, ChatState.READ);
  }
}
