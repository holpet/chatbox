/* GENERATE/LIST FILTERED CHATS */
/**
 * All helper functions to be found in: helpers.js
 */

async function listAllChats(filter = "", search = null) {
  blurAndLoad(true);
  const allChats = document.querySelector(".allChats");
  allChats.innerHTML = "";

  try {
    // get a registered user profile; if not registered, get all profiles
    const profiles = await getProfilesBy(filter);
    // get chats to display
    const chats = await getChatsBy(filter, search);

    // no search term
    if (search === null && chats.length === 0) {
      blurAndLoad(false);
      return;
    }
    // no search match found
    if (chats.length === 0) {
      const divCard = createNoSearchMatch(search);
      allChats.appendChild(divCard);
      blurAndLoad(false);
      return;
    }

    const authData = await getAuthData();

    // CREATE LISTING OF ALL FOUND CHATS
    const div = document.createElement("div");
    div.id = "chats-container";
    firstElem = true;
    chats.reverse();
    chats.forEach((chat) => {
      // create divs for sections
      const divCard = document.createElement("div");
      divCard.className = "card card-border border-top-0 action-highlight";
      if (firstElem) {
        divCard.classList.remove("border-top-0");
        firstElem = false;
      }
      const divRow = document.createElement("div");
      divRow.className = "row g-0 justify-content-left";
      const divCol1 = document.createElement("div");
      divCol1.className = "col mx-auto icon-sidebar";
      const divCol2 = document.createElement("div");
      divCol2.className = "col";
      const divCardBody = document.createElement("div");
      divCardBody.className = "card-body pr-3 pl-1";
      const divCardBodySpec = document.createElement("div");
      divCardBodySpec.className =
        "d-flex w-100 justify-content-between align-self-end";
      const divCardBodySpecOpt = document.createElement("div");
      divCardBodySpecOpt.className = "";

      // get a registered user profile (if there is any)
      const profile = getProfile(chat.userID, profiles);

      // create icon
      const icon = createHTML_icon(profile);
      divCol1.appendChild(icon);

      // create name & date
      const header = createHTML_names(chat, profile);
      const small = createHTML_date(chat);
      // create delete
      if (
        authData.auth &&
        authData.userID === (profile !== undefined ? profile.userID : null)
      ) {
        const del = document.createElement("i");
        del.className = "far fa-trash-alt me-2";
        del.setAttribute("data-id", chat._id);
        del.setAttribute("onclick", "deleteChat(this)");
        divCardBodySpecOpt.appendChild(del);
      }
      // add name & date & delete
      divCardBodySpec.appendChild(header);
      divCardBodySpecOpt.appendChild(small);
      divCardBodySpec.appendChild(divCardBodySpecOpt);
      divCardBody.appendChild(divCardBodySpec);

      // create links for profile
      if (!isEmpty(profile)) {
        const target = "window.open('/" + profile.username + "', '_self')";
        header.setAttribute("onclick", target);
        icon.setAttribute("onclick", target);
        header.classList.add("icon-link", "chat-link");
        icon.classList.add("icon-link");
      }

      // create message
      const content = createHTML_content(chat);
      divCardBody.appendChild(content);
      divCol2.appendChild(divCardBody);

      // add images
      if (chat.img.length > 0) {
        const divImg = createHTML_img(chat, profile);
        content.appendChild(divImg);
      }

      divRow.appendChild(divCol1);
      divRow.appendChild(divCol2);

      divCard.appendChild(divRow);
      div.appendChild(divCard);
    });
    allChats.appendChild(div);
    blurAndLoad(false);
  } catch (error) {
    console.log(error);
  }
}

function createNoSearchMatch(search) {
  const divCard = document.createElement("div");
  divCard.className = "card card-border";
  const divCardBody = document.createElement("div");
  divCardBody.className = "card-body p-3";
  const h4 = document.createElement("h4");
  h4.className = "card-title text-break text-center fw-bold";
  const p = document.createElement("p");
  p.className = "card-title text-break text-center";
  h4.textContent = ' No results for "' + search + '".';
  p.textContent = "Try searching for another.";

  divCardBody.appendChild(h4);
  divCardBody.appendChild(p);
  divCard.appendChild(divCardBody);
  return divCard;
}

function createHTML_img(chat, profile) {
  const divImg = document.createElement("div");
  divImg.className = "text-center pe-2";
  const divImgRow = document.createElement("div");
  divImgRow.className = "row p-3";
  let i = 0;
  while (i < chat.img.length) {
    const divImgCol = document.createElement("div");
    divImgCol.className = "col p-1";
    const img = document.createElement("img");
    const src = !isEmpty(profile)
      ? "uploads/" +
        profile.username +
        "/" +
        chat.img[i].fieldname +
        "/" +
        chat.img[i++].filename
      : "uploads/___misc/" + chat.img[i++].filename;
    img.src = src;
    img.className =
      chat.img.length === 1
        ? "img-fluid img-thumbnail img-preview-one m-1 icon-link"
        : "img-fluid img-thumbnail img-preview m-1 icon-link";

    // clickable full screen overlay img
    const button = document.createElement("button");
    button.className =
      chat.img.length === 1
        ? "btn-overlay img-preview-one"
        : "btn-overlay img-preview";
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("type", "button");
    button.setAttribute("data-bs-target", "#overlay");
    img.setAttribute("onclick", "overlayPreview(this)");
    button.appendChild(img);

    divImgCol.appendChild(button);
    divImgRow.appendChild(divImgCol);
  }
  divImg.appendChild(divImgRow);
  return divImg;
}

function overlayPreview(img) {
  const src = $(img).attr("src");
  $("#imagePreview").attr("src", src);
}

function createHTML_icon(profile) {
  const icon = document.createElement("img");
  const defSrc = "uploads/___default/icon/default_icon.png";
  icon.src = !isEmpty(profile)
    ? profile.icon !== ""
      ? "uploads/" + profile.icon
      : defSrc
    : defSrc;
  icon.className = "img-fluid rounded-circle m-2 icon";
  icon.alt = "User icon image";
  return icon;
}

function createHTML_names(chat, profile) {
  const header = document.createElement("h5");
  header.className = "card-title text-break";
  header.textContent = !isEmpty(profile)
    ? shortenNames(profile.name)
    : shortenNames(chat.name);
  const headerName = document.createElement("small");
  headerName.className = "grey-box fs-5";
  headerName.textContent = !isEmpty(profile)
    ? " @" + shortenNames(profile.username)
    : "";
  header.appendChild(headerName);
  return header;
}

function createHTML_date(chat) {
  const small = document.createElement("small");
  small.className = "text-muted";
  small.textContent = convertDate(new Date(chat.created));
  return small;
}

function createHTML_content(chat) {
  const content = document.createElement("p");
  content.className = "card-text text-break";
  content.innerHTML = chat.content;
  return content;
}
