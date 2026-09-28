require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

const password = "C1sc0123";

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
    {
    first_name: "Zendaya",
    last_name: "Coleman",
    bYear: 1996, bMonth: 9, bDay: 1,
    username: "zendaya",
    gender: "female",
    details: { bio: "Award-winning actress and style icon.", job: "Actress", workplace: "Hollywood Studios", college: "Oak Park High School", currentCity: "Los Angeles", hometown: "Oak Park" },
    simulation: { occupation: "Actress", education: "Oak Park High School", location: "Los Angeles", organizations: ["Hollywood Studios"], clues: ["Emmy winner", "Spider-Man co-star"], exposureLevel: "high" },
    post: "So grateful for this incredible journey and the amazing people I get to work with every day.",
  },
  {
    first_name: "Margot",
    last_name: "Robbie",
    bYear: 1990, bMonth: 7, bDay: 2,
    username: "margot_robbie",
    gender: "female",
    details: { bio: "Producer and actress known for iconic roles.", job: "Actress/Producer", workplace: "LuckyChap Entertainment", college: "Somerville House", currentCity: "Los Angeles", hometown: "Gold Coast" },
    simulation: { occupation: "Actress/Producer", education: "Somerville House", location: "Los Angeles", organizations: ["LuckyChap Entertainment"], clues: ["Barbie producer", "Wolf of Wall Street"], exposureLevel: "high" },
    post: "Excited about what we're building at LuckyChap — storytelling that pushes boundaries.",
  },
  {
    first_name: "Ana",
    last_name: "de Armas",
    bYear: 1988, bMonth: 4, bDay: 30,
    username: "ana_de_armas",
    gender: "female",
    details: { bio: "Cuban-Spanish actress breaking barriers in Hollywood.", job: "Actress", workplace: "Film Studios", college: "National Theater School", currentCity: "Madrid", hometown: "Cuba" },
    simulation: { occupation: "Actress", education: "National Theater School", location: "Madrid", organizations: ["Film Studios"], clues: ["Blonde", "Knives Out"], exposureLevel: "medium" },
    post: "Playing Marilyn Monroe was one of the most challenging and rewarding experiences of my career.",
  },
  {
    first_name: "Jenna",
    last_name: "Ortega",
    bYear: 2002, bMonth: 9, bDay: 27,
    username: "jenna_ortega",
    gender: "female",
    details: { bio: "Rising star of horror and comedy.", job: "Actress", workplace: "Netflix Studios", college: "Home School", currentCity: "Los Angeles", hometown: "Palm Springs" },
    simulation: { occupation: "Actress", education: "Home School", location: "Los Angeles", organizations: ["Netflix Studios"], clues: ["Wednesday", "Scream"], exposureLevel: "high" },
    post: "Wednesday has changed my life — the response has been absolutely wild.",
  },
  {
    first_name: "Florence",
    last_name: "Pugh",
    bYear: 1996, bMonth: 1, bDay: 3,
    username: "florence_pugh",
    gender: "female",
    details: { bio: "Critically acclaimed actress known for bold roles.", job: "Actress", workplace: "Film Studios", college: "Oxford School of Drama", currentCity: "London", hometown: "Oxford" },
    simulation: { occupation: "Actress", education: "Oxford School of Drama", location: "London", organizations: ["Film Studios"], clues: ["Little Women", "Black Widow", "Dune"], exposureLevel: "high" },
    post: "Every role teaches me something new — I'm constantly growing as an actor.",
  },
  {
    first_name: "Sydney",
    last_name: "Sweeney",
    bYear: 1997, bMonth: 9, bDay: 12,
    username: "sydney_sweeney",
    gender: "female",
    details: { bio: "Actress and producer rising to fame through TV.", job: "Actress/Producer", workplace: "Hollywood Studios", college: "Home School", currentCity: "Los Angeles", hometown: "Spokane" },
    simulation: { occupation: "Actress/Producer", education: "Home School", location: "Los Angeles", organizations: ["Hollywood Studios"], clues: ["Euphoria", "The White Lotus"], exposureLevel: "high" },
    post: "Euphoria has been the most transformative experience — I've learned so much.",
  },
  {
    first_name: "Scarlett",
    last_name: "Johansson",
    bYear: 1984, bMonth: 11, bDay: 22,
    username: "scarlett_johansson",
    gender: "female",
    details: { bio: "One of the highest-paid actresses in the world.", job: "Actress", workplace: "Marvel Studios", college: "Professional Children's School", currentCity: "New York", hometown: "Manhattan" },
    simulation: { occupation: "Actress", education: "Professional Children's School", location: "New York", organizations: ["Marvel Studios"], clues: ["Black Widow", "Lost in Translation", "Lucy"], exposureLevel: "high" },
    post: "Playing Black Widow was an incredible journey — I'm proud of what we built.",
  },
  {
    first_name: "Megan",
    last_name: "Fox",
    bYear: 1986, bMonth: 5, bDay: 16,
    username: "megan_fox",
    gender: "female",
    details: { bio: "Actress and model known for action roles.", job: "Actress/Model", workplace: "Film Studios", college: "Home School", currentCity: "Los Angeles", hometown: "Tennessee" },
    simulation: { occupation: "Actress/Model", education: "Home School", location: "Los Angeles", organizations: ["Film Studios"], clues: ["Transformers", "Jennifer's Body"], exposureLevel: "medium" },
    post: "Still learning and growing — every project brings something new.",
  },
];

// Every fictional user reuses an image that is actually committed under
// frontend/public. The previous seed pointed at /images/<username>.jpg and
// /images/<username>_cover.jpg, which do not exist, so every avatar and cover
// was a 404.
const PROFILE_PICTURES = [
  "/stories/profile1.jpg",
  "/stories/profile2.jpg",
  "/stories/profile3.png",
  "/stories/profile4.jfif",
  "/stories/profile5.png",
  "/images/default_pic.png",
];
const COVERS = Array.from(
  { length: 10 },
  (_, i) => `/images/postBackgrounds/${i + 1}.jpg`
);

// A few accounts are locked, and a mix of public and friends-only posts exists
// so the privacy rules are observable without changing any data by hand.
const LOCKED_PROFILES = new Set(["jp_enrile", "sarah_duterre", "florence_pugh"]);
const FRIENDS_ONLY_POSTS = new Set([
  "marty_romualdo",
  "zed_co",
  "jp_enrile",
  "bingo_revilla",
  "sarah_duterre",
  "florence_pugh",
]);


async function seed() {
  await mongoose.connect(process.env.DATABASE_URL);
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.find({ username: { $in: profiles.map((profile) => profile.username) } }).select("_id username");
  const existingIds = existing.map((user) => user._id);
  await Post.deleteMany({ user: { $in: existingIds } });
  await User.deleteMany({ _id: { $in: existingIds } });

  const users = await User.insertMany(profiles.map(({ post, ...profile }, index) => ({
    ...profile,
    email: `${profile.username}@rivantech.com`,
    password: passwordHash,
    verified: true,
    picture: PROFILE_PICTURES[index % PROFILE_PICTURES.length],
    cover: COVERS[index % COVERS.length],
    profileLocked: LOCKED_PROFILES.has(profile.username),
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
    ["jing_estrada", "marty_romualdo"], ["zed_co", "marty_romualdo"], ["waldo_bayola", "zed_co"],
    ["bingo_revilla", "waldo_bayola"], ["robby_padilla", "bingo_revilla"], ["bitag_tulfo", "robby_padilla"],
    ["sarah_duterre", "bitag_tulfo"], ["manuel_pacquiao", "sarah_duterre"], ["jp_enrile", "manuel_pacquiao"],
    ["jing_estrada", "jp_enrile"], ["marty_romualdo", "jing_estrada"],
    // Connect celebrity users to the classroom network
    ["marty_romualdo", "zendaya"], ["zed_co", "margot_robbie"], ["waldo_bayola", "ana_de_armas"],
    ["bingo_revilla", "jenna_ortega"], ["robby_padilla", "florence_pugh"], ["bitag_tulfo", "sydney_sweeney"],
    ["sarah_duterre", "scarlett_johansson"], ["manuel_pacquiao", "megan_fox"],
    // Chain celebrities together
    ["zendaya", "margot_robbie"], ["margot_robbie", "ana_de_armas"],
    ["ana_de_armas", "jenna_ortega"], ["jenna_ortega", "florence_pugh"],
    ["florence_pugh", "sydney_sweeney"], ["sydney_sweeney", "scarlett_johansson"],
    ["scarlett_johansson", "megan_fox"],
  ];
  // Guard against a typo in `links` silently dropping a friendship edge.
  for (const [left, right] of links) {
    if (!byUsername[left] || !byUsername[right]) {
      throw new Error(
        `Seed link references unknown user: ${!byUsername[left] ? left : right}`
      );
    }
  }
  for (const [left, right] of links) {
    await User.updateOne({ _id: byUsername[left]._id }, { $addToSet: { friends: byUsername[right]._id } });
    await User.updateOne({ _id: byUsername[right]._id }, { $addToSet: { friends: byUsername[left]._id } });
  }

  // Some users get a second, friends-only post so the privacy rules have
  // something to hide before a request is accepted.
  const posts = profiles.map(({ post, username }) => ({
    text: post,
    user: byUsername[username]._id,
    type: null,
    images: [],
    privacy: FRIENDS_ONLY_POSTS.has(username) ? "friends" : "public",
    comments: [],
  }));
  const extraPosts = [...FRIENDS_ONLY_POSTS]
    .filter((username) => byUsername[username])
    .map((username) => ({
      text: "Friends-only note: this classroom update is only visible to accepted friends.",
      user: byUsername[username]._id,
      type: null,
      images: [],
      privacy: "friends",
      comments: [],
    }));
  await Post.insertMany([...posts, ...extraPosts]);
  console.log(`Seeded ${users.length} fictional classroom users.`);
  console.log(`Shared password for the seeded accounts: ${password}`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
