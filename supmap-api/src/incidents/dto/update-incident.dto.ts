import { IsBoolean } from 'class-validator';

export class UpdateIncidentStatusDto {
  /** true = l’incident est toujours présent, false = disparu */
  @IsBoolean()
  isStillPresent: boolean;
}
