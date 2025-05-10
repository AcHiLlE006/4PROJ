import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AddressInfo } from 'net';
import * as jwt from 'jsonwebtoken';
import { io, Socket } from 'socket.io-client';

import { NotificationModule } from '../src/notification/notification.module';
import { NotificationService } from '../src/notification/notification.service';

describe('NotificationModule Integration', () => {
  let app: INestApplication;
  let service: NotificationService;
  let socket: Socket;
  let port: number;

  const testUserId = 'user-123';
  const JWT_SECRET = 'test-secret';

  beforeAll(async () => {
    // Pour que NotificationGateway puisse vérifier le token
    process.env.JWT_SECRET = JWT_SECRET;

    const module = await Test.createTestingModule({
      imports: [NotificationModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Démarrage sur un port aléatoire
    await new Promise<void>(resolve => {
      const server = app.getHttpServer().listen(0, () => {
        const addr = server.address() as AddressInfo;
        port = addr.port;
        resolve();
      });
    });

    service = app.get(NotificationService);
  });

  afterAll(async () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
    await app.close();
  });

  it('client should receive routeImpacted when service.notifyRouteImpacted is called', (done) => {
    // 1) Génération du token JWT contenant userId
    const token = jwt.sign({ userId: testUserId }, JWT_SECRET);

    // 2) Connexion du client Socket.IO à la namespace /notifications
    socket = io(`http://localhost:${port}/notifications`, {
      reconnectionDelay: 0,
      forceNew: true,
      query: { token },
    });

    socket.on('connect', () => {
      // 3) Dès qu’on est connecté, on appelle le service
      const suggestions = [{ foo: 'bar' }];
      service.notifyRouteImpacted(testUserId, suggestions);

      // 4) On attend l’événement
      socket.on('routeImpacted', payload => {
        try {
          expect(payload).toEqual({ suggestions });
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    socket.on('connect_error', err => done(err));
  });
});
