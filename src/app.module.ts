import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './job/job.module';
import { KnexModule } from 'nest-knexjs';
import * as process from 'node:process';
import { ConfigModule } from '@nestjs/config';
import * as pg from 'pg';
import appConfig from './config/template.config';

pg.types.setTypeParser(pg.types.builtins.DATE, String);
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    UsersModule,
    ScheduleModule.forRoot(),
    JobModule,
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: {
          host: process.env.PGHOST,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          port: +process.env.PGPORT,
          database: process.env.PGDATABASE,
        },
        pool: {
          min: 0,
          max: 5,
        },
        debug: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
