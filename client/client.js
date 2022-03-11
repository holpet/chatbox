console.log('Client has been initialized...')
const API_URL = 'http://localhost:5050/chats';

const form = document.querySelector('form');
const loading = document.querySelector('.loading');
const allChats = document.querySelector('.allChats');
const submitButton = document.getElementById('submitButton');

loading.style.display = '';
//form.style.display = 'none';
listAllChats();

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const formData = new FormData(form);
    const name = formData.get('name');
    const content = formData.get('message');

    //form.style.display = 'none';
    loading.style.display = '';

    const chat = {
        name,
        content
    };

    try {
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(chat),
            headers: {
                'content-type': 'application/json'
            }
        })  .then(response => {
                console.log('Res status:', response.status);

                // error: too many requests
                if (response.status === 429) {
                    console.log("Res 429... settimeout...")
                }
                // error: missing name and/or message
                else if (response.status === 442) {
                    console.log('Res 442');
                }
                // status OK
                else {
                    form.reset();
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
                const header = document.createElement('h5');
                header.className = 'mb-1';
                header.textContent = chat.name;
                const small = document.createElement('small');
                //console.log(new Intl.DateTimeFormat('cs-cz').format(chat.created.toString()));
                small.textContent = new Date(chat.created).toLocaleDateString('cs-CZ');
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
    loading.style.display = 'none';
    form.style.display = '';
}

/* HELPER FUNCTIONS */
function convertDate(date) {
    /*
    var options = {year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric'};
    return new Intl.DateTimeFormat('cs-cz', options).format(date);
    */ 
}