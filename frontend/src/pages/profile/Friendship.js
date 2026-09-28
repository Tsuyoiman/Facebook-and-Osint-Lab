import { useEffect, useRef, useState } from "react";
import useClickOutside from "../../helpers/clickOutside";
import { useSelector } from "react-redux";
import {
  acceptRequest,
  addFriend,
  cancelRequest,
  deleteRequest,
  follow,
  unfollow,
  unfriend,
} from "../../functions/user";

const emptyState = {
  friends: false,
  following: false,
  requestSent: false,
  requestReceived: false,
};

// The server owns the relationship state. Every action here re-reads the
// authoritative profile instead of only flipping local booleans, so a rejected
// request or a failed write can never leave the button lying.
export default function Friendship({ friendshipp, profileid }) {
  const [friendship, setFriendship] = useState(friendshipp || emptyState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [friendsMenu, setFriendsMenu] = useState(false);
  const [respondMenu, setRespondMenu] = useState(false);
  const menu = useRef(null);
  const menu1 = useRef(null);
  useClickOutside(menu, () => setFriendsMenu(false));
  useClickOutside(menu1, () => setRespondMenu(false));
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    setFriendship(friendshipp || emptyState);
  }, [friendshipp]);

  const refresh = async () => {
    if (!profileid || !user?.token) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/getFriendship/${profileid}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data && typeof data.friends === "boolean") setFriendship(data);
    } catch (refreshError) {
      console.warn("Could not refresh friendship state", refreshError);
    }
  };

  const run = async (action) => {
    setBusy(true);
    setError("");
    const result = await action();
    if (result !== "ok") {
      setError(result || "Something went wrong");
    }
    // Re-sync with the server so the button always reflects real state,
    // whether the write succeeded or was rejected.
    await refresh();
    setBusy(false);
  };

  const addFriendHandler = () => run(() => addFriend(profileid, user.token));
  const cancelRequestHandler = () =>
    run(() => cancelRequest(profileid, user.token));
  const followHandler = () => run(() => follow(profileid, user.token));
  const unfollowHandler = () => run(() => unfollow(profileid, user.token));
  const acceptRequestHandler = () =>
    run(() => acceptRequest(profileid, user.token));
  const unfriendHandler = () => run(() => unfriend(profileid, user.token));
  const deleteRequestHandler = () =>
    run(() => deleteRequest(profileid, user.token));

  return (
    <div className="friendship">
      {friendship?.friends ? (
        <div className="friends_menu_wrap">
          <button className="gray_btn" onClick={() => setFriendsMenu(true)}>
            <img src="../../../icons/friends.png" alt="" />
            <span>Friends</span>
          </button>
          {friendsMenu && (
            <div className="open_cover_menu" ref={menu}>
              <div className="open_cover_menu_item hover1">
                <img src="../../../icons/favoritesOutline.png" alt="" />
                Favorites
              </div>
              <div className="open_cover_menu_item hover1">
                <img src="../../../icons/editFriends.png" alt="" />
                Edit Friend list
              </div>
              {friendship?.following ? (
                <div
                  className="open_cover_menu_item hover1"
                  onClick={unfollowHandler}
                >
                  <img src="../../../icons/unfollowOutlined.png" alt="" />
                  Unfollow
                </div>
              ) : (
                <div
                  className="open_cover_menu_item hover1"
                  onClick={followHandler}
                >
                  <img src="../../../icons/unfollowOutlined.png" alt="" />
                  Follow
                </div>
              )}
              <div
                className="open_cover_menu_item hover1"
                onClick={unfriendHandler}
              >
                <i className="unfriend_outlined_icon"></i>
                Unfriend
              </div>
            </div>
          )}
        </div>
      ) : (
        !friendship?.requestSent &&
        !friendship?.requestReceived && (
          <button
            className="blue_btn"
            disabled={busy}
            onClick={addFriendHandler}
          >
            <img src="../../../icons/addFriend.png" alt="" className="invert" />
            <span>{busy ? "Sending..." : "Add Friend"}</span>
          </button>
        )
      )}
      {friendship?.requestSent ? (
        <button
          className="blue_btn"
          disabled={busy}
          onClick={cancelRequestHandler}
        >
          <img
            src="../../../icons/cancelRequest.png"
            className="invert"
            alt=""
          />
          <span>Cancel Request</span>
        </button>
      ) : (
        friendship?.requestReceived && (
          <div className="friends_menu_wrap">
            <button className="gray_btn" onClick={() => setRespondMenu(true)}>
              <img src="../../../icons/friends.png" alt="" />
              <span>Respond</span>
            </button>
            {respondMenu && (
              <div className="open_cover_menu" ref={menu1}>
                <div
                  className="open_cover_menu_item hover1"
                  onClick={acceptRequestHandler}
                >
                  Confirm
                </div>
                <div
                  className="open_cover_menu_item hover1"
                  onClick={deleteRequestHandler}
                >
                  Delete
                </div>
              </div>
            )}
          </div>
        )
      )}
      {error && <div className="friendship_error">{error}</div>}
      <div className="flex">
        {friendship?.following ? (
          <button className="gray_btn" onClick={unfollowHandler}>
            <img src="../../../icons/follow.png" alt="" />
            <span>Following</span>
          </button>
        ) : (
          <button className="blue_btn" onClick={followHandler}>
            <img src="../../../icons/follow.png" className="invert" alt="" />
            <span>Follow</span>
          </button>
        )}
        <button className={friendship?.friends ? "blue_btn" : "gray_btn"}>
          <img
            src="../../../icons/message.png"
            className={friendship?.friends && "invert"}
            alt=""
          />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
}
