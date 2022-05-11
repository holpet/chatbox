hideSuccessfulAlert();
manageRegisterForm();

function manageRegisterForm() {
    $('#alert-success-registration').hide();
    const regForm = document.querySelector('#registerForm');

    regForm.addEventListener('submit', (event) => {
        event.preventDefault();

        /* Reset form validator */
        $('#regUsernameCheck').text('Missing username.');
        $('#regEmailCheck').text('Missing / incorrect email.');
        $('#regUsernameInput').removeClass('is-invalid');
        $('#regEmailInput').removeClass('is-invalid');
    
        /* Get form data */
        const formData = new FormData(regForm);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
    
        blurAndLoad(true);
    
        const userData = {
            username,
            email,
            password
        };

        if (!regForm.checkValidity()) {
            regForm.classList.add('was-validated');
            return;
        }
        else regForm.classList.remove('was-validated');
    
        // Put user data into the database
        try {
            fetch(API_URL + 'register', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'content-type': 'application/json'
                },
                credentials: "include"
            })  .then(async response => {

                    /* Server-side data validation */

                    // status OK
                    if (response.status === 200) {
                        console.log('Registration complete.');
                        alertSuccessfulRegistration();
                        regForm.reset();
                        $('#regUsernameInput').removeClass('is-invalid');
                        $('#regEmailInput').removeClass('is-invalid');
                        regForm.classList.remove('was-validated');
                    }
                    // error: too many requests
                    else if (response.status === 429) {
                        // TODO: countdownTooManyRequests(10);
                    }
                    // error: username already in use
                    else if (response.status === 480) {
                        const body = await response.json();
                        $('#regUsernameCheck').text(body.error);
                        $('#regUsernameInput').addClass('is-invalid');
                    }
                    // error: email already in use
                    else if (response.status === 481) {
                        const body = await response.json();
                        $('#regEmailCheck').text(body.error);
                        $('#regEmailInput').addClass('is-invalid');
                    }
                    else {
                        const body = await response.json();
                        console.log(body.error);
                    }
                    blurAndLoad(false);
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}

function alertSuccessfulRegistration() {
    $('#logTab').click();
    $('#alert-success-registration').show();
}

function hideSuccessfulAlert() {
    $('#loginButton').click(() => {
        $('#alert-success-registration').hide();
    });
    $('#logTab').click(() => {
        $('#alert-success-registration').hide();
    });
    $('#regTab').click(() => {
        $('#alert-success-registration').hide();
    });
}