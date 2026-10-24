const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js")

const listingSchema = new Schema({      
    title:{
        type:String,
        required:true,
    },
    description:String,

    image: {
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
    },
    coordinates: {
        type: [Number],
        required: true,
    },
},
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }    
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await review.deleteMany({_id :{$in:listing.reviews}});
    }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;







//     image: {
//     type: String,
//     default: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
//     set: (v) => {
//         if (v === "" || v == null) {
//             return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85";
//         }
//         return v;
//     }
// },