const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("friends profileLocked");
    if (!me) {
      return res.json([]);
    }
    const friendIds = (me.friends || []).map((f) => f.toString());
    friendIds.push(req.user.id);

    // Find users whose posts I can see: me, my friends, or unlocked profiles
    const visibleUsers = await User.find({
      $or: [
        { _id: { $in: friendIds } },
        { _id: { $nin: friendIds }, profileLocked: { $ne: true } },
      ],
    }).select("_id profileLocked");

    const visibleIds = visibleUsers
      .filter((u) => !u.profileLocked || friendIds.includes(u._id.toString()))
      .map((u) => u._id);

    const posts = await Post.find({ user: { $in: visibleIds } })
      .populate("user", "first_name last_name picture username gender profileLocked")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error("getAllPosts error:", error);
    return res.status(500).json({ message: error.message });
  }
};
