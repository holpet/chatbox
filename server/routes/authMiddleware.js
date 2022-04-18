module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401);
        res.json({error: 'User is not authenticated, cannot acces route.'});
    }
}

module.exports.isAdmin = (req, res, next) => {

}