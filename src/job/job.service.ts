import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import { CreateJobDto } from './dto/create-job.dto';
import { DatabaseService } from 'src/database/database.service';


@Injectable()
export class JobService implements OnApplicationBootstrap {
    constructor(private schedulerRegistry: SchedulerRegistry,private readonly db: DatabaseService) {}
    async onApplicationBootstrap() {
        const timezones = moment.tz.names()
        timezones.forEach(timezone => {
            this.addCronJob(timezone,'0 49 20 * * *')
        });
        
    }
    private readonly logger = new Logger(JobService.name);

    async addCronJob(name: string, time: string) {
        const job = new CronJob(time, async () => {
        const now = moment.tz(name)
        const date = now.format("D")
        const month = now.format("M")
        const timezone = `'${name}'`
        let b = await this.db.$queryRaw<any[]>`select id,"birthDate" from users where timezone=${timezone} and "birthDate"=${+date} and "birthMonth"=${+month}`

            
        if (name === 'Asia/Singapore') {
            console.log(`select id,"birthDate" from users where timezone=${timezone} and "birthDate"=${+date} and "birthMonth"=${+month}`)
            console.log(b)
        }
        
        
        
       
        //this.logger.warn(`time in ${name} : ${now}`);
    });
    
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    
    this.logger.warn(
        `job ${name} added `,
    );
    }

    // @Cron('* * * * * *')
    // async CollectorCron() {
        
    //     const now = new Date()
    //     const dateNow = now.getUTCDate();
    //     const monthNow = now.getUTCMonth();
    //     console.log(moment.tz("Asia/Jakarta").month())

    //    const b:any[]  = await this.db.$queryRaw`select id`

    //     let datas: CreateJobDto[] = []
    //     b.forEach(val => {
    //       var data: CreateJobDto = new CreateJobDto();
    //       data.id = uuidv4();
    //       data.user_id = val.id;
    //       data.birthDate = val.birthDate
    //       data.timezone = val.timezone;
    //       datas.push(data)
    //     });

    //     const d = await this.db.tasks.createMany({
    //         data: datas
    //     })
   
    
    //     this.logger.debug('collecting data');
    // }

}
