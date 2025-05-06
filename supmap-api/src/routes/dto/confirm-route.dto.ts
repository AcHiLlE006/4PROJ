import { IsUUID } from 'class-validator';

export class ConfirmRouteDto {
  /** UUID de la proposition d’itinéraire renvoyée par le service de calcul */
  @IsUUID()
  proposalId: string;
}
