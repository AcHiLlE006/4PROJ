import { IsNumber, Min, Max } from 'class-validator';

export class GetRawRoutesDto {
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90) @Max(90)
  originLat: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180) @Max(180)
  originLon: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90) @Max(90)
  destinationLat: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180) @Max(180)
  destinationLon: number;
}
