const isFollowing = async (userID) => {
    const fol = await checkFollowingStatus(userID);
    switchFollows(fol);
}

const checkFollowingStatus = async (userID) => {
    const fol = await fetch(API_URL + 'isfollowing-' + userID, { credentials: "include" }).then(res => res.json());
    return fol;
}

const switchFollows = (fol) => {
    if (fol) {
        $('#followProfileButton').text('Unfollow');
        return true;
    }
    else {
        $('#followProfileButton').text('Follow');
        return false;
    }
}

const updateFollowButton = async (userID) => {
    try {
        const check = await checkFollowingStatus(userID);
        switchFollows(!check);
        const followPath = (check) ? 'unfollow' : 'follow';
        await fetch(API_URL + followPath + '-' + userID, { credentials: "include" }).then(res => res.json());
    }   
    catch (error) {
        console.log(error);
    }
}

const getStats = async (userID) => {
    const stats = await fetch(API_URL + 'stats-' + userID, { credentials: "include" }).then(res => res.json());
    $('#stat-following').text(stats.following.length);
    $('#stat-followers').text(stats.followers.length);
    $('#stat-messages').text(stats.chats.length);
}