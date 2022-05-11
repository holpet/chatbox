module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401).json({error: 'User is not authorized to view this resource.'});
    }
}
module.exports.isNotAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401).json({error: 'User is authenticated, cannot proceed on this path.'});
    }
}

module.exports.isAdmin = (req, res, next) => {

}