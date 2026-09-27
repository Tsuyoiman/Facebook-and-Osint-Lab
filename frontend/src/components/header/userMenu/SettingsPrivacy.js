import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleProfileLock } from "../../../functions/user";

export default function SettingsPrivacy({ setVisible }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ ...state }));
  const [profileLocked, setProfileLocked] = useState(user?.profileLocked || false);
  const handleProfileLock = async (value) => {
    const result = await toggleProfileLock(value, user.token);
    if (result === true || result === false) {
      setProfileLocked(result);
      dispatch({ type: "TOGGLEPROFILELOCK", payload: result });
    }
  };
  return (
    <div className="absolute_wrap">
      <div className="absolute_wrap_header">
        <div
          className="circle hover3"
          onClick={() => {
            {
              setVisible(0);
            }
          }}
        >
          <i className="arrow_back_icon"></i>
        </div>
        Settings & privacy
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="settings_filled_icon"></i>
        </div>
        <span>Settings</span>
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="privacy_checkup_icon"></i>
        </div>
        <span>Privacy Checkup</span>
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="privacy_shortcuts_icon"></i>
        </div>
        <span>Privacy Shortcuts</span>
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="lock_icon"></i>
        </div>
        <div className="mmenu_col">
          <span className="mmenu_span1">Lock Profile</span>
          <span className="mmenu_span2">
            When your profile is locked, people who aren't your friends can't see your posts.
          </span>
        </div>
      </div>
      <label htmlFor="lockOff" className="hover1">
        <span>Off</span>
        <input
          type="radio"
          name="lock"
          id="lockOff"
          checked={profileLocked === false}
          onChange={() => handleProfileLock(false)}
        />
      </label>
      <label htmlFor="lockON" className="hover1">
        <span>On</span>
        <input
          type="radio"
          name="lock"
          id="lockON"
          checked={profileLocked === true}
          onChange={() => handleProfileLock(true)}
        />
      </label>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="activity_log_icon"></i>
        </div>
        <span>Activity Log</span>
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="news_icon"></i>
        </div>
        <span>News Feed Preferences</span>
      </div>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="language_icon"></i>
        </div>
        <span>Language</span>
      </div>
    </div>
  );
}
