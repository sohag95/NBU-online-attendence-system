const AWSS3Bucket = require("../models/AWSS3Bucket");

exports.uploadPhoto=function(req,res){
    let awsS3Bucket=new AWSS3Bucket()
    awsS3Bucket.uploadPhoto(req.file.buffer,"checkPhoto").then(()=>{
      req.flash("success", "Photo uploaded successfully!!")
      res.redirect("/test")
    }).catch(()=>{
      req.flash("errors", "There is some problem")
      res.render("404")
    })
    
  }
  
  
exports.getPhoto=function(req,res){
    let awsS3Bucket=new AWSS3Bucket()
    awsS3Bucket.getPhoto(req.params.key).then((bodyData)=>{
      bodyData.pipe(res)
    }).catch(()=>{
      // default image url(In case of image is not uploaded)
        res.redirect("/images/sohag.jpg");
    })
    
  }
  