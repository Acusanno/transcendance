import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AddUserDto } from './dto/add-user.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Channel } from './entities/channel.entity';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { RmUserDto } from './dto/rm-user.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		private userService: UserService,
		// @InjectRepository(User)
		// private userRepository: Repository<User>,

	) {}

	create(createChannelDto: CreateChannelDto) {
		const channel: Channel = this.channelRepository.create(createChannelDto);
		// this.channelRepository.update(channel);
		console.log(channel);
		
		return this.channelRepository.save(channel);
	}

	async add(addUserDto: AddUserDto) {
		const channel: Channel | null = await this.channelRepository.findOne({
			relations: { users: true },
			where: {
				id: addUserDto.chanId
			}
			});
		// const user: User | null = await this.userRepository.findOneBy({ id: addUserDto.userid})
		const user = addUserDto.user;
		if (channel == null || user == null)
			throw new NotFoundException();
		channel.users.push(user);
		return this.channelRepository.save(channel);
	}	

	async rm(rmUserDto: RmUserDto) {
		const channel: Channel | null = await this.channelRepository.findOne({
			relations: { users: true },
			where: {
				id: rmUserDto.chanid
			}
			});
		// const user: User | null = await this.userRepository.findOneBy({ id: rmUserDto.userid})
		// const user: User | null = await this.userService.getById(rmUserDto.userid);
		const user = rmUserDto.user;
		if (channel == null || user == null)
			throw new NotFoundException();
		channel.users.splice(channel.users.indexOf(user, 0) ,1);
		return this.channelRepository.save(channel);
	}

	async update(id: number, channelUpdate: any) {
		console.log("UPDATE");
		
		const channel = await this.channelRepository.findOne({
			relations: { users: true, /* owner: true */ },
			where: {
				id,
			}
		});
		if (channel) {
			if (channelUpdate.channame)
				channel.name = channelUpdate.channame;
			// if (channelUpdate.owner)
			// 	channel.owner = channelUpdate.owner;
			if (channelUpdate.users)
				channel.users = channelUpdate.users;
		
		  return await this.channelRepository.save(channel);
		}
		return 'There is no user to update';
	  }

	getById(id: number) {
		return this.channelRepository.findOne({
			relations: { users: true },
			where: {
				id: id
			}
		});
	  }

	  getByName(name: string) {
		return this.channelRepository.findOne({
			relations: { users: true },
			where: {
				name: name
			}
		});
	  }

}