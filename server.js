const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const { isLoggedIn, isAdmin, isCustomer } = require("./middleware/auth"); // middleware folder
const dbConnect = require("./config/db"); // db connection file
const Media = require("./models/MovieModel"); // movie model file
const User = require("./models/UserModel"); // user model file
require("dotenv").config(); // load process object with .env file

// Middleware
app.use(express.urlencoded({ extended: true })); // reads form data
app.use(express.static("public")); // serves css, js, img files

// View Engine
app.set("view engine", "ejs");

// Connect DB
dbConnect();

// Programmatically create an admin every time the server starts
const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      firstName: "kadeem",
      lastName: "best",
      email: "kadeem@MoCorn.com",
      password: hashedPassword,
      type: "admin"
    });

    // This ONLY runs if User.create succeeds
    console.log("Admin account created successfully!");

  } catch (error) {
    // This runs if ANY of the above lines fail (bcrypt or database)
    console.error("FAILED to create admin:", error.message);
  }
};

// Run it every time the server starts
createAdmin();

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET_KEY, // session secret key from .env
  resave: false, 
  saveUninitialized: true, 
  cookie: { secure: false } 
}));


// make session user available to templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user ?? null;
  res.locals.currentUserType = req.session.user?.type ?? null;
  next();
});



// Home page
app.get("/", async (req, res) => {
  const featuredMovies = await Media.find({ isMovie: true, isFeatured: true }).limit(4);
  const featuredTV = await Media.find({ isMovie: false, isFeatured: true }).limit(4);
  const featuredImages = ["/img/img1.jpg", "/img/img2.jpg", "/img/img3.jpg"];
  res.render("index", { featuredMovies, featuredTV, featuredImages });
});

// Register 
app.get("/auth/register", (req, res) => {
  res.render("auth/reg", { error: null });
});

app.post("/auth/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    type: "customer" 
  });
  res.redirect("/auth/login");
});

// Login 
app.get("/auth/login", (req, res) => {
  res.render("auth/login", { error: null });
});

app.post("/auth/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email }); // find by email
  if (!user) {
    return res.render("auth/login", { error: "Invalid email or password." });
  }
  const match = await bcrypt.compare(req.body.password, user.password); // check password
  if (!match) {
    return res.render("auth/login", { error: "Invalid email or password." });
  }

  // store user info in session
  req.session.user = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    type: user.type
  };

  // redirect based on type
  if (user.type === "admin") {
    return res.redirect("/admin-dashboard");
  } else {
    return res.redirect("/customer-dashboard");
  }
});

// Logout
app.post("/auth/logout", (req, res) => {
  delete req.session.user; // remove session
  res.redirect("/auth/login");
});

// Dashboards 
app.get("/admin-dashboard", isLoggedIn, isAdmin, (req, res) => {
  res.render("dashboard/admin");
});

app.get("/customer-dashboard", isLoggedIn, isCustomer, (req, res) => {
  res.render("dashboard/customer");
});

// Create Page Route (Admin only)
app.get("/create", isLoggedIn, isAdmin, (req, res) => {
  res.render("create");
});

app.post("/create", isLoggedIn, isAdmin, async (req, res) => {
  const newMedia = new Media({
    title: req.body.title,
    synopsis: req.body.synopsis,
    genre: req.body.genre,
    rating: req.body.rating,
    smallPoster: req.body.smallPoster,
    largePoster: req.body.largePoster,
    trailerLink: req.body.trailerLink,
    priceperday: req.body.priceperday,
    isMovie: req.body.isMovie === "true",
    isFeatured: req.body.isFeatured === "true"
  });
  await newMedia.save();
  console.log(" Media created:", newMedia.title);
  res.redirect("/create");
});

// Full Movies Listing (no limit)
app.get("/movielisting", async (req, res) => {
  const movies = await Media.find({ isMovie: true });
  res.render("allmovies", { movies });
});

// Full TV Listing (no limit)
app.get("/tvlisting", async (req, res) => {
  const tvshows = await Media.find({ isMovie: false });
  res.render("alltvshows", { tvshows });
});

// View details
app.get("/details/:id", async (req, res) => {
  const media = await Media.findById(req.params.id);
  res.render("details", { media });
});

// Edit page (Admin only)
app.get("/mediadetails/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  const media = await Media.findById(req.params.id);
  res.render("edit", { media });
});

// Update (Admin only)
app.post("/mediadetails/:id/update", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;
  await Media.findByIdAndUpdate(id, {
    title: req.body.title,
    synopsis: req.body.synopsis,
    genre: req.body.genre,
    rating: req.body.rating,
    smallPoster: req.body.smallPoster,
    largePoster: req.body.largePoster,
    trailerLink: req.body.trailerLink,
    priceperday: req.body.priceperday,
    isMovie: req.body.isMovie === "true",
    isFeatured: req.body.isFeatured === "true",
  });
  console.log(` Media with ID ${id} updated successfully`);
  res.redirect(`/details/${id}`);
});

// Delete (Admin only)
app.post("/mediadetails/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;
  await Media.findByIdAndDelete(id);
  console.log(` Media with ID ${id} deleted successfully`);
  res.redirect("/");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404"); // not found page
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
