import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RepliesModule } from './replies/replies.module';
import { Module, ValidationPipe } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import configuration from './config/configuration';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { NlpModule } from './nlp/nlp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo_uri'),
      }),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: configService.get<string>('smtp.service'),
          auth: {
            user: configService.get<string>('smtp.auth.user'),
            pass: configService.get<string>('smtp.auth.pass'),
          },
        },
      }),
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    RepliesModule,
    ChatModule,
    NlpModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
