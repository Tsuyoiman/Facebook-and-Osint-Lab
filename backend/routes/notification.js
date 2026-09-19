const express = require("express");
const {
  getNotifications,
  markNotificationsRead,
  deleteNotification,
} = require("../controllers/notification");
const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.get("/notifications", authUser, getNotifications);
router.put("/notifications/read", authUser, markNotificationsRead);
router.delete("/notifications/:id", authUser, deleteNotification);

module.exports = router;