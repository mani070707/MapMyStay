const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    //owner proper so only one authorised user can edit n delete it
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});

//we made this as when we delete lisitng the review dont delete as it delete all review in that deleted listing
listingSchema.post("findoneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    } 
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
