const ExpressError = require("../utils/ExpressError");

// validate(schema) -> req.body ko Joi se check + clean (unknown fields hata deta hai)
module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    throw new ExpressError(400, error.details.map((d) => d.message).join(", "));
  }
  req.body = value;
  next();
};
