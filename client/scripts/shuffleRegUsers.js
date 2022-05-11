loginAndContinue("#reg-user-btn");
loginAndContinue("#reg-img");

const exampleUsers = {
     LERA: {
        email: 'lera@lera',
        password: 'lera'
     }
}

function loginAndContinue(selector) {
    $(selector).on('click', function(event) {
        var href = this.href;
        event.preventDefault();
        loginUser();
        window.location = href;
    });
}

 // TODO: proper random user selection, for now it's only one fixed user (for development) 
async function loginUser() {
    const email = exampleUsers.LERA.email;
    const password = exampleUsers.LERA.password;
   
    const userData = {
        email,
        password
    };

    try {
        fetch(API_URL + 'login', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'content-type': 'application/json'
            },
            credentials: "include"
        })  .then(response => {
                // status OK
                console.log(response);
                if (response.status === 200) {
                    console.log('Login complete.');
                    // TODO: change icon img based on user
                }
                else if (response.status === 401) {
                    console.log('User couldn\'t be logged in.');
                }
        })
    }
    catch (error) {
        console.log(error);
    }
}