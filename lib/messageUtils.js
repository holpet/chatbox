const Filter = require('bad-words');
const filter = new Filter();

function isValidChat(chat) {
    return (chat.name && chat.name.toString().trim() !== '') &&
        chat.content && chat.content.toString().trim() !== '';
}

function structureContent(chat, multiLine) {
    const regex = /[^A-Za-z0-9]/g;
    //var filteredContent = (chat === '') ? '' : filter.clean(chat);
    var filteredContent = chat;
    if (multiLine && chat !== '') filteredContent = filteredContent.replace(/\n/g, '<br />');
    return filteredContent;
}

module.exports.isValidChat = isValidChat;
module.exports.structureContent = structureContent;