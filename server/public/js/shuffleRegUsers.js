const exampleUsers = [
  {
    username: "lera",
    email: "lera@lera",
    password: "lera",
  },
  {
    username: "pedantic25",
    email: "pedantic25@gmail.com",
    password: "pedantic",
  },
  {
    username: "nomansland",
    email: "nomansland@gmail.com",
    password: "nomansland",
  },
  {
    username: "Deecaricature",
    email: "deecaricature@tetris.com",
    password: "demon",
  },
  {
    username: "DestinysChild2000",
    email: "destinyschild2000@grant.com",
    password: "destiny",
  },
];

let num = genRandUserNum();
changeUserIcon();

loginAndContinue("#reg-user-choose", "#anon-user-choose");
logoutAndContinue("#anon-user-choose", "#reg-user-choose");

/* ~~~ ANONYMOUS ~~~ */
async function logoutAndContinue(logout, login) {
  $(logout).on("click", async function () {
    if ($(logout).attr("aria-expanded") === "true") {
      if ($(login).attr("aria-expanded") === "true")
        document.getElementById("reg-user-choose").click();
      $("#anon-check")
        .fadeIn(200)
        .removeClass("fa-square")
        .addClass("fa-check-square");
      await logoutUser();
    } else {
      $("#anon-check")
        .fadeIn(200)
        .removeClass("fa-check-square")
        .addClass("fa-square");
    }
  });
}

/* ~~~ REGISTERED ~~~ */
async function loginAndContinue(login, logout) {
  $(login).on("click", async function () {
    if ($(login).attr("aria-expanded") === "true") {
      if ($(logout).attr("aria-expanded") === "true")
        document.getElementById("anon-user-choose").click();
      $("#reg-check")
        .fadeIn(200)
        .removeClass("fa-square")
        .addClass("fa-check-square");
      await loginUser();
      $("#reg-user-continue").attr(
        "href",
        "/" + exampleUsers[num].username.toLowerCase()
      );
    } else {
      $("#reg-check")
        .fadeIn(200)
        .removeClass("fa-check-square")
        .addClass("fa-square");
    }
  });
}

function genRandUserNum() {
  let max = exampleUsers.length;
  let result = Math.floor(Math.random() * max);
  return result;
}

function changeUserIcon() {
  $("#random-user-icon").prop("src", "img/random_users/" + num + ".jpg");
}

async function loginUser() {
  const email = exampleUsers[num].email;
  const password = exampleUsers[num].password;

  const userData = {
    email,
    password,
  };

  try {
    fetch(API_URL + "login", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
    }).then(async (response) => {
      // status OK
      if (response.status === 200) {
        console.log("Login successful.");
      } else console.log("Login not successful.");
    });
  } catch (error) {
    console.log(error);
  }
}

async function logoutUser() {
  try {
    const fetched = await fetch(API_URL + "logout");
    if (fetched.status === 200) console.log("Logout successful.");
  } catch (error) {
    console.log(error);
  }
}
