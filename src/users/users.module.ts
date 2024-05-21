import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { HttpModule } from '@nestjs/axios';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
