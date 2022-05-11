blurAndLoad(false);
manageChatForm();
listAllChats();

function manageChatForm() {
    const form = document.querySelector('#chatForm');

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
            const messageTextArea = document.getElementById('messageTextArea');
            messageTextArea.value = '';
        }
    
        // Add chat into a database
        try {
            fetch(API_URL + 'chats', {
                method: 'POST',
                body: JSON.stringify(chat),
                headers: {
                    'content-type': 'application/json'
                },
                credentials: "include"
            })  .then(response => {
                    console.log(response);
                    // status OK
                    if (response.headers.status === response.headers.ok) {
                        console.log('Chat validated and sent.');
                    }
                    // error: too many requests
                    else if (response.headers.status === 429) {
                        countdownTooManyRequests(10);
                    }
                    // error missing name and/or message
                    else if (response.headers.status === 442) {
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
            console.log(error);
        }
    });
}



function listAllChats() {
    blurAndLoad(true);
    const allChats = document.querySelector('.allChats');
    allChats.innerHTML = '';
    try {
        fetch(API_URL + 'chats', {
            credentials: "include"
        })
        .then(res => res.json())
        .then(chats => {
            const div = document.createElement('div');
            firstElem = true;
            chats.reverse();
            chats.forEach(chat => {
                // create divs
                const divCard = document.createElement('div');
                divCard.className = 'card card-border border-top-0 action-highlight';
                if (firstElem) {
                    divCard.classList.remove('border-top-0');
                    firstElem = false;
                }
                const divRow = document.createElement('div');
                divRow.className = 'row g-0 justify-content-left';
                const divCol1 = document.createElement('div');
                divCol1.className = 'col mx-auto icon-sidebar';
                const divCol2 = document.createElement('div');
                divCol2.className = 'col';
                const divCardBody = document.createElement('div');
                divCardBody.className = 'card-body pr-3 pl-1';
                const divCardBodySpec = document.createElement('div');
                divCardBodySpec.className = 'd-flex w-100 justify-content-between align-self-start';
                
                // create img
                const icon = document.createElement('img');
                icon.src = 'icon-img';
                icon.className = 'img-fluid rounded-circle m-2 p-1 icon';
                icon.alt = 'User icon image';
                
                // create name & date
                const header = document.createElement('h5');
                header.className = 'card-title text-break';
                header.textContent = chat.name;
                const small = document.createElement('small');
                small.className = 'text-muted';
                small.textContent = convertDate(new Date(chat.created));
                
                // create message
                const content = document.createElement('p');
                content.className = 'card-text text-break';
                content.innerHTML = chat.content;

                // append divs with content
                divCol1.appendChild(icon);
                
                divCardBodySpec.appendChild(header);
                divCardBodySpec.appendChild(small);
                divCardBody.appendChild(divCardBodySpec);
                divCardBody.appendChild(content);
                divCol2.appendChild(divCardBody);

                divRow.appendChild(divCol1);
                divRow.appendChild(divCol2);

                divCard.appendChild(divRow);
                div.appendChild(divCard);
            });
            allChats.appendChild(div);
        });
    }
    catch (error) {
        console.log(error);
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