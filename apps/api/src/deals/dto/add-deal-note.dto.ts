import { IsString } from 'class-validator';

export class AddDealNoteDto {
  @IsString()
  message!: string;
}
