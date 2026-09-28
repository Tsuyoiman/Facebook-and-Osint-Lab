const express = require("express");
const { createPost, getAllPosts, addComment } = require("../controllers/post");
const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/createPost", authUser, createPost);
router.post("/posts/:id/comments", authUser, addComment);
router.get("/getAllPosts", authUser, getAllPosts);

module.exports = router;
