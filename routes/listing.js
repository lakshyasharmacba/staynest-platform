const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const Listing = require("../models/listing.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


router
.route("/")
.get((req, res) => res.redirect("/"))
.post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit" ,isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;