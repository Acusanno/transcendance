import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { GameService } from './game.service';
import { userList } from 'src/app.gateway';
import { UserService } from 'src/user/user.service';
import { BadRequestException, UnauthorizedException, UseFilters } from '@nestjs/common';
import { GatewayExceptionFilter } from 'src/app.exceptionFilter';

export interface Move {
	left: boolean;
	right: boolean;
}

@UseFilters(new GatewayExceptionFilter())
@WebSocketGateway({
	cors: { //Might remove it after merge since it's already in main.ts
		origin: '*',
	},
})

export class PongGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	inviteList: number[];
	
	constructor(private gameService: GameService, private readonly userService: UserService) {
		this.inviteList = new Array<number>;
	}
	
	findByID(id: number)
	{
		let i = 0;
		while (i < userList.length)
		{
			if (userList[i].handshake.auth.user.id === id)
				return (userList[i].handshake.auth.user);
			i++;
		}
		return null;
	}

	isInInvite(id: number)
	{
		let i  = 0;
		while (i < this.inviteList.length)
		{
			if (this.inviteList[i] === id)
				return true;
			i++;
		}
		return false;
	}

	removeInvite(id: number)
	{
		let i  = 0;
		while (i < this.inviteList.length)
		{
			if (this.inviteList[i] === id)
			{
				this.inviteList.splice(i, 1);
				return;
			}
			i++;
		}
	}

	handleDisconnect(client: Socket) {
		this.gameService.playerDisconnect(client.id);
		this.gameService.removeFromWaitingRoom(client.id);
	}

	@SubscribeMessage('addToWaitingRoom')
	async HandleAddToWaitingRoom(@ConnectedSocket() client: Socket) {
		if (this.isInInvite(client.handshake.auth.user.id) === true)
		{
			this.server.to(client.id).emit('WaitingRoomFailure', 'You are already in an invite, decline it or wait for an answer');
			return;
		}
		if (this.gameService.inGame(client.handshake.auth.user.id) == true)
		{
			this.server.to(client.id).emit('WaitingRoomFailure', 'You invited someone already in a game');
			return;
		}
		if (await this.gameService.addToWaitingRoom(client) == 1)
			this.server.to(client.id).emit('WaitingRoomFailure', 'You are already in the waitingRoom');
		else
		{
			this.server.to(client.id).emit('WaitingRoomSuccess');
			this.gameService.startGame(this.server);
		}
	}

	@SubscribeMessage('removeFromWaitingRoom')
	async HandleRemoveFromWaitingRoom(@ConnectedSocket() client: Socket) {
		if (this.gameService.removeFromWaitingRoom(client.id) == 1)
			this.server.to(client.id).emit('WaitingRoomFailure', 'You are not in the waiting room');
		else
		{
			this.server.to(client.id).emit('WaitingRoomSuccess', 'You\'ve been removed from the waiting room successfuly');
		}
	}

	@SubscribeMessage('spectateGame')
	async HandleSpectator(@MessageBody() playerId: number, @ConnectedSocket() client: Socket) {
		
		let i = 0;
		const player: User | null = await this.userService.getById(playerId);
		if (player === null)
			throw new BadRequestException('UserToSpectate not found');
		while (i < this.gameService.gameRoom.length && player) {
			if (this.gameService.gameRoom[i].gameState.player1.name === player.username
				|| this.gameService.gameRoom[i].gameState.player2.name === player.username) {
				this.gameService.gameRoom[i].addSpectator(client.id);
				const socketLocal = this.findSocketFromUser(client.handshake.auth.user);
				if (socketLocal != null)
					this.server.to(socketLocal.id).emit('SpectateStart', i + 1, 0);
				return;
			}
			i++;
		}
	}

	findSocketFromUser(user: User) {
		for (const iterator of userList) {
			if (iterator.handshake.auth.user.id === user.id)
				return iterator;
		}
		return null;
	}

	findSocketById(userId: number) {
		for (const iterator of userList) {
			if (iterator.handshake.auth.user.id === userId)
				return iterator;
		}
		return null;
	}

	@SubscribeMessage('createCustomGame')
	async HandleCustomGame(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {

		console.log("CReateCUstom GAme", payload.user1.username, payload.user2.username );
		const user1 = await this.userService.getById(client.handshake.auth.user.id)
		if (!payload.user2 || !user1)
			return;
		this.gameService.removeFromWaitingRoom(client.id);
		if (this.isInInvite(payload.user2.id) || this.isInInvite(user1.id)
			|| this.gameService.inGame(user1.id) == true
			|| this.gameService.inGame(payload.user2.id) == true)
		{
			this.server.to(client.id).emit('WaitingRoomFailure', 'The person you\'re inviting is busy');
			return;
		}
		else {
			const socket = this.findSocketFromUser(payload.user2);
			console.log("user 1 user 2 socket2", user1.username, payload.user2.username);
			if (socket != null)
			{
				this.server.to(socket.id).emit('invitationInGame', payload);
				this.inviteList.push(user1.id);
				this.inviteList.push(payload.user2.id);
				this.server.to(client.id).emit('CreateCustomOK', "invitation succes");
				setTimeout(() => {
					if (user1?.id)
						this.removeInvite(user1.id);
					if (payload.user2.id)
						this.removeInvite(payload.user2.id);
				  }, 11000);
			}
		}
	}

	@SubscribeMessage('acceptCustomGame')
	async AcceptCustomGame(@MessageBody() payload: { scoreMax: string; user1: User, user2: User, extra: boolean }, @ConnectedSocket() client: Socket) {

		const user1 = await this.userService.getById(payload.user1.id);
		const user2 = await this.userService.getById(payload.user2.id);
		console.log("Aceppt game les 2 user", user1?.username, user2?.username);
		if (user2 === null || user1 === null)
		{
			throw new BadRequestException('User doesn\'t exist');
		}
		// Remove both users from InviteList, the can now invite and be invited again
		if (user1.id)
			this.removeInvite(user1.id);
		if (user2.id)
			this.removeInvite(user2.id);
		this.gameService.removeFromWaitingRoom(client.id);

		let userSocket1: Socket = userList[0]; //By default both user are the first user of the list
		let userSocket2: Socket = userList[0]; //By default both user are the first user of the list
		let i = 0;
		while (i < userList.length) {
			if (userList[i].handshake.auth.user.id === user1.id) {
				userSocket1 = userList[i];
				break;
			}
			i++;
		}
		i = 0;
		while (i < userList.length) {
			if (userList[i].handshake.auth.user.id === user2.id) {
				userSocket2 = userList[i];
				break;
			}
			i++;
		}
		if (user1.status != 'Online')
		{
			this.server.to(userSocket2.id).emit('GameCancelled', user1.username);
			return;
		}
		if (user2.status != 'Online')
		{
			this.server.to(userSocket1.id).emit('GameCancelled', user2.username);
			return;
		}
		this.gameService.startCustomGame(this.server, userSocket1, userSocket2, payload.extra, parseInt(payload.scoreMax));
	}

	@SubscribeMessage('declineCustomGame')
	DeclineCustomGame(@MessageBody() payload: { user1: User, user2: User }) {
		const user1: User = payload.user1;
		const user2: User = payload.user2;

		// Remove both users from InviteList, the can now invite and be invited again
		if (user1.id)
			this.removeInvite(user1.id);
		if (user2.id)
			this.removeInvite(user2.id);
		let socket = this.findSocketFromUser(user1);
		if (socket)
			this.server.to(socket.id).emit('GameDeclined', user2.username);
		socket = this.findSocketFromUser(user2);
		if (socket)
			this.server.to(socket.id).emit('GameDeclined', 'You');
	}

	@SubscribeMessage('GameEnd')
	HandleEnd(@MessageBody() input: Move, @ConnectedSocket() client: Socket) {
		if (this.gameService.gameRoom.length > 0)
			this.gameService.EndGame(client.id, this.server);
	}

	@SubscribeMessage('PlayerLeft')
	HandlePlayerLeft(@MessageBody() input: Move, @ConnectedSocket() client: Socket) {
		this.gameService.playerDisconnect(client.id);
	}

	@SubscribeMessage('Move1')
	HandleMove1(@MessageBody() payload: { input: { left: boolean, right: boolean }, roomId: number }, @ConnectedSocket() client: Socket) {
		const input : Move = {left: payload.input.left, right: payload.input.right};	
		this.gameService.updateMove1(input, client.id, payload.roomId);
	}

	@SubscribeMessage('Move2')
	HandleMove2(@MessageBody() payload: { input: { left: boolean, right: boolean }, roomId: number }, @ConnectedSocket() client: Socket) {
		const input : Move = {left: payload.input.left, right: payload.input.right};
		this.gameService.updateMove2(input, client.id, payload.roomId);
	}
}
