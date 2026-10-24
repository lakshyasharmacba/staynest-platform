const router = require("express").Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const validate = require("../middleware/validate");
const { requireAuth, isOwner } = require("../middleware/auth");
const schemas = require("../schema");
const c = require("../controllers/listings");

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB

router.get("/", c.index);
router.post("/", requireAuth, upload.single("image"), validate(schemas.listing), c.create);
router.get("/mine", requireAuth, c.mine); // /:id se PEHLE, warna "mine" ko id samajh lega
router.get("/:id", c.show);
router.put("/:id", requireAuth, isOwner, upload.single("image"), validate(schemas.listing), c.update);
router.delete("/:id", requireAuth, isOwner, c.destroy);

module.exports = router;
