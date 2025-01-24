import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';

import {WebSocket} from "ws";
import {EventPattern} from "@nestjs/microservices";

@WebSocketGateway({path: "/feed"})
export class FeedGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private clients: WebSocket[] = [];

    handleConnection(client: WebSocket) {
        this.clients.push(client);
    }

    handleDisconnect(client: any) {
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i] === client) {
                this.clients.splice(i, 1);
                break;
            }
        }
    }

    broadcast(message: object) {
        const encodedMessage = JSON.stringify(message);
        for (let client of this.clients) {
            client.send(encodedMessage);
        }
    }
}