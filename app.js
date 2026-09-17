require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const UserRouter = require("./routes/user.js");
const { MongoStore } = require("connect-mongo");
const listingController = require("./controller/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET;

async function main() {
  if (!dbUrl) {
    throw new Error("ATLASDB_URL is missing. Add it to your .env file or deployment environment.");
  }
  if (!sessionSecret) {
    throw new Error("SECRET is missing. Add it to your .env file or deployment environment.");
  }

  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  console.log("Connected to DB");
}

const view = path.resolve(__dirname, "views");
app.set("view engine", "ejs");
app.set("views", view);
app.engine('ejs', engine);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.resolve(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store:", err);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentPath = req.path;
  next();
});

// Main Route - Renders Listings Dashboard directly on '/'
app.get("/", wrapAsync(listingController.index));

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", UserRouter);

// Error Handling
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  console.log(err);
  let { statusCode = 500, message = "Something went Wrong Please Try Again Later" } = err;
  res.status(statusCode).render("listings/error", { message });
});

const port = process.env.PORT || 8080;

async function startServer() {
  try {
    await main();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();