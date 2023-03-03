import react, { useEffect, useState } from "react";
import { ImCheckmark, ImCross } from "react-icons/im";
import { IUser } from "../../interface/User";

export function InviteButton(props: { user: any }) {
        const { user } = props;

        const pathname = window.location.pathname;
        const pathArray = pathname.split('/');
        const friendId = pathArray[pathArray.length - 1];
        const [ReqStatus, setStatus] = useState<string>('+ Add Friend');

        const sendFriendRequest = async () => {
                await fetch(`${process.env.REACT_APP_BACK}user/friend-request/send/${friendId}`, {
                        method: 'POST',
                        body: JSON.stringify({ userId: user.id }),
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                });
                setStatus('Pending');
        }

        useEffect(() => {
                const checkFriendRequest = async () => {
                        const response = await fetch(`${process.env.REACT_APP_BACK}user/friend-request/status/${friendId}`, {
                                method: 'POST',
                                body: JSON.stringify({ userId: user.id }),
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                        });
                        const data = await response.json()
                        if (data.ReqStatus)
                                setStatus(data.ReqStatus);
                        else
                                setStatus("+ Add Friend");
                }
                checkFriendRequest();
        }, [friendId, user]);

        return (
                <button className="reqButton pointer white width_50" onClick={sendFriendRequest} >
                        {ReqStatus}
                </button>
        )
}

export function Friends(props: { user: IUser }) {
        const { user } = props;
        const [friendReq, setFriendReq] = useState<{ name: string, avatar: string, id: number, ReqStatus: string, UserStatus: string }[]>([]);
        const [friend, setFriend] = useState<{ name: string, avatar: string, id: number, ReqStatus: string, UserStatus: string }[]>([]);

        useEffect(() => {
                const checkFriendRequest = async () => {
                        const response = await fetch(`${process.env.REACT_APP_BACK}user/friendsRequest`, {
                                method: 'POST',
                                body: JSON.stringify({userId: user.id}),
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                        });
                        const data = await response.json();
                        const pendingFriendRequests = data.filter((friendRequest: { ReqStatus: string; }) => friendRequest.ReqStatus === "Pending");
                        setFriendReq(pendingFriendRequests);
                };

                checkFriendRequest();
        }, []);

        useEffect(() => {
                const checkFriend = async () => {
                        const response = await fetch(`${process.env.REACT_APP_BACK}user/friends`, {
                                method: 'POST',
                                body: JSON.stringify({userId: user.id}),
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                        });
                        const data = await response.json();
                        setFriend(data);
                };

                checkFriend();
        }, []);

        useEffect(() => {}, [friend, friendReq]);
        interface FriendsListProps {
                friends: { name: string, avatar: string, id: number, ReqStatus: string, UserStatus: string }[];
        }

        const acceptFriendRequest = async (friendId: number) => {
                const response = await fetch(`${process.env.REACT_APP_BACK}user/friends/accept`, {
                        method: 'POST',
                        body: JSON.stringify({ friendId, userId: user.id }),
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                });
                const data = await response.json();
                setFriendReq((prevFriendReq) => prevFriendReq.filter((req) => req.id !== friendId));
        };

        const declineFriendRequest = async (friendId: number) => {
                const response = await fetch(`${process.env.REACT_APP_BACK}user/friends/decline`, {
                        method: 'POST',
                        body: JSON.stringify({ friend: friendId, userId: user.id }),
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                });
                const data = await response.json();
                setFriendReq(prevState => prevState.filter(declined => declined.id !== friendId));
        };



        const FriendsReqList = (props: FriendsListProps) => {
                return (
                  <ul className="friends-list">
                    {props.friends && props.friends.length > 0 ? (
                      props.friends.map((friend) => (
                        <li className="friend-block" key={friend.name}>
                          <div className="friend-img">
                            <img src={`${process.env.REACT_APP_BACK}user/${friend.id}/avatar`} alt={friend.name} />
                          </div>
                          <div className="friend-info">
                            <div className="friend-name">{friend.name}</div>
                            <div className={"color-status " + friend.UserStatus}>{friend.UserStatus}</div>
                          </div>
                          <div className="friend-actions">
                            <button className="accept-button" onClick={() => acceptFriendRequest(friend.id)}>
                              <ImCheckmark />
                            </button>
                            <button className="refuse-button" onClick={() => declineFriendRequest(friend.id)}>
                              <ImCross />
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <></>
                    )}
                  </ul>
                );
              };
              



        const FriendsReq = () => {
                return <FriendsReqList friends={friendReq} />;
        }

        const FriendsList = (props: FriendsListProps) => {
                return (
                  <ul className="friends-list">
                    {props.friends && props.friends.length > 0 ? (
                      props.friends.map((friend) => (
                        <li className="friend-block" key={friend.name}>
                          <div className="friend-img">
                            <img src={`${process.env.REACT_APP_BACK}user/${friend.id}/avatar`} alt={friend.name} />
                          </div>
                          <div className="friend-info">
                            <div className="friend-name">{friend.name}</div>
                            <div className={"color-status " + friend.UserStatus}>{friend.UserStatus}</div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <></>
                    )}
                  </ul>
                );
              };
              



        const Friends = () => {
                return <FriendsList friends={friend} />;
        }

        return (
                <div className='FriendHeader'>

                        <div className='FriendRequestBlock'>
                                <FriendsReq />
                        </div>
                        <hr className="separate-line" />
                        <div className='FriendListBlock'>
                                <Friends />
                        </div>
                </div>
        )
}
