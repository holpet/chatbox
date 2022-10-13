// returns array of words split by white space
function splitPhrase(phrase) {
  return phrase.split(" ");
}

function stripSpecialChars(phrase) {
  var stripped_phrase = phrase.replace("<br>", "");
  const regexForNonAlphaNum = new RegExp(/[^\p{L}\p{N} \-]+/gu);
  //stripped_phrase = stripped_phrase.replace(/[^a-zA-Z0-9 \-]/g, ' ');
  stripped_phrase = stripped_phrase.replace(regexForNonAlphaNum, " ");
  return stripped_phrase;
}

// 0 - no match, 1 - partial match, 2 - full match
function comparePhrase(chat, searched) {
  // search for a full phrase
  chat = stripSpecialChars(chat);
  var re = new RegExp(searched, "gi");
  if (chat.match(re) !== null) return 2;

  // search for individual words
  var chat_ar = splitPhrase(chat);
  var search_ar = splitPhrase(searched);
  let match = 0;
  search_ar.forEach((word) => {
    if (chat_ar.includes(word)) match++;
  });
  if (match == 0) return 0;
  else return 1;
}

module.exports.comparePhrase = comparePhrase;
module.exports.stripSpecialChars = stripSpecialChars;
