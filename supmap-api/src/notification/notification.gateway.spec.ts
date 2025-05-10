import { NotificationGateway } from './notification.gateway';
import * as jwt from 'jsonwebtoken';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let mockServer: any;
  let client: any;

  beforeEach(() => {
    gateway = new NotificationGateway();
    // on stubbe le server socket.io
    mockServer = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    gateway.server = mockServer as any;
    // reset map avant chaque test
    (gateway as any).userSockets.clear();
  });

  describe('handleConnection', () => {
    beforeAll(() => {
      process.env.JWT_SECRET = 'test-secret';
    });

    it('should register user socket on valid token', () => {
      const payload = { userId: 'u1' };
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      client = {
        handshake: { query: { token } },
        id: 'socket-1',
        disconnect: jest.fn(),
      };
      gateway.handleConnection(client as any);
      expect((gateway as any).userSockets.get('u1')).toBe('socket-1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect on invalid token', () => {
      client = {
        handshake: { query: { token: 'bad.token' } },
        id: 'socket-2',
        disconnect: jest.fn(),
      };
      gateway.handleConnection(client as any);
      expect(client.disconnect).toHaveBeenCalledWith(true);
      // pas de mapping ajouté
      expect((gateway as any).userSockets.size).toBe(0);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove mapping on disconnect', () => {
      // on pré‐remplit la map
      (gateway as any).userSockets.set('u2', 'sock-2');
      client = { id: 'sock-2' };
      gateway.handleDisconnect(client as any);
      expect((gateway as any).userSockets.has('u2')).toBe(false);
    });
  });

  describe('sendToUser', () => {
    it('should emit event when socket exists', () => {
      (gateway as any).userSockets.set('u3', 'sock-3');
      const emitMock = { emit: jest.fn() };
      mockServer.to = jest.fn().mockReturnValue(emitMock);

      gateway.sendToUser('u3', 'myEvent', { foo: 'bar' });
      expect(mockServer.to).toHaveBeenCalledWith('sock-3');
      expect(emitMock.emit).toHaveBeenCalledWith('myEvent', { foo: 'bar' });
    });

    it('should do nothing when no socket for user', () => {
      gateway.sendToUser('noone', 'evt', {});
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
