const Notification = require("../models/Notification");

exports.createNotification = async (recipient, sender, type) => {
  await Notification.create({ recipient, sender, type });
};