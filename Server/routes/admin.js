const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin");
const { requireAuth, isAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../schema");

// Sabhi admin routes par login aur admin role dono zaroori hain
router.use(requireAuth, isAdmin);

router.get("/stats", admin.getStats);
router.get("/users", admin.getUsers);
router.patch("/users/:id/block", validate(schemas.blockUser), admin.blockUser);
router.get("/listings", admin.getListings);
router.delete("/listings/:id", admin.deleteListing);
router.get("/bookings", admin.getBookings);
router.get("/logs", admin.getLogs);

module.exports = router;
