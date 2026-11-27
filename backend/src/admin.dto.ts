import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateMemberDto { @IsOptional() @IsString() @MinLength(1) designation?: string; @IsOptional() @IsArray() @IsString({ each: true }) gitEmails?: string[]; }
