const express               = require("express"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      bodyParser            = require("body-parser"),
      User                  = require("./models/user"),
      LocalStrategy         = require("passport-local").Strategy,
      passportLocalMongoose = require("passport-local-mongoose"),
      flash                 = require("connect-flash"),
      app                   = express();


const jsdom = require("jsdom");
const $ = require('jquery')(new jsdom.JSDOM().window);

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

      
//App Config

mongoose.connect("mongodb://localhost:27017/auth_demo", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

// Authorization Config
app.use(require("express-session")({
    secret: "Anything at all",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());



// =========
// Routes
// =========

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/secret",isLoggedIn,(req,res)=>{
    res.render("secret");
});

// +++++++++++
// Auth Routes
// +++++++++++

// <<REGISTER ROUTES>> //
app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secret");
        });
    });
});

// <<LOGIN/LOGOUT ROUTES>> //
app.get("/login",(req,res)=>{
    res.render("login");
});

//login logic
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: "error"
      
  })
);



//logout
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});




app.listen(process.env.PORT,process.env.IP,()=>{
    console.log("Server started...");
});