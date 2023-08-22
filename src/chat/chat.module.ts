import { User, UserSchema } from '../users/schemas/user.schema';
import { Chat, ChatSchema } from '../chat/chat.schema';
import { UsersService } from '../users/users.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [ChatService, UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  controllers: [ChatController],
})
export class ChatModule {}
