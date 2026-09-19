require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

const password = "ClassroomLab123!";

const profiles = [
  {
    first_name: "Marty",
    last_name: "Romualdo",
    bYear: 1985, bMonth: 3, bDay: 12,
    username: "marty_romualdo",
    gender: "male",
    details: { bio: "District projects and public works enthusiast.", job: "Civic project coordinator", workplace: "M.R. Infrastructure Foundation", college: "Bayanihan State University", currentCity: "San Isidro", hometown: "San Isidro" },
    simulation: { occupation: "Infrastructure coordinator", education: "Bayanihan State University", location: "San Isidro", organizations: ["M.R. Infrastructure Foundation", "Bayanihan State University Alumni"], clues: ["San Isidro River Wall Project", "public procurement briefing"], exposureLevel: "high" },
    post: "Visited the fictional San Isidro River Wall Project today. The student volunteers mapped drainage points for our classroom simulation.",
  },
  {
    first_name: "Bingo",
    last_name: "Revilla",
    bYear: 1987, bMonth: 7, bDay: 24,
    username: "bingo_revilla",
    gender: "male",
    details: { bio: "Performer, event host, and community fundraiser.", job: "Entertainment producer", workplace: "Bayanihan Screenworks", college: "Lakan Arts College", currentCity: "Porto Verde", hometown: "Porto Verde" },
    simulation: { occupation: "Entertainment producer", education: "Lakan Arts College", location: "Porto Verde", organizations: ["Bayanihan Screenworks", "Bayanihan Film Awards"], clues: ["film awards sponsorship", "charity fun run"], exposureLevel: "medium" },
    post: "Great night at the fictional Bayanihan Film Awards. Proceeds support the Porto Verde student media lab.",
  },
  {
    first_name: "Jing",
    last_name: "Estrada",
    bYear: 1990, bMonth: 2, bDay: 8,
    username: "jing_estrada",
    gender: "female",
    details: { bio: "Community network volunteer and family archive researcher.", job: "Public records researcher", workplace: "Heritage Link Cooperative", college: "Lakan Arts College", currentCity: "San Isidro", hometown: "Porto Verde" },
    simulation: { occupation: "Public records researcher", education: "Lakan Arts College", location: "San Isidro", organizations: ["Heritage Link Cooperative"], clues: ["family archive exhibit", "connection to Bingo's event"], exposureLevel: "low" },
    post: "Our Heritage Link exhibit is collecting fictional neighborhood maps from the 1990s.",
  },
  {
    first_name: "Zed",
    last_name: "Co",
    bYear: 1988, bMonth: 11, bDay: 19,
    username: "zed_co",
    gender: "male",
    details: { bio: "Budget systems hobbyist focused on transparent project tracking.", job: "Budget analyst", workplace: "Civic Ledger Lab", college: "Bayanihan State University", currentCity: "San Isidro", hometown: "San Isidro" },
    simulation: { occupation: "Budget analyst", education: "Bayanihan State University", location: "San Isidro", organizations: ["Civic Ledger Lab", "Open Barangay Data Club"], clues: ["ledger prototype", "procurement reference 24-SI-07"], exposureLevel: "high" },
    post: "The Civic Ledger Lab released a fictional spreadsheet template for tracking public project milestones.",
  },
  {
    first_name: "Waldo",
    last_name: "Bayola",
    bYear: 1986, bMonth: 5, bDay: 3,
    username: "waldo_bayola",
    gender: "male",
    details: { bio: "Provincial event organizer and flood-safety volunteer.", job: "Community event organizer", workplace: "Northline Barangay Network", college: "San Isidro Community College", currentCity: "San Isidro", hometown: "Northline" },
    simulation: { occupation: "Community event organizer", education: "San Isidro Community College", location: "Northline", organizations: ["Northline Barangay Network"], clues: ["river wall volunteer day", "Northline footbridge"], exposureLevel: "medium" },
    post: "Volunteers meet at the fictional Northline footbridge for a cleanup and flood-safety walkthrough.",
  },
  {
    first_name: "Robby",
    last_name: "Padilla",
    bYear: 1992, bMonth: 9, bDay: 15,
    username: "robby_padilla",
    gender: "male",
    details: { bio: "Actor and youth advocacy speaker.", job: "Youth media advocate", workplace: "Signal Youth Studio", college: "Lakan Arts College", currentCity: "Porto Verde", hometown: "Porto Verde" },
    simulation: { occupation: "Youth media advocate", education: "Lakan Arts College", location: "Porto Verde", organizations: ["Signal Youth Studio"], clues: ["student podcast", "Bayanihan Film Awards guest"], exposureLevel: "medium" },
    post: "Recording a fictional student podcast about spotting misleading claims in public posts.",
  },
  {
    first_name: "Bitag",
    last_name: "Tulfo",
    bYear: 1989, bMonth: 1, bDay: 27,
    username: "bitag_tulfo",
    gender: "male",
    details: { bio: "Local events coordinator and civic technology volunteer.", job: "City events coordinator", workplace: "Porto Verde Civic Hall", college: "Porto Verde Polytechnic", currentCity: "Porto Verde", hometown: "Porto Verde" },
    simulation: { occupation: "City events coordinator", education: "Porto Verde Polytechnic", location: "Porto Verde", organizations: ["Porto Verde Civic Hall", "Signal Youth Studio"], clues: ["permit desk", "student internship notice"], exposureLevel: "high" },
    post: "Porto Verde Civic Hall opened applications for a fictional IT support internship.",
  },
  {
    first_name: "Sarah",
    last_name: "Duterte",
    bYear: 1991, bMonth: 6, bDay: 10,
    username: "sarah_duterre",
    gender: "female",
    details: { bio: "Education event volunteer and library program supporter.", job: "Education program coordinator", workplace: "Bright Steps Learning Hub", college: "Bayanihan State University", currentCity: "Northline", hometown: "Northline" },
    simulation: { occupation: "Education program coordinator", education: "Bayanihan State University", location: "Northline", organizations: ["Bright Steps Learning Hub"], clues: ["mobile library event", "scholarship announcement"], exposureLevel: "medium" },
    post: "Bright Steps is hosting a fictional mobile library day for Northline students.",
  },
  {
    first_name: "JP",
    last_name: "Enrile",
    bYear: 1984, bMonth: 12, bDay: 1,
    username: "jp_enrile",
    gender: "male",
    details: { bio: "Local folklore collector and fountain-of-youth meme enthusiast.", job: "Community archive volunteer", workplace: "Old Town Story Lab", college: "San Isidro Community College", currentCity: "Old Town", hometown: "Old Town" },
    simulation: { occupation: "Community archive volunteer", education: "San Isidro Community College", location: "Old Town", organizations: ["Old Town Story Lab"], clues: ["fountain of youth mural", "old town photo caption"], exposureLevel: "low" },
    post: "Found another fictional fountain-of-youth mural beside the Old Town Story Lab archive.",
  },
  {
    first_name: "Manuel",
    last_name: "Pacquiao",
    bYear: 1983, bMonth: 4, bDay: 21,
    username: "manuel_pacquiao",
    gender: "male",
    details: { bio: "Sports mentor and community charity organizer.", job: "Sports program organizer", workplace: "Bayanihan Sports Circle", college: "Porto Verde Polytechnic", currentCity: "Northline", hometown: "Northline" },
    simulation: { occupation: "Sports program organizer", education: "Porto Verde Polytechnic", location: "Northline", organizations: ["Bayanihan Sports Circle", "Bright Steps Learning Hub"], clues: ["equipment donation", "student sports clinic"], exposureLevel: "high" },
    post: "Bayanihan Sports Circle donated fictional equipment to the Bright Steps student sports clinic.",
  },
];

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL);
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.find({ username: { $in: profiles.map((profile) => profile.username) } }).select("_id username");
  const existingIds = existing.map((user) => user._id);
  await Post.deleteMany({ user: { $in: existingIds } });
  await User.deleteMany({ _id: { $in: existingIds } });

  const users = await User.insertMany(profiles.map(({ post, ...profile }) => ({
    ...profile,
    email: `${profile.username}@classroom.invalid`,
    password: passwordHash,
    verified: true,
    friends: [],
    following: [],
    followers: [],
    requests: [],
  })));
  const byUsername = Object.fromEntries(users.map((user) => [user.username, user]));
  const links = [
    ["marty_romualdo", "zed_co"], ["zed_co", "waldo_bayola"], ["waldo_bayola", "bingo_revilla"],
    ["bingo_revilla", "robby_padilla"], ["robby_padilla", "bitag_tulfo"], ["bitag_tulfo", "sarah_duterre"],
    ["sarah_duterre", "manuel_pacquiao"], ["manuel_pacquiao", "jp_enrile"], ["jp_enrile", "jing_estrada"],
  ];
  for (const [left, right] of links) {
    await User.updateOne({ _id: byUsername[left]._id }, { $addToSet: { friends: byUsername[right]._id } });
    await User.updateOne({ _id: byUsername[right]._id }, { $addToSet: { friends: byUsername[left]._id } });
  }
  await Post.insertMany(profiles.map(({ post, username }) => ({ text: post, user: byUsername[username]._id, type: null, images: [], comments: [] })));
  console.log(`Seeded ${users.length} fictional classroom users.`);
  console.log(`Shared password for the seeded accounts: ${password}`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
