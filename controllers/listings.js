const Listing = require("../models/listing.js")

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;  //id selection excracked
    const listing = await Listing.findById(id).populate({path: "reviews",populate: {
        path: "author"
    }}).populate("owner");//chaning owner to get owener info //populate is used for automatically replace a field in a document with the actual data from a related document
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings")
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });

};

module.exports.createListing = async (req,res,next) =>{
    //let {title,description, image, price, country, location} = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");

};

module.exports.editListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req,flash("error","Listing you requested for does not exist!")
    }

    let originalImage = listing.image.url;
    originalImage.replace("/upload", "/upload/h_100,w_50");
    res.render("listings/edit.ejs" , { listing ,originalImage});

};

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); // deconstruct
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        
        listing.image = { url ,filename }
        await listing.save();
    }
    
    req.flash("success"," Listing updated!");
    res.redirect(`/listings/${id}`);
    
};

module.exports.deleteListing = async (req,res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect("/listings");

};
