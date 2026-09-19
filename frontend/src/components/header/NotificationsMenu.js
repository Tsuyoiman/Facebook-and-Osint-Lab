import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { acceptRequest, deleteRequest } from "../../functions/user";

const notificationText = {
  friend_request: "sent you a friend request",
  friend_accepted: "accepted your friend request",
  follow: "started following you",
};

export default function NotificationsMenu({ open, onClose, onRead }) {
  const { user } = useSelector((state) => ({ ...state }));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/notifications`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setNotifications(data);
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/notifications/read`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        onRead();
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [open, onRead, user.token]);

  const removeNotification = async (notification) => {
    await axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/notifications/${notification._id}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setNotifications((current) =>
      current.filter((item) => item._id !== notification._id)
    );
  };

  const respondToRequest = async (notification, action) => {
    let result;
    if (action === "accept") {
      result = await acceptRequest(notification.sender._id, user.token);
    } else {
      result = await deleteRequest(notification.sender._id, user.token);
    }
    if (result !== "ok") {
      throw new Error(result);
    }
    await removeNotification(notification);
  };

  if (!open) return null;
  return (
    <div className="notifications_menu">
      <div className="notifications_menu_header">
        <strong>Notifications</strong>
        <button onClick={onClose} aria-label="Close notifications">X</button>
      </div>
      {loading && <div className="notifications_empty">Loading...</div>}
      {!loading && notifications.length === 0 && (
        <div className="notifications_empty">No notifications yet.</div>
      )}
      {!loading && notifications.map((notification) => (
        <div
          className={`notification_item ${notification.read ? "" : "unread"}`}
          key={notification._id}
        >
          <img src={notification.sender.picture} alt="" />
          <div className="notification_content">
            <Link to={`/profile/${notification.sender.username}`} onClick={onClose}>
              <span>
                <strong>{notification.sender.first_name} {notification.sender.last_name}</strong>{" "}
                {notificationText[notification.type] || "updated your notifications"}.
              </span>
            </Link>
            {notification.type === "friend_request" && (
              <div className="notification_actions">
                <button className="blue_btn" onClick={() => respondToRequest(notification, "accept")}>
                  Confirm
                </button>
                <button className="gray_btn" onClick={() => respondToRequest(notification, "delete")}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
