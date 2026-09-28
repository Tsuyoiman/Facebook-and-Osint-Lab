const Notification = require("../models/Notification");

exports.createNotification = async (recipient, sender, type) => {
  // Relationship actions can be retried by the client. Keep one actionable
  // notification per relationship instead of creating duplicates.
  await Notification.findOneAndUpdate(
    { recipient, sender, type },
    { $setOnInsert: { recipient, sender, type } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};