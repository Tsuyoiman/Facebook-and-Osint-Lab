import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { addFriend } from "../../functions/user";

export default function AddFriendSmallCard({ item }) {
  const { user } = useSelector((state) => ({ ...state }));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleAddFriend = async () => {
    setStatus("sending");
    setError("");
    const result = await addFriend(item._id, user.token);
    if (result === "ok") {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError(result);
    }
  };

  const name = item.profile_name || "";
  return (
    <div className="addfriendCard">
      <div className="addfriend_imgsmall">
        <Link to={`/profile/${item.username}`}>
          <img src={item.profile_picture} alt="" />
        </Link>
        <div className="addfriend_infos">
          <div className="addfriend_name">
            {name.length > 11 ? `${name.substring(0, 11)}...` : name}
          </div>
          {status === "sent" ? (
            <div className="light_blue_btn">Request Sent</div>
          ) : (
            <div
              className="light_blue_btn"
              onClick={status === "sending" ? undefined : handleAddFriend}
            >
              <img
                src="../../../icons/addFriend.png"
                alt=""
                className="filter_blue"
              />
              {status === "sending" ? "Sending..." : "Add Friend"}
            </div>
          )}
          {error && <div className="addfriend_error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
