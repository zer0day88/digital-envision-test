import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './job/job.module';


@Module({
  imports: [UsersModule, DatabaseModule,  ScheduleModule.forRoot(), JobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
