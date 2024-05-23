export class User {
  id: string;

  firstname: string;

  lastname: string;

  birthday: string | Date;

  birthDate: number;
  birthMonth: number;

  updatedAt?: string | Date;
  createdAt: string | Date;
  timezone: string;
}
