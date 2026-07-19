// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  // If user ID exists in session, they are logged in
  if (req.session.userId) {
    return next(); // Proceed to the next middleware or route handler
  }
  // Otherwise, redirect them to the login page
  res.redirect('/login');
}

// Export the middleware function
module.exports = isLoggedIn;
