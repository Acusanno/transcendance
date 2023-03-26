import { useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { socket } from "../../App";
import { IChannel } from "../../interface/Channel";
import { IUser } from "../../interface/User";
import { addAdmin } from "../../redux/chat";
import { useAppDispatch } from "../../redux/Hook";

export function BanUser(props: { chanid: any, userid: any, trigger: boolean, setTrigger: Function }) {
	const [timeout, setTimeout] = useState<string>("");

	const handleBan = () => {
		if (timeout === "")
			socket.emit('BanUser', { chanid: props.chanid, userid: props.userid });
		else
			socket.emit('BanUser', { chanid: props.chanid, userid: props.userid, timeout: parseInt(timeout) * 1000 });
	}
	
	useEffect(() => {
		socket.on("banUserOK", (data) => {
			props.setTrigger(false);
		});
		return () => {
			socket.off("banUserOK");
		}
	})

	return (props.trigger) ? (
		<div className="chat-form-popup" onClick={_ => (props.setTrigger(false))}>
			<div className="clickable-pop-up-inner" onClick={e => e.stopPropagation()}>
				<HiOutlineXMark className="close-icon" onClick={_ => (props.setTrigger(false))} />
				<br />
				<h3>Ban User</h3>
				<h4>Set time (optional)</h4>
				<input type="number" id="clickable-input" min="0" onChange={e => { setTimeout(e.target.value) }} />seconds
				<br /><br />
				<button onClick={_ => handleBan()}>Ban User</button>
			</div>
		</div>
	) : <></>;
}

export function MuteUser(props: { chanid: any, userid: any, trigger: boolean, setTrigger: Function }) {
	const [timeout, setTimeout] = useState<string>("");

	const handleMute = () => {
		if (timeout === "")
			socket.emit('MuteUser', { chanid: props.chanid, userid: props.userid });
		else
			socket.emit('MuteUser', { chanid: props.chanid, userid: props.userid, timeout: parseInt(timeout) * 1000 });
	}

	useEffect(() => {
		socket.on("muteUserOK", (data) => {
			props.setTrigger(false);
		});
		return () => {
			socket.off("muteUserOK");
		}
	})

	return (props.trigger) ? (
		<div className="chat-form-popup" onClick={_ => (props.setTrigger(false))}>
			<div className="clickable-pop-up-inner" onClick={e => e.stopPropagation()}>
				<HiOutlineXMark className="close-icon" onClick={_ => (props.setTrigger(false))} />
				<br />
				<h3>Mute User</h3>
				<h4>Set time (optional)</h4>
				<input type="number" id="clickable-input" min="0" onChange={e => { setTimeout(e.target.value) }} />seconds
				<br /><br />
				<button onClick={_ => handleMute()}>Mute User</button>
			</div>
		</div>
	) : <></>;
}

// export function AddAdmin(props: { chanid: any, user: IUser }) {
// 	const dispatch = useAppDispatch();
// 	socket.emit('GiveAdmin', { chanid: props.chanid, userid: props.user.id });

// 	useEffect(() => {
// 		socket.on("giveAdminOK", ({ userId, chanId }) => {
// 			dispatch(addAdmin({ id: chanId, user: props.user }));
// 		});
// 		return () => {
// 			socket.off("giveAdminOK");
// 		}
// 	})
// }

export function KickUser(chanid: any, userid: any) {
	socket.emit('BanUser', { chanid: chanid, userid: userid, timeout: 1 });
}

export function ConfigureChannel(props: { trigger: boolean, setTrigger: Function, channel: IChannel }) {
	const [newPassword, setNewPassword] = useState("");

	const setPassword = () => {
		if (props.channel.chanType === 0 && newPassword !== undefined) {
			socket.emit('addPassword', { chanid: props.channel.id, password: newPassword });
		}
		else if (props.channel.chanType === 2) {
			socket.emit('changePassword', { chanid: props.channel.id, password: newPassword });
		}
		props.setTrigger(false);
	}

	const removePassword = () => {
		socket.emit('rmPassword', { chanid: props.channel.id, pass: "" });
		props.setTrigger(false);
	}

	return (props.trigger) ? (
		<div className="chat-form-popup" onClick={_ => props.setTrigger(false)}>
			<div className="chat-form-inner" onClick={e => e.stopPropagation()}>
				<HiOutlineXMark className="close-icon" onClick={_ => props.setTrigger(false)} /> <br />
				{
					props.channel.chanType === 0 &&
					<>
						<h3>Set Password</h3>
						<input type="password" id="channel-input" placeholder="Insert password" onChange={e => { setNewPassword(e.target.value); }} /><br />
					</>
				}
				{
					props.channel.chanType === 2 &&
					<>
						<h3> Remove Password </h3>
						<button style={{ background: '#B33A3A' }} onClick={removePassword}> Remove Password </button>
						<h3>Change Password</h3>
						<input type="password" id="channel-input" placeholder="Insert new password" onChange={e => { setNewPassword(e.target.value); }} /><br />
					</>
				}
				<button onClick={setPassword}> Save Setting </button>
			</div>
		</div>
	) : <></>;
}
