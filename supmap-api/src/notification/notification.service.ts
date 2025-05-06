import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private gateway: NotificationGateway) {}

  /**
   * Prépare et envoie la notification « route impactée »
   */
  notifyRouteImpacted(userId: string, suggestions: any[]) {
    this.gateway.sendToUser(userId, 'routeImpacted', { suggestions });
  }
}
