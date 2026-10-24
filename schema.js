const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().required().min(0),
        image: Joi.any().allow("", null)
    }).required()
});




module.exports.listingReview = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment:Joi.string().required()
    }).required()
});



