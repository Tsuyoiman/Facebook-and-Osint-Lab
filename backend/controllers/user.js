const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/tokens");
const User = require("../models/User");
const Code = require("../models/Code");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail, sendResetCode } = require("../helpers/mailer");
const generateCode = require("../helpers/generateCode");
const { createNotification } = require("../helpers/notifications");
const {
  isFriend,
  getFriendshipState,
  canViewPostWith,
  canViewProfileContent,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  idOf,
} = require("../helpers/relationships");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message:
          "An account with this email address already exists, try again with a different email address",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "First name must be between 3 and 30 characters",
      });
    }

    if (!validateLength(last_name, 2, 30)) {
      return res.status(400).json({
        message: "Last name must be between 2 and 30 characters",
      });
    }

    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "Password must be between 6 and 40 characters",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);
    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Registration Success! Please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.activateAccount = async (req, res) => {
  try {
    //make sure we have the correct user
    const validUser = req.user.id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);

    if (validUser !== user.id) {
      return res.status(400).json({
        message: "You don't have the authorization to complete this operation.",
      });
    }
    if (check.verified == true) {
      return res.status(400).json({
        message: "This email is already activated.",
      });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res.status(200).json({
        message: "Account has been activated.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "The email address you entered is not connected to an account",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials. Please try again.",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      darkMode: user.darkMode || false,
      profileLocked: user.profileLocked || false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res.status(400).json({
        message: "This account is already activated.",
      });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    return res.status(200).json({
      message: "Email verification link has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "Account does not exist.",
      });
    }
    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publicUserFields =
  "first_name last_name username picture cover gender details simulation friends following followers profileLocked";

const publicUser = (user) => ({
  _id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  username: user.username,
  picture: user.picture,
  cover: user.cover,
  gender: user.gender,
  details: user.details,
  simulation: user.simulation,
  profileLocked: user.profileLocked === true,
});

const publicPost = (post) => ({
  _id: post._id,
  text: post.text,
  images: post.images,
  background: post.background,
  type: post.type,
  privacy: post.privacy || "public",
  createdAt: post.createdAt,
  user: post.user ? publicUser(post.user) : null,
  comments: (post.comments || []).map((comment) => ({
    comment: comment.comment,
    image: comment.image,
    commentAt: comment.commentAt,
    commentBy: comment.commentBy ? publicUser(comment.commentBy) : undefined,
  })),
});

exports.searchPublicUsers = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim().slice(0, 80);
    if (query.length < 2) return res.json([]);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    const emailPattern = new RegExp(`^${escaped}$`, "i");
    const users = await User.find({
      $or: [
        { first_name: pattern },
        { last_name: pattern },
        { username: pattern },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$first_name", " ", "$last_name"] },
              regex: escaped,
              options: "i",
            },
          },
        },
        // Email is accepted only as an exact lookup key. It is not included
        // in the public response, which still contains only public fields.
        { email: emailPattern },
      ],
    })
      .select(publicUserFields)
      .limit(10)
      .lean();
    res.json(users.map(publicUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const profile = await User.findOne({ username: req.params.username })
      .select(publicUserFields)
      .populate("friends", "first_name last_name username picture")
      .lean();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const isOwner = req.user && idOf(req.user.id) === idOf(profile._id);
    const isFriend =
      req.user && req.user.id ? await isFriend(req.user.id, profile._id) : false;
    const profileLocked = profile.profileLocked === true;
    const canViewContent = canViewProfileContent({
      isOwner,
      isFriend,
      profileLocked,
    });

    let posts = [];
    if (canViewContent) {
      const allPosts = await Post.find({ user: profile._id })
        .select("text images background type privacy createdAt comments user")
        .populate("user", publicUserFields)
        .populate("comments.commentBy", "first_name last_name username picture")
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
      const friendIds = req.user && req.user.id ? await getFriendIds(req.user.id) : [];
      posts = allPosts.filter((post) =>
        canViewPostWith(
          req.user?.id,
          idOf(post.user ? post.user._id : post.user),
          post.privacy,
          friendIds
        )
      );
    }

    res.json({
      ...publicUser(profile),
      friends: canViewContent ? profile.friends || [] : [],
      posts: posts.map(publicPost),
      profileLocked,
      canViewPosts: canViewContent,
      isOwner,
      friendship: {
        friends: isFriend,
        following: false,
        requestSent: false,
        requestReceived: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFriendIds = async (userId) => {
  const me = await User.findById(userId).select("friends").lean();
  return (me?.friends || []).map(idOf);
};

/**
 * Authoritative relationship state for one target user, used by the profile
 * page to re-sync its buttons after an action.
 */
exports.getFriendship = async (req, res) => {
  try {
    const friendship = await getFriendshipState(req.user.id, req.params.id);
    return res.json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * People the viewer is not already friends with, for the "People you may know"
 * panel. Replaces the previously hardcoded client-side list.
 */
exports.suggestUsers = async (req, res) => {
  try {
    const viewerId = req.user && req.user.id;
    if (!viewerId) return res.json([]);
    const viewer = await User.findById(viewerId)
      .select("friends following requests")
      .lean();
    if (!viewer) return res.json([]);

    const excluded = [
      idOf(viewer._id),
      ...(viewer.friends || []).map(idOf),
      ...(viewer.following || []).map(idOf),
      ...(viewer.requests || []).map(idOf),
    ];
    // Anyone who already asked the viewer is a pending request, not a suggestion.
    const users = await User.find({ _id: { $nin: excluded } })
      .select("first_name last_name username picture simulation")
      .limit(6)
      .lean();

    res.json(users.map((user) => publicUser(user)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);
    const savedCode = await new Code({
      code,
      user: user._id,
    }).save();
    sendResetCode(user.email, user.first_name, code);
    return res.status(200).json({
      message: "Email reset code has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//see if reset code is correct
exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const Dbcode = await Code.findOne({ user: user._id });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is incorrect",
      });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { email, password } = req.body;

  const cryptedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      password: cryptedPassword,
    }
  );
  return res.status(200).json({ message: "ok" });
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const viewer = await User.findById(req.user.id).select(
      "friends following requests"
    );
    if (!viewer) {
      return res.status(404).json({ message: "Session user not found" });
    }
    const profile = await User.findOne({ username }).select("-password");
    if (!profile) {
      return res.json({ ok: false });
    }

    const friendship = await getFriendshipState(viewer._id, profile._id);
    const isOwner = idOf(viewer._id) === idOf(profile._id);
    const profileLocked = profile.profileLocked === true;
    const canViewContent = canViewProfileContent({
      isOwner,
      isFriend: friendship.friends,
      profileLocked,
    });

    // Locked profiles hide restricted content from non-friends, but the
    // basic public header (name, picture, friend count) is still returned.
    let posts = [];
    if (canViewContent) {
      const allPosts = await Post.find({ user: profile._id })
        .populate("user", publicUserFields)
        .populate("comments.commentBy", "first_name last_name username picture")
        .sort({ createdAt: -1 });
      // Per-post privacy still applies even inside an unlocked profile.
      posts = allPosts.filter((post) =>
        canViewPostWith(
          viewer._id,
          idOf(post.user ? post.user._id : post.user),
          post.privacy,
          viewer.friends
        )
      );
    }

    let friends = [];
    if (friendship.friends || canViewContent) {
      await profile.populate("friends", "first_name last_name username picture");
      friends = profile.friends || [];
    }

    const base = profile.toObject();
    delete base.password;
    return res.json({
      ...base,
      friends,
      posts,
      friendship,
      profileLocked,
      canViewPosts: canViewContent,
      isOwner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateCover = async (req, res) => {
  try {
    const { url } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateDetails = async (req, res) => {
  try {
    const { infos } = req.body;
    if (!infos || typeof infos !== "object" || Array.isArray(infos)) {
      return res.status(400).json({ message: "Invalid profile details." });
    }

    // Do not replace the whole subdocument: the bio form submits the other
    // fields too, and an empty relationship value is not a valid enum value.
    const details = { ...infos };
    if (!details.relationship) delete details.relationship;
    if (details.hobbies !== undefined) {
      details.hobbies = Array.isArray(details.hobbies)
        ? details.hobbies.map((hobby) => String(hobby).trim()).filter(Boolean)
        : [];
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: Object.fromEntries(
          Object.entries(details).map(([key, value]) => [`details.${key}`, value])
        ),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(updated.details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addFriend = async (req, res) => {
  try {
    const result = await sendFriendRequest(req.user.id, req.params.id);
    return res.status(result.ok ? 200 : 400).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const result = await cancelFriendRequest(req.user.id, req.params.id);
    return res.status(result.ok ? 200 : 400).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }
      const alreadyFollowing = (sender.following || []).some(
        (f) => idOf(f) === idOf(receiver._id)
      );
      if (alreadyFollowing) {
        return res.status(400).json({ message: "Already following" });
      }
      await receiver.updateOne({ $addToSet: { followers: sender._id } });
      await sender.updateOne({ $addToSet: { following: receiver._id } });
      await createNotification(receiver._id, sender._id, "follow");
      return res.json({ message: "Follow success" });
    } else {
      return res
        .status(400)
        .json({ message: "You can't follow yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.unfollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }
      const isFollowing = (sender.following || []).some(
        (f) => idOf(f) === idOf(receiver._id)
      );
      if (!isFollowing) {
        return res.status(400).json({ message: "Already not following" });
      }
      await receiver.updateOne({ $pull: { followers: sender._id } });
      await sender.updateOne({ $pull: { following: receiver._id } });
      return res.json({ message: "Unfollow success" });
    } else {
      return res
        .status(400)
        .json({ message: "You can't unfollow yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.acceptRequest = async (req, res) => {
  try {
    const result = await acceptFriendRequest(req.user.id, req.params.id);
    return res.status(result.ok ? 200 : 400).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const result = await declineFriendRequest(req.user.id, req.params.id);
    return res.status(result.ok ? 200 : 400).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const result = await removeFriend(req.user.id, req.params.id);
    return res.status(result.ok ? 200 : 400).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleProfileLock = async (req, res) => {
  try {
    const { locked } = req.body;
    if (typeof locked !== "boolean") {
      return res
        .status(400)
        .json({ message: "locked must be true or false" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileLocked: locked },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ profileLocked: user.profileLocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleDarkMode = async (req, res) => {
  try {
    const { darkMode } = req.body;
    if (typeof darkMode !== "boolean") {
      return res
        .status(400)
        .json({ message: "darkMode must be true or false" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { darkMode: darkMode },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ darkMode: user.darkMode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
