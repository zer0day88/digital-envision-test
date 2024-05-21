import {  IsDateString, IsNotEmpty, IsString, IsTimeZone, Length } from "class-validator"

export class CreateJobDto {
    id :string
    user_id :string
    birthDate : number
    timezone : string
    status :string
    reason? :string
}
