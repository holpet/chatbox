function convertDate(dateThen) {
    var dateNow = new Date();
    var duration = dateNow.valueOf() - dateThen.valueOf(); // The unit is millisecond
    var diff = parseInt(duration / 1000);
    if (diff == 1) return diff + ' second ago';
    else if (diff < 60) return diff + ' seconds ago';
    diff = parseInt(diff / 60);
    if (diff == 1) return diff + ' minute ago';
    else if (diff < 60) return diff + ' minutes ago';
    diff = parseInt(diff / 60);
    if (diff == 1) return diff + ' hour ago';
    else if (diff < 24) return diff + ' hours ago';
    diff = parseInt(diff / 24);
    if (diff == 1) return diff + ' day ago';
    else if (diff < 30) return diff + ' days ago';
    diff = parseInt(diff / 12);
    if (diff == 1) return diff + ' month ago';
    else if (diff < 6) return diff + ' months ago';
    else return dateThen.toLocaleDateString('cs-CZ');
}

function blurAndLoad(isLoading) {
    if (isLoading) {
        $('#loading').show();
        $('.container').addClass("blur");
        $('.allChats').addClass("blur");
    }
    else {
        $('#loading').hide();
        $('.container').removeClass("blur");
        $('.allChats').removeClass("blur");
    }
}

function countdownTooManyRequests(seconds) {
    countdownInterval = setInterval(() => {
        if (seconds === 1) {
            $('#submitButton').prop('disabled', false);
            $('#submitButton').html('Send your chat');
            clearInterval(countdownInterval);
        }
        else {
            $('#submitButton').prop('disabled', true);
            $('#submitButton').html('Please wait ' + seconds--);
        }
    }, 1000);
}