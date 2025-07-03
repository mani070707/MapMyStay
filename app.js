if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); 
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const reviews = require("./Routes/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");



const dbUrl = process.env.ATLASBD_URL;

main().then(()=>{
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err); 
});
 
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true})); //to excrated data or request 
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store =  MongoStore.create({
    mongoUrl : dbUrl ,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Error in MONGO SESSION STORE",err);
});


const sessionOptions = {
    store,
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

// app.get("/",(req,res) => {
//     res.send("Hi, I am root");
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//authenticate() Generates a function that is used in Passport's LocalStrategy
//serializeUser() Generates a function that is used by Passport to serialize users into the session
//deserializeUser() Generates a function that is used by Passport to deserialize users into the session
//static
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    //console.log(res.locals.success);
    next();
});

app.get("/demouser",async(req,res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username:"delta-student"
    });

    //it save new instance with pass , also check unique vale
    let registeredUser = await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
})


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);
 

//if koi bhi route match nhi hua to yeh chalega
app.all("*", (req,res,next) => {
    next(new ExpressError(404,"page not found"));
});

app.use((err,req,res,next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    //res.status(statusCode).send(message);
    res.render("error.ejs",{message});
})

app.listen(8080, () => {
    console.log("server is listening to part 8080");
});
 
