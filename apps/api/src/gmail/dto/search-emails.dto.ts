import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class SearchEmailsDto {
  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsDateString()
  @IsNotEmpty()
  from: string;

  @IsDateString()
  @IsNotEmpty()
  to: string;
}
