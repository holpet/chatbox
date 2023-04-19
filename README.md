# Chatbox (messaging app) using Node.js

This is a cat themed messaging app inspired by the twitter UI.

### Demo: [https://chatbox-app.onrender.com/](https://chatbox-app.onrender.com/)

Available demo users are: 1. a (logged in) **registered user** and 2. an **anonymous user**. No need to actually register to see full functionality.

#### A/N: Due to server limitations, it may take up to 1 min to load the site initially. Thank you for your patience.

#### Functionality & Properties:

- Fully responsive (mobile <-> desktop)
- Server-side responses in **Node.js** rendered to client using **EJS template views**
- Authentication with **passport-local**; password hashing with **bcrypt**
- All data persisted in a **MongoDB** database
- Option to upload images together with messages with **multer**
- Option of editing user profile - icon, background, description etc., follow/unfollow other users
- Search functionality and filtering

### Visual:

![demo1](/public/img/demo/demo1.jpg)
![demo2](/public/img/demo/demo2.jpg)

## How to install & run

To run in a **development** mode:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
```

Open [http://localhost:5050](http://localhost:5050) with your browser to see the result.
