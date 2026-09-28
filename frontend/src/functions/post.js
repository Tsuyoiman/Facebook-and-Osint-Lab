import axios from "axios";
export const createPost = async (type, background, text, images, user, token) => {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/createPost`,
      { type, background, text, images, user },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return "ok";
  } catch (error) {
    console.error("createPost error:", error.response?.data);
    return error.response?.data?.message || "Error creating post";
  }
};

export const addComment = async (postId, comment, image, token) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/comments`,
    { comment, image },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
