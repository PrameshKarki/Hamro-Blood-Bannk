//Import modules
const path = require("path");

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session")
const mongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer=require("multer");

//Configuring multer to adjust filename and filepath
const fileStorage = multer.diskStorage({
    destination: (err, file, cb) => {
        cb(null, 'images');
    },
    filename: (err, file, cb) => {
        cb(null,file.originalname);
    }
});

//Configuring filters by MimeType
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==="image/jpeg" || file.mimetype==="image/PNG" || file.mimetype==="image/JPG"){
        cb(null,true);
    }else{
        cb(null,true);
    }
}

//Instantiate csurf
const csrfProtection = csrf();

//Import routes
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/indexRoutes");

//Import controllers
const errorController = require("./controllers/errController");
const shortid = require("shortid");

//Configuration Constants
const MONGODB_URI = "mongodb://localhost:27017/HamroBloodBank";

//Instantiate express app
const app = express();

//Set view engine
app.set("view engine", "ejs");
app.set("views", "views");

//Configuration of store
const store = new mongoDBStore({
    uri: MONGODB_URI,
    collections: "sessions"
})

//Set Session
app.use(session({
    secret: "Hamro Blood Bank!",
    resave: false,
    saveUninitialized: false,
    store: store
}))

//Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/images",express.static(path.join(__dirname, "images")));


//Set Multer
app.use(multer({storage:fileStorage}).single("image"));
//Set Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

//Set CSRF Protection
app.use(csrfProtection);

//Set Flash
app.use(flash());

//Set Locals
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
})

//Use routes
app.use(appRoutes);
app.use(authRoutes);

//404 Error Handler
app.use(errorController.get404);

//Express default error handler
// app.use((err, req, res, next) => {
//     let statusCode;
//     if (!err.httpStatusCode)
//         statusCode = 500;
//     res.status(statusCode).render("errors/500", {
//         pageTitle: "Error 500",
//         path: "/505"
//     })
// })

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser:true
}).then(() => {
    //Run server
    app.listen(process.env.PORT || 3000);

}).catch(err => {
    console.log(err);
})
