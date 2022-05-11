manageChatForm();

function manageChatForm() {
    const form = document.querySelector('#chatForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        blurAndLoad(true);
    
        // Client side validation
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            blurAndLoad(false);
            return;
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
                body: formData,
                credentials: "include"
            })  .then(response => {
                    // status OK
                    if (response.headers.status === response.headers.ok) {
                        //console.log('Chat validated.');
                    }
                    // error: too many requests
                    else if (response.headers.status === 429) {
                        countdownTooManyRequests(10);
                    }
                    // error missing name and/or message
                    else if (response.headers.status === 442) {
                        console.log("Missing name and/or content.");
                    }
                    //return response.json();
            })
                .then(() => {
                    listAllChats('');
                    $('#preview').empty();
                });
        }
        catch (error) {
            console.log('Chat could not be sent. ->', error);
        }
        blurAndLoad(false);
    });
}

/* *****  HELPER FUNCTIONS ***** */
function readFiles(input) {
    validateFiles(input);

    const files = input.files;
    if (files) {
        $('#preview').empty();
        Object.keys(files).forEach(i => {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = document.createElement('img');
              img.src = e.target.result;
              img.className = 'img-thumbnail rounded icon float-start me-2';
              document.getElementById('preview').appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
    //console.log(input.files);
}

function validateFiles(input) {
    let i = 0;
    while (i < input.files.length) {
        if (!isImage(input, i)) removeFileFromFileList(i--);
        i++;
    }
    while (input.files.length > 3) removeFileFromFileList(input.files.length-1);
}

function removeFileFromFileList(index) {
    const dt = new DataTransfer();
    const input = document.getElementById('formFileImg');
    const { files } = input;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (index !== i)
        dt.items.add(file);
    }
    input.files = dt.files
}
  
function isImage(input, index) {
    const type = input.files[index].type;
    switch (type) {
        case 'image/jpeg':
        case 'image/webp':
        case 'image/png':
        case 'image/gif':
        return true;
    }
    return false;
}