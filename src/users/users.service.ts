import { Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HttpService } from "@nestjs/axios";
import { DatabaseService } from "src/database/database.service";
import * as moment from "moment-timezone";

@Injectable()
export class UsersService {

  constructor(private readonly db: DatabaseService, private readonly http: HttpService) {
  }

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto) {
    const dateIso = new Date(createUserDto.birthday);
    createUserDto.birthDate = +moment(dateIso).format('D');
    createUserDto.birthMonth = +moment(dateIso).format('M');
    createUserDto.birthday = dateIso.toISOString();


    createUserDto.id = uuidv4();

    return this.db.users.create({
      data: createUserDto
    })
  }

  async findAll() {
    return this.db.users.findMany();
  }

  async findOne(id: string) {
    return this.db.users.findUnique({where:{id:id}})
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

    return this.db.users.update({
      where: {
        id
      },
      data: updateUserDto
    })
  }

  remove(id: string) {
    return this.db.users.delete({
      where:{
        id: id
      }
    })
  }

  async GetCoins() {
    const resp = await this.http.axiosRef.get(
      "https://api.coindesk.com/v1/bpi/currentprice.json"
    );
    console.log(resp)
  }

}
