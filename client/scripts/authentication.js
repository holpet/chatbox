async function isUserLoggedIn() {
    try {
        const fetched = await fetch(API_URL + 'is-auth', {
            credentials: "include"
        });
        if (fetched.status === 200) {
            //console.log('User is confirmed to be authenticated.')
            return true;
        }
        else {
            //console.log('User failed to be authenticated.')
            return false;
        }
    }
    catch (error) {
        console.log(error);
    }
}