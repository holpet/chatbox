async function getChatsBy(filter) {
    try {
        if (filter === '') {
            // get all db chats
            const chats = await fetch(API_URL + 'chats', { credentials: "include" })
                .then(res => res.json());
            return chats;
        }
        else {
            // get db chats filtered by username
            const chats = await fetch(API_URL + 'chats/' + filter, { credentials: "include" })
                .then(res => res.json());
            return chats;
        }
    }
    catch (error) {
        console.log(error);
    }
    return {};
}

async function getProfilesBy(filter) {
    try {
        if (filter === '') {
            // get all db profiles
            const profile = await fetch(API_URL + 'profiles', { credentials: "include" })
                .then(res => res.json());
            return profile;
        }
        else {
            // get one db profile based on username
            const profile = await fetch(API_URL + 'profiles/' + filter, { credentials: "include" })
                .then(res => res.json());
            return profile;
        }
    }
    catch (error) {
        console.log(error);
    }
    return {};
}

/* HELPER funcs */
function isEmpty(obj) {
    //if (Object.keys(obj).length === 0) return true;
    if (obj === undefined) return true;
    return false;
}

function getProfile(key, inputArray) {
    return inputArray.find(({ username }) => username === key);
}

function shortenNames(name) {
    if (name.length > 20) return name.slice(0,20) + '...';
    return name;
}

/* func to list chat messages saved in db */

async function listAllChats(filter) {
    blurAndLoad(true);
    const allChats = document.querySelector('.allChats');
    allChats.innerHTML = '';

    try {
        // get a registered user profile (if there is any)
        const profiles = await getProfilesBy('');
        await getChatsBy(filter)
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
                divCardBodySpec.className = 'd-flex w-100 justify-content-between align-self-end';
                
                // get a registered user profile (if there is any)
                const profile = getProfile(chat.name, profiles);

                // create icon
                const icon = document.createElement('img');
                icon.src = !isEmpty(profile) ? 'uploads/' + profile.icon : 'uploads/___default/icon/default_icon.png';
                icon.className = 'img-fluid rounded-circle m-2 icon';
                icon.alt = 'User icon image';
                
                // create name & date
                const header = document.createElement('h5');
                header.className = 'card-title text-break';
                header.textContent = !isEmpty(profile) ? shortenNames(profile.name) : shortenNames(chat.name);
                const headerName = document.createElement('small');
                headerName.className = 'grey-box fs-5';
                headerName.textContent = !isEmpty(profile) ? ' @' + shortenNames(profile.username) : '';
                header.appendChild(headerName);
                const small = document.createElement('small');
                small.className = 'text-muted';
                small.textContent = convertDate(new Date(chat.created));

                // create links for profile
                if (!isEmpty(profile)) {
                    const target = "window.open('/" + profile.username + "', '_self')";
                    header.setAttribute('onclick', target);
                    icon.setAttribute('onclick', target);
                    header.classList.add('icon-link', 'chat-link');
                    headerName.classList.add('icon-link');
                    icon.classList.add('icon-link');
                }
                
                // create message
                const content = document.createElement('p');
                content.className = 'card-text text-break';
                content.innerHTML = chat.content;

                // add images
                const divImg = document.createElement('div');
                divImg.className = 'text-center pe-2';
                const divImgRow = document.createElement('div');
                divImgRow.className = 'row p-3';
                let i = 0;
                while (i < chat.img.length) {
                    const divImgCol = document.createElement('div');
                    divImgCol.className = 'col p-1';
                    const img = document.createElement('img');
                    img.src = !isEmpty(profile) ? 'uploads/' + profile.username + '/' + chat.img[i].fieldname + '/' + chat.img[i++].filename : 'uploads/___misc/' + chat.img[i++].filename;
                    img.className = 'img-fluid img-thumbnail img-preview m-1';
                    divImgCol.appendChild(img);
                    divImgRow.appendChild(divImgCol);
                }
                divImg.appendChild(divImgRow);

                // append divs with content
                divCol1.appendChild(icon);
                
                divCardBodySpec.appendChild(header);
                divCardBodySpec.appendChild(small);
                divCardBody.appendChild(divCardBodySpec);
                divCardBody.appendChild(content);
                if (chat.img.length > 0) content.appendChild(divImg);
                divCol2.appendChild(divCardBody);

                divRow.appendChild(divCol1);
                divRow.appendChild(divCol2);

                divCard.appendChild(divRow);
                div.appendChild(divCard);
            });
            allChats.appendChild(div);
            blurAndLoad(false);
        });
    }
    catch (error) {
        console.log(error);
    }
}