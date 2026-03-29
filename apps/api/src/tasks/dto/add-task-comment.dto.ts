import { IsString } from 'class-validator';

export class AddTaskCommentDto {
  @IsString()
  message!: string;
}
