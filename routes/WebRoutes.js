const express = require("express");
const router = express.Router();
const multer=require('multer');

const st=multer.diskStorage(
    {
        destination:function(req,file,cb)
        {
            cb(null,"uploads")
        },
        filename: function(req,file,cb){
            cb(null,Date.now()+"-"+file.originalname);
        }
    })
const upload=multer({storage:st})

// Home Page
// Home Page (EJS)
router.get("/", (req, res) => {
    var q="select * from addcourse"
    req.app.locals.con.query(q,function(err,result)
{
    if (err)
throw err
else
    res.render("index",{data:result});
})
});

router.get("/Home", (req, res) => {
  res.redirect("/");
});


// About
router.get("/About", (req, res) => {
    res.sendFile("kidkinder/about.html", { root: __dirname + "/.." });
});

// Classes
router.get("/Class", (req, res) => {
    res.sendFile("kidkinder/class.html", { root: __dirname + "/.." });
});

// Team
router.get("/Team", (req, res) => {
    res.sendFile("kidkinder/team.html", { root: __dirname + "/.." });
});

// Gallery
router.get("/Gallery", (req, res) => {
    res.sendFile("kidkinder/gallery.html", { root: __dirname + "/.." });
});

// Contact
router.get("/Contact", (req, res) => {
    res.sendFile("kidkinder/contact.html", { root: __dirname + "/.." });
});

// Blog pages
router.get("/Blog", (req, res) => {
    res.sendFile("kidkinder/blog.html", { root: __dirname + "/.." });
});

//adminlogin
router.get('/admin',(req,res)=>
{
    res.sendFile("kidkinder/admin.html", { root: __dirname + "/.." });
  
})

router.get("/BlogDetail", (req, res) => {
    res.sendFile("kidkinder/blogdetail.html", { root: __dirname + "/.." });
});

// Register/Login
router.get("/Register", (req, res) => {
    res.sendFile("kidkinder/register.html", { root: __dirname + "/.." });
});

router.get("/Login", (req, res) => {
    res.sendFile("kidkinder/login.html", { root: __dirname + "/.." });
});

//class joining

router.get("/joinclass", (req, res) => {
    if (!req.session.uemail) {
        return res.redirect('/login');
    }

    const E = req.session.uemail;
    const N = req.session.uname;
    const Id = req.query.id;
    const Ph = req.query.phone;
    const Cname = req.query.cname;
    const age = req.query.age_group;
    const seat = req.query.seats;
    const time = req.query.class_time;
    const fee = req.query.fee;

    const q = "SELECT * FROM joinclass WHERE student_email=? AND id=?";

    req.app.locals.con.query(q, [E, Id], (err, result) => {
        if (err) {
            return res.redirect('/?error=database_error');
        }

        if (result.length > 0) {
            return res.redirect('/?error=class_already_added');
        }

        const qt = "INSERT INTO joinclass(id,student_name,student_email,phone,class_name,age_group,seats,class_time,fee) VALUES(?,?,?,?,?,?,?,?,?)";
        const values = [Id, N, E, Ph, Cname, age, seat, time, fee];

        req.app.locals.con.query(qt, values, (err, result) => {
            if (err) {
                return res.send('insertion error');
            }
            res.redirect('/?added_successfully');
        });
    });
});


// Employee Login
router.get("/Employee", (req, res) => {
    res.sendFile("kidkinder/employee.html", { root: __dirname + "/.." });
});

// router.get("/a-dminlogin", (req, res) => {
//     res.render("admindashboard");
// });
router.get("/addcourses", (req, res) => {
    res.render('addproducts')
});

router.get('/vusers', function(req,res)
{
    if(!req.session.aemail)
       return res.redirect("/admin")
    var q="select * from register";
    req.app.locals.con.query(q,function(err,result)
{
    if(err)
        return res.redirect("Error fetching users");
    else
        return res.render('vusers',{data:result});
})
})
router.get('/venq', function(req,res)
{
    if(!req.session.aemail)
         return res.redirect("/admin");
    var q="select * from contact";
    req.app.locals.con.query(q,function(err,result)
{
    if(err)
        return res.send("There  is some error")
    else
        return res.render('venq',{data:result});
})
})
router.get("/vcourses", (req, res) => {
     if (!req.session.aemail)
        return res.redirect("/admin");

    const con = req.app.locals.con;
    const q = "SELECT * FROM addcourse";

    con.query(q, (err, result) => {
        if (err) {
            // console.log(err);
            return res.send("Error loading courses");
        }

        // Render the EJS page
        res.render("vcourses", { data: result });
    });
});
router.get("/settings", (req, res) => {
    if (!req.session.aemail)
        return res.redirect("/admin");
    const con = req.app.locals.con;

    const q = "SELECT * FROM admin";

    con.query(q, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error updating password");
        }
        res.render("settings", { data: result });
    });
});
router.get("/logout", function (req, res) {
    req.session.destroy((err) => {
        if (err) return res.send("Error logging out");

        res.redirect("/admin"); 
    });
});
router.get("/deluser", function (req, res) {
    if(req.session.aemail==null)
        res.redirect('/admin')
        else
        {
    var e=req.query.em;
var q="delete from register where Email=?";
req.app.locals.con.query(q,[e],(err,result)=>
    {
if(err)
    return res.redirect('/vusers?error=Deletion.error')
else {
    return res.redirect('/vusers');
}  
})
        }
});
router.get("/delenq", function (req, res) {
    if(req.session.aemail==null)
        res.redirect('/admin')
        else
        {
    var e=req.query.em;
var q="delete from contact where Email=?";
req.app.locals.con.query(q,[e],(err,result)=>
    {
if(err)
    return res.redirect('/venq?error=Deletion.error')
else {
    return res.redirect('/venq');
}  
})
        }
});
router.get("/delcourse", function (req, res) {
    if(req.session.aemail==null)
        res.redirect('/admin')
        else
        {
    var e=req.query.id;
var q="delete from addcourse where course_id=?";
req.app.locals.con.query(q,[e],(err,result)=>
    {
if(err)
    return res.redirect('/vcourses?error=Deletion.error')
else {
    return res.redirect('/vcourses');
}  
})
        }
});

router.post('/addcourseprocess', upload.single("course_image"), async (req, res) => {
    try {
       const Id = req.body.course_id;  
       const Name = req.body.course_name;
       const category = req.body.category;
       const agegroup = req.body.age_group;
       const totalseats = req.body.total_seats;
       const classtime = req.body.class_time;
       const tuitionfee = req.body.tuition_fee;
       const description = req.body.description;
       const image = req.file.filename;
const q = "INSERT INTO addcourse (course_id,course_name,category,age_group,total_seats,class_time,tuition_fee,description,course_image) VALUES (?, ?, ?, ?,?,?,?,?,?)";
        req.app.locals.con.query(q, [Id,Name,category,agegroup,totalseats,classtime,tuitionfee,description,image], (err, result) => {
            if (err) throw err;
            res.send("Course inserted successfully");
        });

    } catch (err) {
         console.log(err);
        res.send("Insertion error");
    }
});
//admin dashboard
router.post("/adminlogin",function(req,res)
{
     var e=req.body.Email;
    var p=req.body.Password;
   
var q="select * from admin where Email='"+e+"' "
req.app.locals.con.query(q,function(err,result)
{
    if(err) throw err;
 if(result.length===0)
     return res.send("Wrong Email");
   
    if(result[0].Password==p)
    {
        req.session.aname= result[0].Name;
        req.session.aemail=result[0].Email;
      return res.render("admindashboard")
    }
    else 
       return res.send("Invalid Password")
})
})

router.post("/settings", function (req, res) {
    var em = req.session.aemail;
    var oldPass = req.body.oldPassword;
    var newPass = req.body.newPassword;
    if (!em) 
        return res.redirect("/admin");

    const q = "UPDATE admin SET Password=? WHERE Email=? AND Password=?";

    req.app.locals.con.query(q, [newPass, em, oldPass], function (err, result) {
        if (err) throw err;

        if (result.affectedRows > 0) 
            res.send("Password is updated successfully!");
        else 
            res.send("Old password is incorrect");
    });
});

router.post('/newsletter', (req, res) => {
  const { Name, Email } = req.body;
  const sql = 'INSERT INTO newsletter (name, email) VALUES (?, ?)';
  req.app.locals.con.query(sql, [Name, Email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error subscribing');
    }
    res.send('Thank you for subscribing!');
  });
});


module.exports = router;
