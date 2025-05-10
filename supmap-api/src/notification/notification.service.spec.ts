import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let gateway: Partial<NotificationGateway>;

  beforeEach(() => {
    gateway = {
      sendToUser: jest.fn(),
    };
    service = new NotificationService(gateway as NotificationGateway);
  });

  it('notifyRouteImpacted should call gateway.sendToUser with correct params', () => {
    const userId = 'user123';
    const suggestions = [{ routeId: 42 }];
    service.notifyRouteImpacted(userId, suggestions);
    expect(gateway.sendToUser).toHaveBeenCalledWith(
      userId,
      'routeImpacted',
      { suggestions },
    );
  });
});
