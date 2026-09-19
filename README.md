# Facebook-and-OSINT-Lab

## Cybersecurity Classroom Simulation

This repository contains a Facebook-style social application for an authorized cybersecurity classroom laboratory. The application is a fictional training environment. All seeded people, usernames, organizations, projects, locations, posts, and relationships are intended to be fictional.

> **CYBERSECURITY CLASSROOM SIMULATION - ALL PEOPLE, POSTS, COMPANIES, PROJECTS, AND EVENTS ARE FICTIONAL.**

This project is not connected to Facebook, Meta, government systems, real companies, or real people's accounts.

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
frontend/
  src/components/     Header, search, posts, login, profile UI
  src/pages/          Login, home, profile, reset pages
  src/functions/      Frontend API helpers
  src/routes/         Authenticated and unauthenticated route guards
package.json          Starts frontend and backend together
```

## Requirements

- Node.js and npm
- MongoDB connection available to the backend
- Optional Cloudinary credentials for image uploads
- Optional email credentials for verification/reset email delivery

## Installation

Clone the repository and enter the project root:

```powershell
git clone https://github.com/Tsuyoiman/Facebook-and-Osint-Lab.git
cd Facebook-and-Osint-Lab
```

Create private environment files from the published templates:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env`. At minimum, configure:

```env
PORT=8000
DATABASE_URL=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/facebook?retryWrites=true&w=majority
TOKEN_SECRET=replace-with-a-private-random-secret
BASE_URL=http://localhost:3000
```

Keep real credentials out of GitHub. Do not commit `.env` files.

Install dependencies:

```powershell
npm install
cd backend
npm install
cd ..
cd frontend
npm install
cd ..
```

## Seed the Fictional Dataset

The seed script creates ten fictional classroom users, fictional public posts, simulation metadata, and interconnected friend relationships:

```powershell
cd backend
npm run seed:simulation
cd ..
```

The seeded classroom accounts use the shared demonstration password `ClassroomLab123!`. Students should create separate accounts for normal testing rather than reuse credentials outside the lab.

## Run the Application

From the project root, start both services in one terminal:

```powershell
npm start
```

The root command starts:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

Stop both development servers with `Ctrl+C`.

Individual services can also be started separately:

```powershell
cd backend
npm run server
```

```powershell
cd frontend
npm start
```

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

For a same-LAN test, configure the frontend to use the server's LAN address:

```env
REACT_APP_BACKEND_URL=http://SERVER_LAN_IP:8000
```

Start the frontend so it listens on the LAN interface:

```powershell
$env:HOST="0.0.0.0"
npm start
```

Students can then open:

```text
http://SERVER_LAN_IP:3000
```

The physical classroom network, firewall rules, final server IP, and multi-PC test results are **not confirmed from the current source code**.

## Future Kali Linux Laboratory

The future Kali component is a separate, instructor-authorized network reconnaissance activity. It must target only the configured classroom server.

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

The Kali laboratory is planned and has not been implemented or tested in this repository. No target IP, scan result, service inventory, or network claim is made here.

The lab must not include password attacks, credential theft, account takeover, private-data access, exploitation, or scanning systems outside the authorized classroom environment.

## Development Stages

### Stage 1 - Web application

Mostly implemented: registration, login, profiles, search, editing, posts, relationships, and image features.

### Stage 2 - Fictional OSINT data

Partially implemented: ten fictional accounts, posts, organizations, projects, locations, exposure levels, and relationships.

### Stage 3 - OSINT laboratory

Partially implemented: search and public-profile investigation workflow. Planned: target selection, relationship graphs, evidence collection, and student report tooling.

### Stage 4 - Classroom network

Planned: server, switch, authorized LAN configuration, firewall rules, and multi-PC validation.

### Stage 5 - Kali Linux reconnaissance

Planned: Kali setup, connectivity testing, approved port discovery, service identification, and evidence collection.

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
