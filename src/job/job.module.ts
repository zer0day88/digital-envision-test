import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../config/template.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    HttpModule,
  ],
  providers: [JobService],
})
export class JobModule {}
