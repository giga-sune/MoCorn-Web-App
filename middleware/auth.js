// check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.session.user) { // if no session user, redirect to login
    return res.redirect('/auth/login');
  }
  next(); // proceed if logged in
}

// check if user is admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.type !== 'admin') { // block if not admin
    return res.redirect('/');
  }
  next(); // proceed if admin
}

// check if user is customer
function isCustomer(req, res, next) {
  if (!req.session.user || req.session.user.type !== 'customer') { // block if not customer
    return res.redirect('/');
  }
  next(); // proceed if customer
}

// export middleware functions
module.exports = { isLoggedIn, isAdmin, isCustomer };
