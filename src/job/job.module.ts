import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports:[DatabaseModule],
  providers: [JobService]
})
export class JobModule {}
