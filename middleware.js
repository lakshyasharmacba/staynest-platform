const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, listingReview} = require("./schema.js");



module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview  = (req, res, next) => {
  let { error } = listingReview.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); // 400 Bad Request
  } else {
    next();
  }
};



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};




module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async (req, res, next) => {
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in to perform that action.");
        return res.redirect("/login");
    }
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/");
    }
    const ownerId = (listing.owner && listing.owner._id) ? listing.owner._id : listing.owner;
    if (!ownerId || !ownerId.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the Owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.isReviewAuthor = async (req, res, next) => {
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in to perform that action.");
        return res.redirect("/login");
    }
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }
    const authorId = (review.author && review.author._id) ? review.author._id : review.author;
    if (!authorId || !authorId.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the Author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};