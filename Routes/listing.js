const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
//isLoggedIn chack krta hai ki jo bho request bhej rha hai wo logged in hai ki nhi

const listingController = require("../controllers/listings.js")

//Create Route yahaan pr new listing banta hai aur redirect ho jata hai
router
    .route("/" )
    .get( wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));
   


//New Route
router.get("/new", isLoggedIn ,listingController.renderNewForm ); 


// delete + update + show 
router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put( isLoggedIn ,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));



//Edit Route
router.get("/:id/edit", isLoggedIn ,isOwner, wrapAsync(listingController.editListing));



module.exports = router;  
