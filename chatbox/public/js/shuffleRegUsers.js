getRandomUser();

async function getRandomUser() {
  const user = await fetch(API_URL + "get-random-user").then((res) =>
    res.json()
  );
  changeUserIcon(user);
  loginAndContinue("#reg-user-choose", "#anon-user-choose", user);
  logoutAndContinue("#anon-user-choose", "#reg-user-choose", user);
}

function changeUserIcon(randomUser) {
  console.log(randomUser.id);
  $("#random-user-icon").prop(
    "src",
    "img/random_users/" + randomUser.id + ".jpg"
  );
}

/* ~~~ ANONYMOUS ~~~ */
async function logoutAndContinue(logout, login, user) {
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
async function loginAndContinue(login, logout, user) {
  $(login).on("click", async function () {
    if ($(login).attr("aria-expanded") === "true") {
      if ($(logout).attr("aria-expanded") === "true")
        document.getElementById("anon-user-choose").click();
      $("#reg-check")
        .fadeIn(200)
        .removeClass("fa-square")
        .addClass("fa-check-square");
      await loginUser(user);
      $("#reg-user-continue").attr("href", "/" + user.username.toLowerCase());
    } else {
      $("#reg-check")
        .fadeIn(200)
        .removeClass("fa-check-square")
        .addClass("fa-square");
    }
  });
}

/* LOGIN */
async function loginUser(user) {
  const email = user.email;
  const password = user.password;

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

/* LOGOUT */
async function logoutUser() {
  try {
    const fetched = await fetch(API_URL + "logout");
    if (fetched.status === 200) console.log("Logout successful.");
  } catch (error) {
    console.log(error);
  }
}
