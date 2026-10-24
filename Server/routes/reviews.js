const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const schemas = require("../schema");
const c = require("../controllers/reviews");

router.post("/listings/:listingId/reviews", requireAuth, validate(schemas.review), c.create);
router.delete("/reviews/:reviewId", requireAuth, c.destroy);

module.exports = router;
