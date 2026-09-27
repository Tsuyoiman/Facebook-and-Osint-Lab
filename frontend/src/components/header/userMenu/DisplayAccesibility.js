import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../../../functions/user";

export default function DisplayAccesibility({ setVisible }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ ...state }));
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const handleDarkMode = async (value) => {
    const result = await toggleDarkMode(value, user.token);
    if (result === true || result === false) {
      setDarkMode(result);
      dispatch({ type: "TOGGLEDARKMODE", payload: result });
    }
  };
  return (
    <div className="absolute_wrap">
      <div className="absolute_wrap_header">
        <div
          className="circle hover1"
          onClick={() => {
            setVisible(0);
          }}
        >
          <i className="arrow_back_icon"></i>
        </div>
        Display & Accessibility
      </div>
      <div className="mmenu_main">
        <div className="small_circle" style={{ width: "50px" }}>
          <i className="dark_filled_icon"></i>
        </div>
        <div className="mmenu_col">
          <span className="mmenu_span1">Dark Mode</span>
          <span className="mmenu_span2">
            Adjust the appearance of Facebook to reduce glare and give your eyes
            a break.
          </span>
        </div>
      </div>
      <label htmlFor="darkOff" className="hover1">
        <span>Off</span>
        <input
          type="radio"
          name="dark"
          id="darkOff"
          checked={darkMode === false}
          onChange={() => handleDarkMode(false)}
        />
      </label>
      <label htmlFor="darkON" className="hover1">
        <span>On</span>
        <input
          type="radio"
          name="dark"
          id="darkON"
          checked={darkMode === true}
          onChange={() => handleDarkMode(true)}
        />
      </label>
      <div className="mmenu_main">
        <div className="small_circle">
          <i className="compact_icon"></i>
        </div>
        <div className="mmenu_col">
          <span className="mmenu_span1">Compact Mode</span>
          <span className="mmenu_span2">
            Make your font size smaller so more content can fit on your screen.
          </span>
        </div>
      </div>
      <label htmlFor="compactOff" className="hover1">
        <span>Off</span>
        <input type="radio" name="compact" id="compactOff" />
      </label>
      <label htmlFor="compactOn" className="hover1">
        <span>On</span>
        <input type="radio" name="compact" id="compactOn" />
      </label>
      <div className="mmenu_item hover3">
        <div className="small_circle">
          <i className="keyboard_icon"></i>
        </div>
        <span>Keyboard</span>
        <div className="rArrow">
          <i className="right_icon"></i>
        </div>
      </div>
    </div>
  );
}
