const User = require("../models/User");
const { createNotification } = require("./notifications");

// Single source of truth for social relationships and visibility rules.
// Every controller and route must go through these functions so that a friend
// relationship means exactly the same thing everywhere in the app.

const idOf = (value) => (value ? String(value._id || value) : null);

// Mongoose arrays of ObjectId are not reference-comparable with .includes(),
// so every membership check goes through a string comparison instead. The
// needle is normalized too, because call sites legitimately pass either a
// string id or an ObjectId.
const has = (list, id) => {
  const target = idOf(id);
  if (!target) return false;
  return (list || []).some((entry) => idOf(entry) === target);
};

const sameUser = (a, b) => {
  const left = idOf(a);
  const right = idOf(b);
  return Boolean(left && right && left === right);
};

/**
 * Friendship is bidirectional and is only true when BOTH sides have accepted.
 * A pending request is deliberately not friendship.
 */
const isFriend = async (userAId, userBId) => {
  const a = idOf(userAId);
  const b = idOf(userBId);
  if (!a || !b || a === b) return false;
  const [userA, userB] = await Promise.all([
    User.findById(a).select("friends").lean(),
    User.findById(b).select("friends").lean(),
  ]);
  if (!userA || !userB) return false;
  return has(userA.friends, b) && has(userB.friends, a);
};

/** True when userB has a pending, unanswered request from userA. */
const hasPendingRequest = async (fromUserId, toUserId) => {
  const from = idOf(fromUserId);
  const to = idOf(toUserId);
  if (!from || !to || from === to) return false;
  const receiver = await User.findById(to).select("requests").lean();
  return Boolean(receiver && has(receiver.requests, from));
};

/** True when userA is waiting on an answer from userB. */
const hasReceivedRequest = async (toUserId, fromUserId) =>
  hasPendingRequest(fromUserId, toUserId);

/**
 * The full button state the profile page needs, so no component has to
 * re-derive it.
 */
const getFriendshipState = async (viewerId, targetId) => {
  const state = {
    friends: false,
    following: false,
    requestSent: false,
    requestReceived: false,
  };
  const viewer = idOf(viewerId);
  const target = idOf(targetId);
  if (!viewer || !target || viewer === target) return state;

  const [viewerDoc, targetDoc] = await Promise.all([
    User.findById(viewer).select("friends following requests").lean(),
    User.findById(target).select("friends requests").lean(),
  ]);
  if (!viewerDoc || !targetDoc) return state;

  state.friends = has(viewerDoc.friends, target) && has(targetDoc.friends, viewer);
  state.following = has(viewerDoc.following, target);
  state.requestSent = has(targetDoc.requests, viewer);
  state.requestReceived = has(viewerDoc.requests, target);
  return state;
};

/**
 * Post visibility. A post is visible when the viewer owns it, or when the
 * viewer is an accepted friend of the author. A sent-but-unaccepted request
 * does not grant access.
 */
const canViewPost = async (viewerId, postAuthorId, postPrivacy = "public") => {
  const viewer = idOf(viewerId);
  const author = idOf(postAuthorId);
  if (!viewer || !author) return false;
  if (viewer === author) return true;
  if (postPrivacy !== "friends") return true;
  return isFriend(viewer, author);
};

/** Pure form of canViewPost, for callers that already loaded the friend set. */
const canViewPostWith = (viewerId, postAuthorId, postPrivacy, friendIds) => {
  const viewer = idOf(viewerId);
  const author = idOf(postAuthorId);
  if (!viewer || !author) return false;
  if (viewer === author) return true;
  if (postPrivacy !== "friends") return true;
  return (friendIds || []).map(idOf).includes(author);
};

/**
 * Profile content visibility. A locked profile only shows restricted content
 * to accepted friends. An unlocked profile still respects friend-only posts.
 */
const canViewProfileContent = ({
  isOwner,
  isFriend,
  profileLocked,
}) => (isOwner ? true : !profileLocked || isFriend);

const sendFriendRequest = async (fromUserId, toUserId) => {
  const from = idOf(fromUserId);
  const to = idOf(toUserId);
  if (!from || !to) return { ok: false, message: "User not found" };
  if (from === to) {
    return { ok: false, message: "You can't send a friend request to yourself" };
  }

  const [sender, receiver] = await Promise.all([
    User.findById(from),
    User.findById(to),
  ]);
  if (!sender || !receiver) return { ok: false, message: "User not found" };

  if (has(receiver.friends, from) && has(sender.friends, receiver._id)) {
    return { ok: false, message: "You are already friends" };
  }
  if (has(receiver.requests, from)) {
    return { ok: false, message: "Friend request already sent" };
  }
  // If they already asked you, treat it as an immediate friendship.
  if (has(sender.requests, receiver._id)) {
    return acceptFriendRequest(receiver._id, from);
  }

  await Promise.all([
    User.updateOne({ _id: receiver._id }, { $addToSet: { requests: sender._id } }),
    User.updateOne({ _id: sender._id }, { $addToSet: { following: receiver._id } }),
  ]);
  await createNotification(receiver._id, sender._id, "friend_request");
  return { ok: true, message: "Friend request has been sent" };
};

const acceptFriendRequest = async (receiverId, senderId) => {
  const receiver = idOf(receiverId);
  const sender = idOf(senderId);
  if (!receiver || !sender) return { ok: false, message: "User not found" };
  if (receiver === sender) {
    return { ok: false, message: "You can't accept a request from yourself" };
  }

  const receiverDoc = await User.findById(receiver);
  const senderDoc = await User.findById(sender);
  if (!receiverDoc || !senderDoc) return { ok: false, message: "User not found" };
  if (!has(receiverDoc.requests, sender)) {
    return { ok: false, message: "No pending friend request from this user" };
  }

  await Promise.all([
    User.updateOne(
      { _id: receiver },
      {
        $addToSet: { friends: sender, following: sender },
        $pull: { requests: sender },
      }
    ),
    User.updateOne(
      { _id: sender },
      {
        $addToSet: { friends: receiver, following: receiver },
        $pull: { requests: receiver },
      }
    ),
  ]);
  await createNotification(sender, receiver, "friend_accepted");
  return { ok: true, message: "Friend request accepted" };
};

const declineFriendRequest = async (receiverId, senderId) => {
  const receiver = idOf(receiverId);
  const sender = idOf(senderId);
  if (!receiver || !sender) return { ok: false, message: "User not found" };
  if (receiver === sender) {
    return { ok: false, message: "You can't decline a request from yourself" };
  }
  const receiverDoc = await User.findById(receiver);
  if (!receiverDoc) return { ok: false, message: "User not found" };
  if (!has(receiverDoc.requests, sender)) {
    return { ok: false, message: "No pending friend request from this user" };
  }
  await Promise.all([
    User.updateOne(
      { _id: receiver },
      { $pull: { requests: sender, followers: sender } }
    ),
    User.updateOne({ _id: sender }, { $pull: { following: receiver } }),
  ]);
  return { ok: true, message: "Friend request declined" };
};

/** The request sender withdrawing their own outgoing request. */
const cancelFriendRequest = async (senderId, receiverId) => {
  const sender = idOf(senderId);
  const receiver = idOf(receiverId);
  if (!sender || !receiver) return { ok: false, message: "User not found" };
  if (sender === receiver) {
    return { ok: false, message: "You can't cancel a request to yourself" };
  }
  const receiverDoc = await User.findById(receiver);
  if (!receiverDoc) return { ok: false, message: "User not found" };
  if (!has(receiverDoc.requests, sender)) {
    return { ok: false, message: "No pending friend request to cancel" };
  }
  await Promise.all([
    User.updateOne(
      { _id: receiver },
      { $pull: { requests: sender, followers: sender } }
    ),
    User.updateOne({ _id: sender }, { $pull: { following: receiver } }),
  ]);
  return { ok: true, message: "Friend request cancelled" };
};

/** Breaks the friendship on both sides. */
const removeFriend = async (userAId, userBId) => {
  const a = idOf(userAId);
  const b = idOf(userBId);
  if (!a || !b) return { ok: false, message: "User not found" };
  if (a === b) return { ok: false, message: "You can't unfriend yourself" };
  const aDoc = await User.findById(a).select("friends").lean();
  if (!aDoc || !has(aDoc.friends, b)) {
    return { ok: false, message: "You are not friends" };
  }
  await Promise.all([
    User.updateOne(
      { _id: a },
      { $pull: { friends: b, following: b, followers: b } }
    ),
    User.updateOne(
      { _id: b },
      { $pull: { friends: a, following: a, followers: a } }
    ),
  ]);
  return { ok: true, message: "Friend removed" };
};

module.exports = {
  idOf,
  sameUser,
  isFriend,
  hasPendingRequest,
  hasReceivedRequest,
  getFriendshipState,
  canViewPost,
  canViewPostWith,
  canViewProfileContent,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
};
