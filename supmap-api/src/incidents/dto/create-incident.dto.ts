import { IsInt, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateIncidentDto {
  @IsInt()
  typeId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  longitude: number;
}
