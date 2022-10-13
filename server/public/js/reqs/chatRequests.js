async function getChatsBy(filter, search) {
  try {
    if (isEmpty(search)) {
      if (filter === "") {
        // get all db chats
        return await fetch(API_URL + "chats", { credentials: "include" }).then(
          (res) => res.json()
        );
      } else {
        // get db chats filtered by user ID
        return await fetch(API_URL + "chats/" + filter, {
          credentials: "include",
        }).then((res) => res.json());
      }
    } else {
      return await fetch(API_URL + "search/" + search, {
        credentials: "include",
      }).then((res) => res.json());
    }
  } catch (error) {
    console.log(error);
  }
  return {};
}

async function getProfilesBy(filter) {
  try {
    if (filter === "") {
      // get all db profiles
      return await fetch(API_URL + "profiles", { credentials: "include" }).then(
        (res) => res.json()
      );
    } else {
      // get one db profile based on user ID
      return await fetch(API_URL + "profiles/" + filter, {
        credentials: "include",
      }).then((res) => res.json());
    }
  } catch (error) {
    console.log(error);
  }
  return {};
}

async function getAuthData() {
  try {
    return await fetch(API_URL + "get-auth-data").then((res) => res.json());
  } catch (error) {
    console.log(error);
  }
}

async function deleteChat(elem) {
  const chatID = elem.getAttribute("data-id");
  try {
    await fetch(API_URL + "chats/delete/" + chatID, {
      method: "DELETE",
    }).then((res) => res.json());
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
}
