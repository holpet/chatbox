manageLoginForm();

function manageLoginForm() {
  const logForm = document.querySelector("#loginForm");

  logForm.addEventListener("submit", (event) => {
    event.preventDefault();

    /* Reset validator form */
    $("#logEmailCheck").text("Missing email or username.");
    $("#logPasswordCheck").text("Missing password.");
    $("#logEmailInput").removeClass("is-invalid");
    $("#logPasswordInput").removeClass("is-invalid");

    const formData = new FormData(logForm);
    const email = formData.get("email");
    const password = formData.get("password");

    blurAndLoad(true);

    const userData = {
      email,
      password,
    };

    if (!logForm.checkValidity()) logForm.classList.add("was-validated");
    else logForm.classList.remove("was-validated");

    if (email === "" || password === "") {
      blurAndLoad(false);
      return;
    }

    // Check user data against a database
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
          console.log("Login complete.");
          $("#loginModal").modal("hide");
          logForm.reset();
          logForm.classList.remove("was-validated");
          window.location.reload();
        } else {
          $("#logEmailCheck").text("");
          $("#logPasswordCheck").text("Invalid email or password.");
          $("#logEmailInput").addClass("is-invalid");
          $("#logPasswordInput").addClass("is-invalid");
        }
        blurAndLoad(false);
      });
    } catch (error) {
      console.log(error);
    }
  });
}
