import { IsDateString, IsNotEmpty, IsString, IsTimeZone, Length } from "class-validator"


export class UpdateUserDto {
    id: string

    @Length(1,50)
    @IsNotEmpty()
    firstname: string

    @Length(1,50)
    @IsNotEmpty()
    lastname: string

    @IsDateString()
    @IsNotEmpty()
    birthday: string | Date

    birthDate: number
    birthMonth: number
    
    updatedAt?: string | Date
    
    @IsNotEmpty()
    @IsTimeZone()
    timezone: string
}