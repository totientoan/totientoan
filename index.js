var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.set("views","./views");
app.use(express.static("public"));
app.listen(3000);

//kết nối Mongo
//mongodb+srv://totientoan:<password>@cluster0.wpwd1.azure.mongodb.net/<dbname>?retryWrites=true&w=majority
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://totientoan:glQmUthZ4YSA4qDd@cluster0.wpwd1.azure.mongodb.net/Students?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true},function(err){
    if(err){
        console.log("Mongo connect error : " + err);
    }else{
        console.log("Mongo connected seccessful.")
    }
});

//body-parser đọc dữ liệu sau khi post lên
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// app.get("/",function(req,res){
//     res.send("hello")
// });

var Student = require("./Models/student");

//multer "vị trí lưu và tên ảnh"
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});  
//kiểm tra dung lượng, minetype lọc đuôi file
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if(file.mimetype=="image/png" || file.mimetype=="image/gif" || file.mimetype=="image/jpeg"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("studentImage");

// app.get("/",function(req, res){
//     var Toan = new Student({
//         Name : "To Tien Toan",
//         Image : "images.jpg",
//         Age : 22
//     });
//     res.json(Toan);
// });

//ta phải tạo một route GET tới trang này để user có thể truy cập vào trang này
app.get("/add", function(req, res){
    res.render("add");

});

//sau khi ấn add new post dữ liệu lên
app.post("/add", function(req, res){
    //Upload file
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          //console.log("A Multer error occurred when uploading."); 
            res.json({"kq":0, "errMsg" : "A Multer error occurred when uploading."});
        } else if (err) {
          //console.log("An unknown error occurred when uploading." + err);
          res.json({"kq":0, "errMsg" : "An unknown error occurred when uploading." + err});
        }else{
            //save Mongo res.send(req.file.filename);
            var student = Student({
                Name : req.body.txtName,
                Image : req.file.filename,
                Age : req.body.txtAge
            });
            student.save(function(err){
                if(err){
                    res.json({"kq":0, "errMsg" : err});
                }else{
                    //nhảy sang list
                    res.redirect("./list");
                }
            });
        }

    });
});

//lấy danh Sách

app.get("/list", function(req, res){
    Student.find(function(err,data){
        if(err){
            res.json({"kq": 0,"errMsg": err});
        }else{
            res.render("list",{danhsach:data});
        }
    });
});

//Edit
app.get("/edit/:id" , function(req, res){
    //lấy thông tin id gửi xang

    Student.findById(req.params.id, function(err, char){
        if(err){
            res.json({"kq": 0,"errMsg": err});
        }else{
            console.log(char);
            res.render("edit",{nhanvat:char});
        }
    }); 
});

app.post("/edit", function(req, res){
    //Check khack hang CO CHON FILE MOI KHONG?
    /*return {}/Undefined
    console.log(req.files);
    console.log(req.body);
    */
   
    //khach hang upload file moi
    //Upload file
    upload(req, res, function (err) {

        //console.log(req.body.IDchar);
        //console.log(req.file);
        if(!req.file){
            Student.updateOne({_id: req.body.IDchar}, {
                Name: req.body.txtName,
                Age: req.body.txtAge
            }, function(err){
                if(err){
                    res.json({"kq":0, "errMsg" : err});
                }else{
                    //nhảy sang list
                    res.redirect("./list");
                }
            });
        }
        else{
            if (err instanceof multer.MulterError) {
            //console.log("A Multer error occurred when uploading."); 
                res.json({"kq":0, "errMsg" : "A Multer error occurred when uploading."});
            } else if (err) {
            //console.log("An unknown error occurred when uploading." + err);
            res.json({"kq":0, "errMsg" : "An unknown error occurred when uploading." + err});
            }else{
                Student.updateOne({_id: req.body.IDchar}, {
                    Name: req.body.txtName,
                    Image: req.file.filename,
                    Age: req.body.txtAge
                }, function(err){
                    if(err){
                        res.json({"kq":0, "errMsg" : err});
                    }else{
                        //nhảy sang list
                        res.redirect("./list");
                    }
                });
            //res.json({"kq":1});
            }
        }
    });
});

//delete
app.get("/delete/:id", function(req, res){
    Student.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.json({"kq":0, "errMsg" : err});
        }else{
            //nhảy sang list
            res.redirect("../list");
        }
    });
});