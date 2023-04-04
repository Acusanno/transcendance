import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { OauthModule } from './Oauth/Oauth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './chat/chat.gateway';
import { AppGateway } from './app.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { Results } from './results/entities/results.entity';
import { ChannelModule } from './chat/channel/channel.module';
import { Channel } from './chat/channel/entities/channel.entity';
import { FriendRequest } from './user/entities/friend-request.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: + !process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: [User, Results, Channel, FriendRequest],
      synchronize: true,
    }),
    MulterModule.register({
      dest: './storage/images',
    }),
    ConfigModule.forRoot(),
    UserModule,
    GameModule,
    OauthModule,
    ChannelModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, AppGateway,
    {
      provide: APP_INTERCEPTOR,
		  useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule { }
