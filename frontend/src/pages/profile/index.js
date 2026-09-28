import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReducer, useRef } from "react";
import { profileReducer } from "../../functions/reducers";
import { useEffect } from "react";
import Header from "../../components/header";
import axios from "axios";
import "./style.css";
import { useState } from "react";
import Cover from "./Cover";
import ProfilePictureInfos from "./ProfilePictureInfos";
import ProfileMenu from "./ProfileMenu";
import PplYouMayKnow from "./PplYouMayKnow";
import CreatePost from "../../components/createPost";
import GridPosts from "./GridPosts";
import Post from "../../components/post";
import Photos from "./Photos";
import Friends from "./Friends";
import Intro from "../../components/intro";
import { useMediaQuery } from "react-responsive";
export default function Profile({ setVisible }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const [photos, setPhotos] = useState({ resources: [], total_count: 0 });
  var userName = username === undefined ? user.username : username;
  const [{ loading, error, profile }, dispatch] = useReducer(profileReducer, {
    loading: false,
    profile: {},
    error: "",
  });
  useEffect(() => {
    getProfile();
  }, [userName]);
  useEffect(() => {
    setOthername(profile?.details?.otherName);
  }, [profile]);
  var visitor = userName === user.username ? false : true;
  const [othername, setOthername] = useState();
  const max = 30;
  const sort = "desc";

  // Cloudinary image listing is optional. It must never gate the profile
  // itself, otherwise a slow or unreachable image service leaves the page
  // stuck loading and the profile looks broken.
  const loadPhotos = async (name) => {
    try {
      const images = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/listImages`,
        { path: `${name}/*`, sort, max },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000,
        }
      );
      const payload = images?.data;
      setPhotos(
        payload && Array.isArray(payload.resources)
          ? payload
          : { resources: [], total_count: 0 }
      );
    } catch (imgError) {
      console.warn("Image list unavailable, continuing without photos:", imgError?.message);
      setPhotos({ resources: [], total_count: 0 });
    }
  };

  const getProfile = async () => {
    try {
      dispatch({ type: "PROFILE_REQUEST" });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getProfile/${userName}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (data.ok === false) {
        navigate("/profile");
        return;
      }
      dispatch({ type: "PROFILE_SUCCESS", payload: data });
      loadPhotos(userName);
    } catch (error) {
      console.error("Failed to load profile", userName, error);
      dispatch({
        type: "PROFILE_ERROR",
        payload: error.response?.data?.message || "Error loading profile",
      });
    }
  };
  const profileTop = useRef(null);
  const leftSide = useRef(null);
  const [height, setHeight] = useState();
  const [leftHeight, setLeftHeight] = useState();
  const [scrollHeight, setScrollHeight] = useState();
 useEffect(() => {
    if (profileTop.current) setHeight(profileTop.current.clientHeight + 300);
    if (leftSide.current) setLeftHeight(leftSide.current.clientHeight);
    window.addEventListener("scroll", getScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", getScroll);
    };
  }, [loading, scrollHeight]);
  const check = useMediaQuery({
    query: "(min-width:901px)",
  });
  const getScroll = () => {
    setScrollHeight(window.pageYOffset);
  };

  // A missing or malformed user must not render a half-built page.
  if (error) {
    return (
      <div className="profile">
        <Header page="profile" />
        <div className="no_posts">{error}</div>
      </div>
    );
  }


  return (
    <div className="profile">
      <Header page="profile" />
      <div className="profile_top" ref={profileTop}>
        <div className="profile_container">
          <Cover
            cover={profile.cover}
            visitor={visitor}
            photos={photos.resources}
          />
          <ProfilePictureInfos
            profile={profile}
            visitor={visitor}
            photos={photos.resources}
            othername={othername}
          />
          <ProfileMenu />
        </div>
      </div>
      <div className="profile_bottom">
        <div className="profile_container">
          <div className="bottom_container">
            <PplYouMayKnow />            <div
              className={`profile_grid ${
                check && scrollHeight >= height && leftHeight > 1000
                  ? "scrollFixed showLess"
                  : check &&
                    scrollHeight >= height &&
                    leftHeight < 1000 &&
                    "scrollFixed showMore"
              }`}
            >
              <div className="profile_left" ref={leftSide}>
                <Intro
                  detailss={profile.details}
                  simulation={profile.simulation}
                  visitor={visitor}
                  setOthername={setOthername}
                />
                <Photos
                  userName={userName}
                  token={user.token}
                  photos={photos}
                />
                <Friends friends={profile.friends} />
                <div className="relative_fb_copyright">
                  <Link to="/">Privacy </Link>
                  <span>. </span>
                  <Link to="/">Terms </Link>
                  <span>. </span>
                  <Link to="/">Advertising </Link>
                  <span>. </span>
                  <Link to="/">
                    Ad Choices <i className="ad_choices_icon"></i>
                  </Link>
                  <span>. </span>
                  <Link to="/"> Cookies </Link>
                  <span>. </span>
                  <Link to="/">More </Link>
                  <span>. </span>
                  <br />
                  Meta © 2022
                </div>
              </div>
              <div className="profile_right">
                {profile?.profileLocked && visitor && (
                  <div className="locked_profile_msg">
                    <div className="locked_icon_wrap">
                      <i className="lock_icon"></i>
                    </div>
                    <div className="locked_text">
                      <span className="locked_title">
                        {profile.first_name} {profile.last_name} locked their profile
                      </span>
                      <span className="locked_sub">
                        Only friends can see their posts and profile information.
                      </span>
                    </div>
                  </div>
                )}
                {!visitor && (
                  <CreatePost user={user} profile setVisible={setVisible} />
                )}
                <GridPosts />
                <div className="posts">
                  {(!profile?.profileLocked || !visitor) && profile.posts && profile.posts.length ? (
                    profile?.posts.map((post) => (
                      <Post post={post} user={user} key={post._id} profile />
                    ))
                  ) : profile?.profileLocked && visitor ? (
                    <div className="no_posts">Posts are hidden when profile is locked.</div>
                  ) : (
                    <div className="no_posts">No posts available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
