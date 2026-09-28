import axios from "axios";

export const uploadImages = async (formData, path, token) => {
  try {
    if (path && !formData.get("path")) formData.append("path", path);
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/uploadImages`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    return error.response?.data?.message || "Image upload failed.";
  }
};
