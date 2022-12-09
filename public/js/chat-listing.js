/* GENERATE/LIST FILTERED CHATS */
/**
 * All helper functions to be found in: helpers.js
 */

async function listAllChats(filter = "", search = null) {
  blurAndLoad(true);
  $(".allChats").html("");

  try {
    // get a registered user profile; if not registered, get all profiles
    const profiles = await getProfilesBy(filter);
    // get chats to display
    const chats = await getChatsBy(filter, search);

    // no search term --> return, no chats
    if (search === null && chats.length === 0) {
      blurAndLoad(false);
      return;
    }
    // no search match found --> append search results
    if (chats.length === 0) {
      const result = createNoSearchMatch(search);
      $(".allChats").append(result);
      blurAndLoad(false);
      return;
    }

    const authData = await getAuthData();

    // CREATE LISTING OF ALL FOUND CHATS
    var div = $("<div id='chats-container'></div>");
    firstElem = true;

    chats.reverse();
    chats.forEach((chat) => {
      // create divs for sections

      var divCard = $(
        "<div class='card card-border border-top-0 action-highlight'></div>"
      );
      if (firstElem) {
        divCard.removeClass("border-top-0");
        firstElem = false;
      }
      var divRow = $("<div class='row g-0 justify-content-left'></div>");
      var divCol1 = $("<div class='ol mx-auto icon-sidebar'></div>");
      var divCol2 = $("<div class='col'></div>");
      var divCardBody = $("<div class='card-body pr-3 pl-1'></div>");
      var divCardBodySpec = $(
        "<div class='d-flex w-100 justify-content-between align-self-end'></div>"
      );
      var divCardBodySpecOpt = $("<div></div>");

      // get a registered user profile (if there is any)
      const profile = getProfile(chat.userID, profiles);

      // create icon
      const icon = createHTML_icon(profile);
      divCol1.append(icon);

      // create name & date
      const header = createHTML_names(chat, profile);
      const small = createHTML_date(chat);
      // create delete
      if (
        authData.auth &&
        authData.userID === (!isEmpty(profile) ? profile.userID : null)
      ) {
        const del = $("<i class='far fa-trash-alt me-2'></i>")
          .attr("data-id", chat._id)
          .attr("onclick", "deleteChat(this)");
        divCardBodySpecOpt.append(del);
      }
      // add name & date & delete
      divCardBodySpecOpt.append(small);
      divCardBodySpec.append(header, divCardBodySpecOpt);
      divCardBody.append(divCardBodySpec);

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
      divCardBody.append(content);
      divCol2.append(divCardBody);

      // add images
      if (chat.img.length > 0) {
        const divImg = createHTML_img(chat, profile);
        content.appendChild(divImg);
      }

      divRow.append(divCol1, divCol2);
      divCard.append(divRow);
      div.append(divCard);
    });
    $(".allChats").append(div);
    blurAndLoad(false);
  } catch (error) {
    console.log(error);
  }
}

function createNoSearchMatch(search) {
  var h = $("<h4 class='card-title text-break text-center fw-bold'></h4>").text(
    "No results for " + search + "."
  );
  var p = $("<p class='card-title text-break text-center'></p>").text(
    "Try searching for another."
  );
  var wrap = $("<div class='card-body p-3'></div>").append(h, p);
  var container = $("<div class='card card-border'></div>").append(wrap);
  return container;
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

    const img = new Image();
    const defSrc = "uploads/___default/chat/default_chat" + i + ".jpg";
    const src = !isEmpty(profile)
      ? "uploads/" +
        profile.username +
        "/" +
        chat.img[i].fieldname +
        "/" +
        chat.img[i++].filename
      : "uploads/___misc/" + chat.img[i++].filename;
    img.src = src;
    img.onerror = () => (img.src = defSrc);
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
  const icon = new Image();
  const defSrc = "uploads/___default/icon/default_icon.png";
  icon.src = !isEmpty(profile) ? "uploads/" + profile.icon : "";
  icon.onerror = () => (icon.src = defSrc);
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
