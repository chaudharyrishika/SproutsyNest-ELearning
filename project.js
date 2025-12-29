const express = require("express")
const app = express()
const path = require('path')
const WebRoutes = require("./routes/WebRoutes");
const mysql = require("mysql");
const argon2 = require("argon2");
const session = require('express-session');

// Middleware
app.use(express.static("kidkinder"));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }    
}));
app.use(function(req,res,next)
{
    res.locals.aemail=req.session.aemail;
    res.locals.aname=req.session.aname;
    res.locals.uemail=req.session.uemail;
    res.locals.uname=req.session.uname;

    next()
})

// Database Connection
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "elearning"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL");
});

// 1️⃣ View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.con = con;
app.use("/", WebRoutes);




// ---------------------------------------------
// CONTACT FORM
// ---------------------------------------------
app.post('/contactprocess',function(req,res) 
{ var n=req.body.Name;
     var e=req.body.Email; 
     var s=req.body.Subject; 
     var m=req.body.Message; 
     var q="insert into contact values('"+n+"','"+e+"','"+s+"','"+m+"')"
    con.query(q,function(err,result)
    { if(err) throw err;
     res.send("data inserted succesfully") }) })


// ---------------------------------------------
// REGISTER (HASH PASSWORD USING ARGON2)
// ---------------------------------------------
app.post('/registerprocess', async (req, res) => {
    try {
       const Name = req.body.Name;
const Email = req.body.Email;
const PhoneNo = req.body.Phone;
const Password = req.body.Password;


        const hashedPassword = await argon2.hash(Password);

        const q = "INSERT INTO register (Name, Email, Phone, Password) VALUES (?, ?, ?, ?)";
        con.query(q, [Name, Email, PhoneNo, hashedPassword], (err, result) => {
            if (err) throw err;
            res.send("User registered successfully");
        });

    } catch (err) {
        res.send("Error hashing password");
    }
});


// ---------------------------------------------
// LOGIN (VERIFY ARGON2 HASH)
// ---------------------------------------------
app.post('/loginprocess', function (req, res) {
    const email = req.body.Email;
    const password = req.body.Password;

    const q = "SELECT * FROM register WHERE Email = ?";

    con.query(q, [email], async function (err, result) {
        if (err) throw err;

        if (result.length === 0) {
            return res.send("Wrong Email");
        }
        if(result.length>0)
            {
 const storedHash = result[0].Password;
const isValid=await argon2.verify(storedHash,password)
if(isValid)
{
    req.session.uemail=result[0].Email;
    req.session.uname=result[0].Name;
    res.redirect('/')
}
else
    res.send("invalid password")
        }
        else
            res.send("wrong email")
    });
});

// ---------------------------------------------
// EMPLOYEE LOGIN 
// ---------------------------------------------
app.post('/employeelogin',function(req,res) 
{ var e=req.body.Email;
     var p=req.body.Password;
      var q="select * from employees where Email='"+e+"' "
       con.query(q,function(err,result) {
         if(err) throw err;
         var l=result.length; 
         if(l>0){ /*result.length>0 instead of l we can do thi sdirectly too */ 
             if(result[0].Password==p) {
                 res.send("valid user") } 
         else res.send("Invalid User") }
          else res.send("Wrong Email")
         }) 
        })

// Start Server
app.listen(1000, () => {
    console.log("Server listening on 1000");
});
