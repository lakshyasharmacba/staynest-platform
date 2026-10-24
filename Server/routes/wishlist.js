const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const c = require("../controllers/wishlist");

router.get("/", requireAuth, c.list);
router.post("/:listingId", requireAuth, c.add);
router.delete("/:listingId", requireAuth, c.remove);

module.exports = router;
