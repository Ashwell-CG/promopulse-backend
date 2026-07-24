function isLoggedIn(req, res, next) {
  // Check if session contains userId to verify authentication
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

module.exports = isLoggedIn;
