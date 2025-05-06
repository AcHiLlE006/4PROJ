import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ namespace: '/notifications' })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets = new Map<string, string>(); // userId → socket.id

  handleConnection(client: Socket) {
    // Le front envoie son token JWT à la connexion
    const token = client.handshake.query.token as string;
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET) as any;
      this.userSockets.set(payload.userId, client.id);
    } catch (e) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Retirer l’user associé
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  /**
   * Envoi un message à l’utilisateur donné
   */
  sendToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
