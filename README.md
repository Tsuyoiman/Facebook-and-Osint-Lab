# Facebook-and-OSINT-Lab

## Cybersecurity Classroom Simulation

This repository contains a Facebook-style social application for an authorized cybersecurity classroom laboratory. The application is a fictional training environment. All seeded people, usernames, organizations, projects, locations, posts, and relationships are intended to be fictional.

> **CYBERSECURITY CLASSROOM SIMULATION - ALL PEOPLE, POSTS, COMPANIES, PROJECTS, AND EVENTS ARE FICTIONAL.**

This project is not connected to Facebook, Meta, government systems, real companies, or real people's accounts.

## Versioned Development History

The project is documented as a sequence of development milestones. A version
means the corresponding feature set was implemented in the repository; it
does not mean that the future classroom network or Kali laboratory has been
completed.

### v1.0 - Social application foundation

Implemented the Facebook-style application foundation:

- Registration and login
- Password hashing and JWT authentication
- Home feed, posts, comments, and profile pages
- Profile editing and image upload flows
- Friends, followers, and following data structures
- MongoDB persistence and Express routes

### v1.1 - Fictional OSINT environment

Added the controlled classroom simulation:

- Ten fictional seeded accounts
- Fictional public posts and profile metadata
- Fictional organizations, projects, locations, and clue references
- Interconnected public friend relationships
- Public-safe search and profile API endpoints
- Visible classroom simulation labeling

### v1.2 - Local operations and safety

Improved project operation and publication safety:

- One-command root startup with `npm run dev`
- Separate frontend and backend environment configuration
- Ignored local secrets and generated dependencies
- MongoDB seed command for the shared classroom dataset
- Documentation for local and future LAN operation
- Profile-picture upload error handling improvements

### v1.3 - Relationship notifications

Added Facebook-style relationship feedback:

- Friend-request notifications
- Follow notifications
- Friend-request acceptance notifications
- Live unread notification badge
- Notification panel with read-on-open behavior
- Confirm and Delete actions for incoming friend requests
- Notification removal after a successful response
- Authenticated notification API and MongoDB notification collection

### Planned v2.0 - OSINT laboratory workflow

Planned, not yet implemented:

- Instructor target-selection workflow
- Relationship and clue graph view
- Evidence collection interface
- Fact, inference, and unverified-information labels
- Student OSINT report template or submission workflow

### Planned v3.0 - Classroom network laboratory

Planned, not yet implemented or tested:

- Instructor-controlled lab server configuration
- LAN and firewall validation
- Multi-PC shared application testing
- Authorized Kali connectivity testing
- Approved port and service inventory
- Combined OSINT and network reconnaissance report

## Purpose

The lab demonstrates how separate pieces of public information can become more informative when collected and correlated. Students practice:

- Web application concepts
- Authentication and user accounts
- Public information exposure
- Search and profile discovery
- OSINT reconnaissance
- Information correlation and relationship mapping
- Basic networking concepts
- Evidence collection and cybersecurity reporting

The exercise is reconnaissance, not account exploitation. Students must use only fictional data and instructor-authorized lab systems.

## System Architecture

```text
Browser
  |
  v
React frontend
  |
  v
Node.js / Express API
  |
  +--> MongoDB
  +--> Cloudinary image storage (optional configuration)
  +--> Email provider (optional verification/reset configuration)
```

The frontend never connects directly to MongoDB. The backend owns database access, authentication, profile queries, uploads, and public-data filtering.

## Repository Structure

```text
backend/
  controllers/       Express request handlers
  helpers/            Validation, tokens, email helpers
  middlewares/        Authentication and uploads
  models/             User, Post, and reset-code schemas
  routes/             API routes
  seed/               Fictional classroom dataset
  server.js           Express/MongoDB entry point
  start.js            Boots MongoDB, seeds, then starts the API
frontend/
  src/components/     Header, search, posts, login, profile UI
  src/pages/          Login, home, profile, reset pages
  src/functions/      Frontend API helpers
  src/routes/         Authenticated and unauthenticated route guards
scripts/
  setup.js            Installs all workspaces and creates .env files
  start.js            Starts backend and frontend with live port detection
package.json          Root scripts for install and start
```

## Requirements

- Node.js and npm
- No separate MongoDB installation required (a persistent local database
  starts automatically)
- Optional Cloudinary credentials for image uploads
- Optional email credentials for verification/reset email delivery

## Installation

Clone the repository and enter the project root:

```powershell
git clone https://github.com/Tsuyoiman/Facebook-and-Osint-Lab.git
cd Facebook-and-Osint-Lab
```

Install the root, backend, and frontend dependencies from the repository root:

```powershell
npm install
```

The root project uses npm workspaces, so one `npm install` installs every
package. Add your local environment files manually when needed:

- `backend/.env` for database, authentication, email, and Cloudinary settings
- `frontend/.env` for optional frontend overrides

The development launcher also accepts the root files `envBackend.env` and
`envFrontend.env`, which are useful when keeping frontend and backend settings
separate. Keep these files local and never commit them.

The committed `.env.example` files document the available settings. Never
commit real credentials.

No separate MongoDB installation is required for local classroom use. When
`DATABASE_URL` is empty, the backend starts a local MongoDB process with its
database files stored in the ignored project directory
`.data/mongodb/`. Student registrations therefore survive stopping and
restarting the server.

If a configured `DATABASE_URL` cannot be reached, startup now stops with an
explicit error instead of silently switching to a disposable database. This
prevents students from registering accounts into a temporary database that
would disappear when the server closes.

If startup prints `Using MongoDB from DATABASE_URL` and then reports
`querySrv ECONNREFUSED`, the local environment file still contains an
unreachable remote MongoDB address. For a self-contained laptop classroom
deployment, set `DATABASE_URL=` in `backend/.env` and keep a local
`TOKEN_SECRET` in that same file. Restart `npm run dev`; it should then print
`Persistent local MongoDB started at:` and store data under `.data/mongodb/`.

### Environment configuration

`backend/.env`:

```env
PORT=8000
DATABASE_URL=
TOKEN_SECRET=generated-for-you
BASE_URL=http://localhost:3000
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

`frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
PORT=3000
```

Keep real credentials out of GitHub. `.env` files are gitignored; only the
`.env.example` templates are committed.

To use a real MongoDB instead of the persistent local classroom database, set
`DATABASE_URL=mongodb+srv://USER:PASSWORD@HOST/facebook` in `backend/.env`.
The `CLOUD_*` values are only needed for image uploads.

## Seed the Fictional Dataset

Seeding runs automatically on every `npm run dev`. To reseed manually with your
own `DATABASE_URL`:

```powershell
cd backend
npm run seed:simulation
cd ..
```

The seeded classroom accounts share the password `C1sc0123`. Students should
create separate accounts for normal testing rather than reuse credentials
outside the lab.

## Run the Application

From the project root, start both services in one terminal:

```powershell
npm run dev
```

The root command starts:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

The startup banner prints every address the app is reachable on, for example:

```text
  on this machine:  http://localhost:3000
  on WIFI:  http://192.168.1.3:3000
  api:              http://192.168.1.3:8000
  seeded login:     any seeded username, password C1sc0123
```

If port 3000 or 8000 is already taken, the launcher automatically moves to the
next free port and prints the URLs it actually used. Override the defaults with
`FRONTEND_PORT` and `BACKEND_PORT` if needed.

Stop both development servers with `Ctrl+C`.

Individual services can also be started separately:

```powershell
npm run backend
```

```powershell
npm run frontend
```

## Accessing from Other Devices on the Same Wi-Fi

The launcher binds the frontend to `0.0.0.0` and points the frontend at your
LAN address, so other devices on the same network can open the app directly
using the `on <ADAPTER>` URL from the banner.

If the machine has several adapters, `scripts/start.js` ignores virtual ones
(VMware, VirtualBox, Hyper-V) and uses the first real private IPv4 address. Set
`BACKEND_URL_OVERRIDE` to pin a specific address:

```powershell
$env:BACKEND_URL_OVERRIDE = "http://192.168.1.3:8000"
npm run dev
```

If a device cannot connect at all, Windows Defender is usually blocking inbound
Node traffic. Allow Node.js on private networks, and keep in mind that a guest
Wi-Fi network may isolate clients from each other by design.

## Quick Start (full workflow)

```powershell
git clone https://github.com/Tsuyoiman/Facebook-and-Osint-Lab.git
cd Facebook-and-Osint-Lab
npm run install:all
npm run dev
```

Then open the printed frontend URL and log in with any seeded username using
the password `C1sc0123`.

## Implemented Website Features

The current source code confirms these features:

- Registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected frontend routes
- Home feed and posts
- Comments and reactions UI
- User profiles
- Profile editing and bio
- Profile and cover pictures
- Image cropping and Cloudinary upload integration
- Friends, followers, and following relationships
- Friend-request and follow notifications
- Confirm/Delete actions for incoming friend requests
- Live unread notification badge and read-on-open notification panel
- Password reset flow
- Fictional classroom simulation banner
- Search by first name, last name, or username
- Public profile results and public profile pages
- Public posts and public connections
- Public simulation organizations and clue references
- One-command frontend/backend startup

## Public API

The backend exposes public-safe endpoints for the classroom search workflow:

```text
GET /searchUsers?q=QUERY
GET /publicProfile/:username
```

Public responses intentionally exclude passwords, password hashes, authentication tokens, private messages, and private database fields.

Authentication, post, upload, profile, relationship, and reset routes remain available through the existing backend route modules.

Authenticated notification routes are:

```text
GET    /notifications
PUT    /notifications/read
DELETE /notifications/:id
```

Friend requests create a `friend_request` notification for the recipient.
Following creates a `follow` notification. Confirming a request creates a
`friend_accepted` notification for the original sender. Opening the panel
marks notifications read. Confirming or deleting a friend request removes
that request notification after the action succeeds.

## Relationships and Privacy

All relationship and visibility rules live in one place,
`backend/helpers/relationships.js`. Controllers call it, and components never
re-derive the rules themselves:

```text
isFriend(a, b)                 friendship only when BOTH sides accepted
hasPendingRequest(from, to)    an unanswered outgoing request
getFriendshipState(viewer, target)   full button state for a profile
canViewPost(viewer, author, privacy)  post visibility
canViewProfileContent(...)     locked-profile content visibility
sendFriendRequest / acceptFriendRequest / declineFriendRequest
cancelFriendRequest / removeFriend
```

Rules enforced:

- A request cannot be sent to yourself, duplicated, or sent when already friends.
- Friendship is written to both users' `friends` arrays on accept.
- A sent-but-unaccepted request is **not** friendship and grants no access.
- A post has `privacy: "public" | "friends"`. The author always sees their own
  post; a `friends` post is visible only to accepted friends.
- A locked profile shows non-friends the name, picture, and header, but hides
  posts and the friend list until they are accepted as a friend.

Authenticated routes for these rules:

```text
GET /suggestUsers          users the viewer is not friends with
GET /getFriendship/:id     authoritative relationship state for one user
PUT /addFriend/:id         PUT /cancelRequest/:id
PUT /acceptRequest/:id     PUT /deleteRequest/:id
PUT /unfriend/:id          PUT /toggleProfileLock
```

## OSINT Reconnaissance Laboratory

The intended student workflow is:

```text
Select fictional target
        |
        v
Search profile
        |
        v
Collect public information
        |
        v
Identify clues
        |
        v
Correlate profiles, organizations, and projects
        |
        v
Map relationships
        |
        v
Document findings and limitations
```

Students may examine only fictional public information such as:

- Names and usernames
- Bios, occupations, and education
- Fictional workplaces and organizations
- Fictional projects and locations
- Public posts, comments, and connections
- Dates and technology references

Students should distinguish between:

- **Fact:** directly visible in the lab
- **Inference:** a reasoned relationship between facts
- **Unverified information:** a lead that requires confirmation

The current repository provides search, public profiles, public posts, connections, and fictional clue metadata. A formal evidence-management or student-report interface is not implemented.

## Fictional Seed Accounts

The seed data uses fictional classroom identities with different information exposure levels. Their public clues overlap through schools, organizations, projects, locations, and posts so students can practice correlation.

Run the seed command whenever a clean shared classroom database is needed:

```powershell
cd backend
npm run seed:simulation
```

The script is repeatable for the ten simulation usernames. It should only be run against the intended classroom database because it replaces the seeded simulation records and posts.

## Classroom Network Deployment

The application can later be hosted on one classroom server:

```text
Student PCs --> server frontend --> server backend --> MongoDB
```

MongoDB should remain reachable only by the backend server. Student PCs and Kali should not connect directly to MongoDB.

Run the root launcher so it binds the frontend and backend to the LAN
interface, discovers the laptop's usable LAN address, and prints the exact
URLs:

```powershell
npm install
npm run dev
```

Students can then open the printed frontend URL:

```text
http://SERVER_LAN_IP:3000
```

The OSINTPROJECT repository is the companion Kali investigation client. Kali
uses the printed API URL, normally port `8000`, while Firefox uses the
frontend URL, normally port `3000`:

```text
Firefox:    http://SERVER_LAN_IP:3000
OSINT API:  http://SERVER_LAN_IP:8000
```

Allow TCP ports `3000` and `8000` through the Windows firewall on the private
classroom network. Student PCs and Kali must be on a network that permits
device-to-device traffic.

## Kali Linux OSINT Laboratory

The Kali component is an instructor-authorized public-information workflow.
It must target only this fictional classroom server.

Planned workflow:

```text
Identify authorized lab server
        |
        v
Verify connectivity
        |
        v
Discover approved ports
        |
        v
Identify services
        |
        v
Record evidence and limitations
```

Example activities, after the network is configured and authorization is documented:

```bash
ip addr
ping AUTHORIZED_TARGET_IP
nmap -v AUTHORIZED_TARGET_IP
```

The lab must not include password attacks, credential theft, account takeover, private-data access, exploitation, or scanning systems outside the authorized classroom environment.

## Development Stages

### Stage 1 - Web application

Mostly implemented: registration, login, profiles, search, editing, posts, relationships, and image features.

### Stage 2 - Fictional OSINT data

Partially implemented: ten fictional accounts, posts, organizations, projects, locations, exposure levels, and relationships.

### Stage 3 - OSINT laboratory

Implemented in the companion OSINTPROJECT repository: public search,
profile investigation, friend/organization correlation, image analysis,
authorized Nmap reconnaissance, evidence collection, and report generation.

### Stage 4 - Classroom network

Planned: server, switch, authorized LAN configuration, firewall rules, and multi-PC validation.

### Stage 5 - Kali Linux reconnaissance

Implemented in the companion OSINTPROJECT repository with an authorized
network-range guard, connectivity testing, approved service discovery, and
evidence collection.

### Stage 6 - Combined final laboratory

Planned: combine the OSINT report with the separately documented network reconnaissance findings.

## Testing Status

Confirmed during development:

- Frontend production build succeeds with existing lint warnings.
- Backend JavaScript syntax checks pass for modified upload/API/seed files.
- Fictional seed command completes against the configured MongoDB.
- Search returns public fictional profiles.
- Public profiles return posts and connections.
- Public responses do not include password fields.
- Frontend and backend run locally on ports `3000` and `8000`.
- Friend-request, follow, and acceptance notifications work through the API.
- Opening notifications clears the unread count.
- Friend-request notification deletion works through the API.

Still requires future classroom testing:

- Registration and login from a fresh installation
- Cloudinary uploads with fresh credentials
- Email verification with fresh email credentials
- All ten seeded profiles through the UI
- Same-database behavior across multiple PCs
- Firewall and LAN access
- Kali connectivity and approved reconnaissance
- Final student report workflow

## Ethical Boundaries

This project is for an authorized private classroom simulation. Students must not investigate real classmates, politicians, companies, government systems, or unrelated internet hosts. They must not steal credentials, access private messages, bypass authentication, take over accounts, access MongoDB directly, or scan systems outside the instructor-approved lab scope.

## Planned Documentation

Future documentation may be split into:

- `PROJECT_OVERVIEW.md`
- `SYSTEM_ARCHITECTURE.md`
- `DATABASE.md`
- `FEATURES.md`
- `AUTHENTICATION.md`
- `OSINT_LAB.md`
- `OSINT_WORKFLOW.md`
- `KALI_LAB.md`
- `TESTING.md`
- `SECURITY.md`
- `STUDENT_REPORT_TEMPLATE.md`

Those documents should be added only as the corresponding features and tests are actually completed.
