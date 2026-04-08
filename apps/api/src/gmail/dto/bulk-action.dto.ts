import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
