import "./style.css";
import { useState, useRef } from "react";
import EmojiPickerBackground from "./EmojiPickerBackground";
import AddToYourPost from "./AddToYourPost";
import ImagePreview from "./ImagePreview";
import useClickOutside from "../../helpers/clickOutside";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import PostError from "./PostError";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { uploadImages } from "../../functions/uploadImages";

export default function CreatePostPopup({ user, setVisible, refreshPosts }) {
  const popup = useRef(null);
  const [text, setText] = useState("");
  const [showPrev, setShowPrev] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [bg, setBg] = useState("");
  useClickOutside(popup, () => setVisible(false));

  const postSubmit = async () => {
    if (!text && !bg && !images.length) return;
    setLoading(true);
    setError("");
    try {
      let response;
      if (bg) {
        response = await createPost(null, bg, text, null, user.id, user.token);
      } else if (images.length) {
        const postImages = images.map((img) => dataURItoBlob(img));
        const path = `${user.username}/post_images`;
        let formData = new FormData();
        formData.append("path", path);
        postImages.forEach((image) => formData.append("file", image));
        const uploaded = await uploadImages(formData, path, user.token);
        response = await createPost(null, null, text, uploaded, user.id, user.token);
      } else {
        response = await createPost(null, bg, text, null, user.id, user.token);
      }
      setLoading(false);
      if (response === "ok") {
        refreshPosts?.();
        setBg("");
        setText("");
        setImages([]);
        setVisible(false);
      } else {
        setError(response);
      }
    } catch (err) {
      console.error("postSubmit error:", err);
      setError("Failed to create post. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="blur">
      <div className="postBox" ref={popup}>
        {error && <PostError error={error} setError={setError} />}
        <div className="box_header">
          <div
            className="small_circle"
            onClick={() => setVisible(false)}
          >
            <i className="exit_icon"></i>
          </div>
          <span>Create post</span>
        </div>
        <div className="box_profile">
          <img src={user?.picture} alt="" className="box_profile_img" />
          <div className="box_col">
            <div className="box_profile_name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="box_privacy">
              <img src="../../../icons/public.png" alt="" />
              <span>Public</span>
              <i className="arrowDown_icon"></i>
            </div>
          </div>
        </div>

        {!showPrev ? (
          <EmojiPickerBackground
            text={text}
            user={user}
            setText={setText}
            type2={showPrev}
            background={bg}
            setBg={setBg}
          />
        ) : (
          <ImagePreview
            text={text}
            user={user}
            setText={setText}
            showPrev={showPrev}
            images={images}
            setImages={setImages}
            setShowPrev={setShowPrev}
            setError={setError}
          />
        )}
        <AddToYourPost setShowPrev={setShowPrev} />
        <button
          className="post_submit"
          onClick={postSubmit}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#fff" size={5} /> : "Post"}
        </button>
      </div>
    </div>
  );
}