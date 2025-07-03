const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

const {reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) =>{
    
    if(!req.isAuthenticated()){

        //this id for when we want access anyhting->login page -> same page u accesing not the all listing
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

//session se url save krana se local mai save kerana
module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    //permision check
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//function for post req
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { convert: true });
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { convert: true });  // ✅ Fix: Added convert:true
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }
    next();
};


module.exports.isReviewAuthor = async(req,res,next) => {
    let { id , reviewId } = req.params;
    let review = await Review.findById(reviewId);
    //permision check
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
