logoutAndContinue();


function logoutAndContinue() {
    $('#logoutButton').on('click', function(event) {
        var href = this.href;
        event.preventDefault();
        logoutUser();
        window.location = href;
    });
}

const logoutUser = async () => {
    try {
        fetch(API_URL + 'logout', {
            credentials: "include"
        })
        .then(res => {
            if (res.status === 200) {
                console.log('User has been logged out.')
                return true;
            }
            else {
                console.log('User couldn\'t be logged out.')
                return false;
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

