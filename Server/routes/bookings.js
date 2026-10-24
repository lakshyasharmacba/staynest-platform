const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const schemas = require("../schema");
const bookings = require("../controllers/bookings");
const payments = require("../controllers/payments");

router.post("/listings/:listingId/bookings", requireAuth, validate(schemas.booking), bookings.create);
router.get("/bookings/mine", requireAuth, bookings.mine);
router.get("/bookings/host", requireAuth, bookings.host);
router.patch("/bookings/:id/cancel", requireAuth, bookings.cancel);
router.post("/payments/verify", requireAuth, validate(schemas.verifyPayment), payments.verify);

module.exports = router;
