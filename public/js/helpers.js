function convertDate(dateThen) {
  var dateNow = new Date();
  var duration = dateNow.valueOf() - dateThen.valueOf(); // The unit is millisecond
  var diff = parseInt(duration / 1000);
  if (diff == 1) return diff + " second ago";
  else if (diff < 60) return diff + " seconds ago";
  diff = parseInt(diff / 60);
  if (diff == 1) return diff + " minute ago";
  else if (diff < 60) return diff + " minutes ago";
  diff = parseInt(diff / 60);
  if (diff == 1) return diff + " hour ago";
  else if (diff < 24) return diff + " hours ago";
  diff = parseInt(diff / 24);
  if (diff == 1) return diff + " day ago";
  else if (diff < 30) return diff + " days ago";
  diff = parseInt(diff / 12);
  if (diff == 1) return diff + " month ago";
  else if (diff < 6) return diff + " months ago";
  else return dateThen.toLocaleDateString("cs-CZ");
}

function blurAndLoad(isLoading) {
  if (isLoading) {
    $("#loading").show();
  } else {
    $("#loading").hide();
  }
}

// profile edit helpers

function displayDesc(selector) {
  var new_desc = $("#" + selector)
    .val()
    .trim()
    .replace(/<br \/>/g, "");
  $("#" + selector).val(new_desc);
}

// CHAT LISTING HELPERS

function isEmpty(obj) {
  //if (Object.keys(obj).length === 0) return true;
  if (obj === undefined || obj === null) return true;
  return false;
}

function getProfile(key, inputArray) {
  return inputArray.find(({ userID }) => userID === key);
}

function shortenNames(name) {
  if (name.length > 20) return name.slice(0, 20) + "...";
  return name;
}
