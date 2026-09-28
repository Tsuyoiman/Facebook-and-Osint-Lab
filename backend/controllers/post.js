const Post = require("../models/Post");
const User = require("../models/User");
const { canViewPostWith, idOf } = require("../helpers/relationships");

exports.createPost = async (req, res) => {
  try {
    // The author is always taken from the session, never from the request
    // body, so a post cannot be created on someone else's behalf.
    const post = await new Post({
      ...req.body,
      user: req.user.id,
      privacy: ["public", "friends"].includes(req.body.privacy)
        ? req.body.privacy
        : "public",
    }).save();
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
    const viewerId = idOf(me._id);
    const friendIds = (me.friends || []).map(idOf);

    // Authors whose content can reach this feed: the viewer, accepted friends
    // (any privacy), and anyone with an unlocked profile (public posts only).
    const authors = await User.find({
      $or: [
        { _id: { $in: [...friendIds, viewerId] } },
        { _id: { $nin: friendIds.concat([viewerId]) }, profileLocked: { $ne: true } },
      ],
    })
      .select("_id profileLocked")
      .lean();

    const authorIds = authors.map((a) => idOf(a._id));
    const lockedNonFriends = authors
      .filter((a) => a.profileLocked === true && !friendIds.includes(idOf(a._id)))
      .map((a) => idOf(a._id));

    const posts = await Post.find({ user: { $in: authorIds } })
      .populate("user", "first_name last_name picture username gender profileLocked")
      .sort({ createdAt: -1 })
      .limit(50);

    // Friend-only posts are hidden until a friendship is actually accepted, and
    // a locked profile contributes nothing to someone who is not a friend.
    const visible = posts.filter((post) => {
      const authorId = idOf(post.user ? post.user._id : post.user);
      if (!authorId) {
        console.warn("getAllPosts: skipping post with missing author", post._id);
        return false;
      }
      if (authorId === viewerId) return true;
      if (lockedNonFriends.includes(authorId)) return false;
      return canViewPostWith(viewerId, authorId, post.privacy, friendIds);
    });

    res.json(visible);
  } catch (error) {
    console.error("getAllPosts error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const commentText = req.body.comment?.trim() || "";
    const commentImage = req.body.image || "";
    if (!commentText && !commentImage) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({
      comment: commentText,
      image: commentImage,
      commentBy: req.user.id,
    });
    await post.save();
    return res.status(201).json({ commentsCount: post.comments.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
