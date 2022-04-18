const Filter = require('bad-words');
const filter = new Filter();

function isValidChat(chat) {
    return chat.name && chat.name.toString().trim() !== '' &&
        chat.content && chat.content.toString().trim() !== '';
}

function structureContent(chat, multiLine) {
    var filteredContent = filter.clean(chat);
    if (multiLine) filteredContent = filteredContent.replace(/\n/g, '<br />');
    return filteredContent;
}

module.exports.isValidChat = isValidChat;
module.exports.structureContent = structureContent;