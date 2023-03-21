import { useEffect, useState } from "react";
import { BsFillKeyFill, BsFillPersonFill } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import { IChannel } from "../../interface/Channel";
import { useAppDispatch, useAppSelector } from "../../redux/Hook";
import { ChannelHeader, ChannelMessages } from "./ChannelMessages";
import CLickableMenu from "./clickableMenu";
import { AddChannel } from "./CreateChannel";

function JoinedChannelList() {
	const navigate = useNavigate();
	const currentUser = useAppSelector(state => state.user.user);
	const channels = useAppSelector(state => state.chat.channels);


	return (
		<div className="title">
			<header>Joined Channels <hr /></header>
			{channels && channels.map(chan => (
				<ul key={chan.name}>
				{
					chan.users.find(obj => obj.id === currentUser?.id) &&
					<li>
						<div onClick={_ => navigate(`/Chat/channel/${chan.id}`)}>{chan.name}
							{
								chan.chanType === 1 &&
								<HiLockClosed style={{ float: 'right' }} />
							}
							{
								chan.chanType === 2 &&
								<BsFillKeyFill style={{ float: 'right' }} />
							}
						</div>
					</li>
				}	
				
				</ul>
			))}
		</div>
	);
}

function PublicChannelList() {
	const navigate = useNavigate();
	const channels = useAppSelector(state => state.chat.channels);

	// need to apply chan mode condition to hide private chan
	return (
		<div className="title">

			<div className="bottom">
				<header>All Joinable Channels <hr /></header>
				{channels && channels.map(chan => (
					<ul key={chan.name}>
						<li>
							<div onClick={_ => navigate(`/Chat/channel/${chan.id}`)}>{chan.name}
								{
									chan.chanType === 1 &&
									<HiLockClosed style={{ float: 'right' }} />
								}
								{
									chan.chanType === 2 &&
									<BsFillKeyFill style={{ paddingLeft: '10px' }} />
								}
							</div>
						</li>
					</ul>
				))}
			</div>
		</div>
	);
}

function ChannelMemberList(props: { page: Function }) {
	const [currentId, setCurrentId] = useState<number | undefined>(undefined);
	const currentUser = useAppSelector(state => state.user.user);
	const { id } = useParams();
	const [chanId, setChanId] = useState<number | undefined>(undefined);
	const currentChan = useAppSelector(state =>
		state.chat.channels.find(chan => chan.id === chanId));

	useEffect(() => {
		if (id !== undefined) {
			setChanId(parseInt(id));
		}
	}, [id]);

	const changeId = (id: number) => {
		if (id === currentId)
			setCurrentId(undefined);
		else
			setCurrentId(id);
	}

	if (currentChan?.users === undefined || (currentChan.users?.find(obj => obj.id === currentUser?.id) === undefined)) {
		return (
			<div className="title"> Members <hr />
			</div>
		)
	}

	return (
		<div className="title"> Members <hr />
			{currentChan && currentChan.users?.map(user => (
				<div key={user.id} className="user-list">
					<ul onClick={e => changeId(user.id)}>
						<li>
							{user.username}
							{
								currentChan.owner?.id === user.id &&
								<FaCrown />
							}
							{
								currentChan.owner?.id !== user.id &&
								currentChan.admin?.find(obj => obj.id === user.id) &&
								<BsFillPersonFill />
							}
						</li>
					</ul>
					{
						currentId === user.id &&
						<CLickableMenu user={user} chan={currentChan} page={props.page} />
					}
				</div>
			))
			}
		</div>
	);
}

export function Channels(props: {page: Function}) {
	const { id } = useParams();

	return (id) ? (
		<div id="chat-container">
			<div className="sidebar left-sidebar">
				<JoinedChannelList />
				<AddChannel />
				<PublicChannelList />
			</div>
			<div className="chat-body">
				<ChannelHeader />
				<ChannelMessages />
			</div>
			<div className="sidebar right-sidebar">
				<ChannelMemberList page={props.page}/>
			</div>
		</div>
	) : (
		<div id="chat-container">
			<div className="sidebar left-sidebar">
				<JoinedChannelList />
				<AddChannel />
				<PublicChannelList />
			</div>
		</div>
	);
}
