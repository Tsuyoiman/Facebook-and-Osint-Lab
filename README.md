# MERN Facebook Clone

## Classroom OSINT Lab

This repository includes a private classroom simulation. All seeded people,
organizations, projects, locations, posts, and events are fictional. Do not
connect this application to Facebook, Meta, government systems, or external
organization infrastructure.

### Local setup

1. Copy `backend/.env.example` to `backend/.env` and add a MongoDB connection.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Install and run the backend:

	```powershell
	cd backend
	npm install
	npm run seed:simulation
	npm run server
	```

4. In another terminal, run the frontend:

	```powershell
	cd frontend
	npm install
	npm start
	```

The seeded classroom accounts use the password `ClassroomLab123!`. Search is
available from the header and public profiles contain only fictional public
simulation data.

### Classroom LAN

Set `REACT_APP_BACKEND_URL` to the server PC's LAN address, start the backend
on the server PC, and run the frontend with `HOST=0.0.0.0`. Student PCs can
then open `http://SERVER_LAN_IP:3000`. MongoDB remains accessible only to the
backend server.

(Deprecated - unfortunately Adaptable.io which was hosting the site for free is shutting down.) 
Visit the site here: https://mellow-kataifi-24d734.netlify.app/

Once you've created an account. Start by looking up my profile and adding me as a friend!
![image](https://user-images.githubusercontent.com/49764019/211648334-d59bfd5f-2c27-42ca-b145-0ad7d7e2caec.png)

# Features

This Facebook clone comes complete with:
* Scalable backend built using Node.js and Express js
* Two Factor Authentication
* Dark mode
* Fully responsive pages built out for Home, profile, and friends that work on both web and mobile
* Friend system
* Image upload and cropping features
* Reactions and emojis
* Live search for other users
* Authentication system
* Form validation using Yup and Formik
* Protected routes
* Skeleton loader effect


# Page Screenshots

## Login
![image](https://user-images.githubusercontent.com/49764019/212972982-70d5e222-7c40-496d-9c82-48ad0344f8c3.png)
![image](https://user-images.githubusercontent.com/49764019/212973145-6ccea72a-6653-404d-ae2c-4a1a19d2b6fe.png)


## Home Page
![image](https://user-images.githubusercontent.com/49764019/211646638-090dbe6f-a033-4f24-a343-67c8bb8eca32.png)
![image](https://user-images.githubusercontent.com/49764019/211647434-c02b8ff5-03b4-4b7f-9031-90caa1414687.png)


## Profile Page (continued from above)
![image](https://user-images.githubusercontent.com/49764019/211646900-f25bb0ae-ba11-40f3-9707-d9d7e2996ee3.png)
![image](https://user-images.githubusercontent.com/49764019/211647562-bd2909d3-4a26-49b8-b64f-0867bb7cf4fc.png)


## Friends Page
![image](https://user-images.githubusercontent.com/49764019/211647049-8213327e-a5a2-4cd4-b9d5-ac686ce79a12.png)
![image](https://user-images.githubusercontent.com/49764019/211647622-aa068109-a29f-4e0d-80e1-c4ef9af7c3bf.png)


# Menus

## Main Menu
![image](https://user-images.githubusercontent.com/49764019/211647750-7114a7b1-dd27-4244-bcc6-abf081585452.png)

## Dropdown
![image](https://user-images.githubusercontent.com/49764019/211647854-9e572251-f8ee-40b9-8df3-31f09a87d4e7.png)
![image](https://user-images.githubusercontent.com/49764019/211647901-4e2c5e9d-8123-41bf-89d8-6a9b0ab8b657.png)



