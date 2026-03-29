import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsString()
  actionType!: string;

  @IsOptional()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
