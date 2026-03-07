// src/cards/dto/index.ts
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class RevealCvvDto {
  @IsString() @IsNotEmpty()
  pin: string  // raw PIN — compared against stored pinHash server-side
}
