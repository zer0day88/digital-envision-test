import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment-timezone';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import axiosRetry from 'axios-retry';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private readonly http: HttpService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto) {
    const dateIso = new Date(createUserDto.birthday);
    createUserDto.birthDate = +moment(dateIso).format('D');
    createUserDto.birthMonth = +moment(dateIso).format('M');
    createUserDto.birthday = dateIso.toISOString();

    createUserDto.id = uuidv4();

    return this.knex('users').insert(createUserDto).returning('*').first();
  }

  async findAll() {
    return this.knex('users').select();
  }

  async findOne(id: string) {
    return this.knex('users').where({ id: id }).first();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    var ok = updateUserDto.birthday;

    if (updateUserDto.birthday) {
      const dateIso = new Date(updateUserDto.birthday);
      updateUserDto.birthday = dateIso.toISOString();
      updateUserDto.birthDate = +moment(dateIso).format('D');
      updateUserDto.birthMonth = +moment(dateIso).format('M');
    }

    updateUserDto.updatedAt = new Date();

    const now = moment.tz(updateUserDto.timezone);
    const date = now.format('D');

    return this.knex('users').where({ id: id }).update(updateUserDto);
  }

  remove(id: string) {
    return this.knex('users').where({ id: id }).del();
  }

  async Check() {
    const data = {
      email: 'test@digitalenvision.com.au',
      message: 'Happy birthday',
    };
    const test = 'http://127.0.0.1:3658/m1/544307-0-default/test';
    const burl = `https://email-service.digitalenvision.com.au/send-email`;
    axiosRetry(this.http.axiosRef, {
      retries: 3,
      retryCondition: (error) =>
        error?.response?.status >= 500 || error?.code == 'ECONNRESET',
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: (retryCount, error) => {
        if (error.code != 'ECONNRESET') {
          console.log(retryCount, error.response.status);
        }

        console.log(retryCount, error.code);
      },
    });

    try {
      const resp = await this.http.axiosRef.post(burl, data);
      return resp.data;
    } catch (e) {
      if (e.code == 'ECONNRESET') {
        console.log('socket hang up : ECONNRESET');
      } else {
        console.log(e.response.status, e.code, e.response.data);
      }
    }
  }
}

// {
//   'axios-retry': {
//   retries: 3,
//     retryDelay: axiosRetry.exponentialDelay,
//     shouldResetTimeout: true,
//     retryCondition: (error) => error?.response?.status >= 500,
//     onRetry: (retryCount, error, requestConfig) => {
//     console.log(`Retrying request attempt ${retryCount}`);
//   },
// },
// }
