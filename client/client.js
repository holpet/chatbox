console.log('Client has been initialized...')
const API_URL = 'http://localhost:5050/chats';

const form = document.querySelector('form');
const allChats = document.querySelector('.allChats');
const submitButton = document.getElementById('submitButton');
const messageTextArea = document.getElementById('messageTextArea');

blurAndLoad(true);
listAllChats();

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const content = formData.get('message');

    blurAndLoad(true);

    const chat = {
        name,
        content
    };

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
    }
    else {
        form.classList.remove('was-validated');
        messageTextArea.value = '';
    }

    // Add chat into a database
    try {
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(chat),
            headers: {
                'content-type': 'application/json'
            }
        })  .then(response => {
                // status OK
                if (response.status === response.ok) {
                    console.log('Chat validated and sent.');
                }
                // error: too many requests
                else if (response.status === 429) {
                    countdownTooManyRequests(10);
                }
                // error missing name and/or message
                else if (response.status === 442) {
                    console.log("Missing name and/or content.");
                }
                return response.json();
        })
            .then(chat => {
                listAllChats();
                console.log(chat);
            });
    }
    catch (error) {
        throw boomify(error);
    }
});


function listAllChats() {
    allChats.innerHTML = '';
    try {
        fetch(API_URL)
        .then(res => res.json())
        .then(chats => {
            const div = document.createElement('div');
            div.className = 'list-group';
            
            chats.reverse();
            chats.forEach(chat => {
                const div1 = document.createElement('div');
                div1.className = 'list-group-item list-group-item-action';
                const div2 = document.createElement('div');
                div2.className = 'd-flex w-100 justify-content-between';
                const icon = document.createElement('img');
                icon.src = 'img/icon1.jpg';
                icon.className = 'img-thumbnail rounded-circle h-25 d-inline-block p-1 float-start';
                const header = document.createElement('h5');
                header.className = 'mb-1';
                header.textContent = chat.name;
                const small = document.createElement('small');
                small.textContent = convertDate(new Date(chat.created));
                //new Date(chat.created).toLocaleDateString('cs-CZ')
                //div2.appendChild(icon);
                div2.appendChild(header);
                div2.appendChild(small);
                const content = document.createElement('p');
                content.className = 'mb-1';
                content.textContent = chat.content;
                div1.appendChild(div2);
                div1.appendChild(content);
                div.appendChild(div1);
            });
            allChats.appendChild(div);
        });
    }
    catch (error) {
        throw boomify(error);
    }
    blurAndLoad(false);
}

/* Helper functions */

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
        $('.container-fluid').addClass("blur");
        $('.allChats').addClass("blur");
    }
    else {
        $('#loading').hide();
        $('.container-fluid').removeClass("blur");
        $('.allChats').removeClass("blur");
    }
}

function countdownTooManyRequests(seconds) {
    countdownInterval = setInterval(() => {
        if (seconds === 1) {
            clearInterval(countdownInterval);
            $('#submitButton').prop('disabled', false);
            $('#submitButton').html('Send your chat');
        }
        else {
            $('#submitButton').prop('disabled', true);
            $('#submitButton').html('Please wait ' + seconds--);
        }
    }, 1000);
}
