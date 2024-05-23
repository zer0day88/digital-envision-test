import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import * as fs from 'fs';

import * as handlebar from 'handlebars';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import { config, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axiosRetry from 'axios-retry';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService implements OnApplicationBootstrap {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectConnection() private readonly knex: Knex,
    private configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  private readonly logger = new Logger(JobService.name);

  async onApplicationBootstrap() {
    const templates = this.configService.get<string[]>(
      'appConfig.template_name',
    );
    let compiledTemplate: HandlebarsTemplateDelegate[] = [];

    templates.forEach((value, index) => {
      const templatePath = `${process.cwd()}/templates/${value}.hbs`;

      try {
        const template = fs.readFileSync(templatePath, 'utf-8');
        compiledTemplate.push(handlebar.compile(template));
      } catch (e) {
        console.log(e);
      }
    });

    const timezones = moment.tz.names();
    timezones.forEach((timezone) => {
      this.addCronJob(timezone, '0 06 2 * * *', compiledTemplate);
    });
  }

  async addCronJob(
    name: string,
    time: string,
    compiledTemplate: HandlebarsTemplateDelegate[],
  ) {
    const job = new CronJob(
      time,
      async () => {
        const now = moment.tz(name);
        const date = now.format('D');
        const month = now.format('M');
        const year = moment().utc().format('Y');
        const timezone = `'${name}'`;
        const birthdayUsers: User[] = await this.knex('users as u')
          .select('u.*')
          .leftJoin('tasks as t', function () {
            this.on('u.id', '=', 't.user_id').andOnVal('t.year', '=', +year);
          })
          .whereNull('t.id')
          .andWhere('u.timezone', name)
          .andWhere('u.birthDate', date)
          .andWhere('birthMonth', month);

        if (birthdayUsers.length > 0) {
          let fail = 0;
          let success = 0;
          for (const user of birthdayUsers) {
            const tmp = {
              name: `${user.firstname} ${user.lastname}`,
            };

            if (compiledTemplate[0]) {
              let resp = await this.PostMessage(compiledTemplate[0](tmp));

              //console.log(resp, cause);
              //insert failed job to tasks and collected by failed cron job later on

              if (!resp.value) {
                const data: CreateJobDto = {
                  id: uuidv4(),
                  timezone: name,
                  executedAt: now.toISOString(),
                  birthDate: +date,
                  status: 'failed',
                  reason: resp.msg,
                  user_id: user.id,
                  year: +year,
                };
                await this.knex('tasks').insert(data);
                fail++;
              } else {
                //insert success directly job to log
                const data: CreateJobDto = {
                  id: uuidv4(),
                  timezone: name,
                  executedAt: moment().utc().toISOString(),
                  birthDate: +date,
                  status: 'done',
                  user_id: user.id,
                  year: +year,
                };
                await this.knex('tasks').insert(data);
                success++;
              }
            }
          }
          console.log(
            `job ${name} executed: ${birthdayUsers.length} users, fail: ${fail}, success: ${success} `,
          );
        }
      },
      null,
      null,
      name,
    );
    //this.logger.warn(`Job ${name} added `);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    //this.logger.warn(`job ${name} added `);
  }

  async PostMessage(message: string) {
    const data = {
      email: 'test@digitalenvision.com.au',
      message: message,
    };
    let baseURL = this.configService.get<string>('appConfig.base_url');

    axiosRetry(this.http.axiosRef, {
      retries: 3,
      retryCondition: (error) =>
        error?.response?.status >= 500 || error?.code == 'ECONNRESET',
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: (retryCount, error) => {
        if (error.code != 'ECONNRESET') {
          //console.log(retryCount, error.response.status);
        }
        //console.log(retryCount, error.code);
      },
    });

    try {
      const resp = await this.http.axiosRef.post(`${baseURL}/send-email`, data);
      return { value: resp.status == 200, msg: '' };
    } catch (e) {
      return {
        value: false,
        msg: `${e.response.status} ${e.code}  ${e.response.data}`,
      };
    }
  }
}
