const exampleUsers = [
  {
    id: 0,
    username: "lera",
    email: "lera@lera",
    password: "lera",
  },
  {
    id: 1,
    username: "pedantic25",
    email: "pedantic25@gmail.com",
    password: "pedantic",
  },
  {
    id: 2,
    username: "nomansland",
    email: "nomansland@gmail.com",
    password: "nomansland",
  },
  {
    id: 3,
    username: "Deecaricature",
    email: "deecaricature@tetris.com",
    password: "demon",
  },
  {
    id: 4,
    username: "DestinysChild2000",
    email: "destinyschild2000@grant.com",
    password: "destiny",
  },
];

function genRandomUserNum() {
  let max = exampleUsers.length;
  let result = Math.floor(Math.random() * max);
  return result;
}

const getRandomUser = () => {
  return exampleUsers[genRandomUserNum()];
};

module.exports = getRandomUser;
