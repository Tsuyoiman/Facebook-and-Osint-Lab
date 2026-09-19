import "./style.css";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useCallback, useEffect } from "react";
import axios from "axios";
import {
  ArrowDown,
  Messenger,
  Notifications,
  Friends,
  Gaming,
  HomeActive,
  Logo,
  Market,
  Menu,
  Search,
  Watch,
  Home,
} from "../../svg";
import { useSelector } from "react-redux";
import SearchMenu from "./SearchMenu";
import AllMenu from "./AllMenu";
import useClickOutside from "../../helpers/clickOutside";
import UserMenu from "./userMenu";
import NotificationsMenu from "./NotificationsMenu";
export default function Header({ page }) {
  const { user } = useSelector((user) => ({ ...user }));
  const color = "#65676b";
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const allmenu = useRef(null);
  const usermenu = useRef(null);
  useClickOutside(allmenu, () => {
    setShowAllMenu(false);
  });
  useClickOutside(usermenu, () => {
    setShowUserMenu(false);
  });
  const refreshNotificationCount = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/notifications`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotificationCount(data.filter((notification) => !notification.read).length);
    } catch (error) {
      setNotificationCount(0);
    }
  }, [user.token]);
  const handleNotificationsRead = useCallback(() => {
    setNotificationCount(0);
  }, []);
  useEffect(() => {
    refreshNotificationCount();
  }, [refreshNotificationCount]);
  return (
    <header>
      <div className="header_left">
        <Link to="/" className="header_logo">
          <div className="circle">
            <Logo />
          </div>
        </Link>
        <div
          className="search search1"
          onClick={() => {
            setShowSearchMenu(true);
          }}
        >
          <Search color={color} />
          <input
            type="text"
            placeholder="Search Facebook"
            className="hide_input"
          />
        </div>
      </div>
      {showSearchMenu && (
        <SearchMenu color={color} setShowSearchMenu={setShowSearchMenu} />
      )}
      <div className="header_middle">
        <Link
          to="/"
          className={`middle_icon ${page === "home" ? "active" : "hover1"}`}
        >
          {page === "home" ? <HomeActive /> : <Home color={color} />}
        </Link>
        <Link to="/" className="middle_icon">
          <Friends />
        </Link>
        <Link to="/" className="middle_icon">
          <Watch />
          <div className="middle_notification">9+</div>
        </Link>
        <Link to="/" className="middle_icon">
          <Market />
        </Link>
        <Link to="/" className="middle_icon">
          <Gaming />
        </Link>
      </div>
      <div className="header_right">
        <Link
          to="/profile"
          className={`profile_link hover1 ${
            page === "profile" ? "active_link" : ""
          }`}
        >
          <img src={user?.picture} alt=""></img>
          <span>{user?.first_name}</span>
        </Link>
        <div
          className={`circle_icon hover1 ${showAllMenu && "active_header"}`}
          ref={allmenu}
        >
          <div
            onClick={() => {
              setShowAllMenu((prev) => !prev);
            }}
          >
            <div style={{ transform: "translateY(2px)" }}>
              <Menu />
            </div>
          </div>

          {showAllMenu && <AllMenu />}
        </div>
        <div className="circle_icon hover1">
          <Messenger />
        </div>
        <div className="circle_icon hover1 notification_button">
          <div onClick={() => setShowNotifications((previous) => !previous)}>
            <Notifications />
            {notificationCount > 0 && (
              <div className="right_notification">{notificationCount}</div>
            )}
          </div>
          <NotificationsMenu
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            onRead={handleNotificationsRead}
          />
        </div>
        <div
          className={`circle_icon hover1 ${showUserMenu && "active_header"}`}
          ref={usermenu}
        >
          <div
            onClick={() => {
              setShowUserMenu((prev) => !prev);
            }}
          >
            <div style={{ transform: "translateY(2px)" }}>
              <ArrowDown />
            </div>
          </div>

          {showUserMenu && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
