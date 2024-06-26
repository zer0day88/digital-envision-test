export class CreateJobDto {
  id: string;
  user_id: string;
  birthDate: number;
  timezone: string;
  status: string;
  reason?: string;
  executedAt?: string | Date;
  year?: number;
}
