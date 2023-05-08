const AWSS3Bucket = require("../models/AWSS3Bucket");

exports.uploadProfilePhoto=function(req,res){
    let awsS3Bucket=new AWSS3Bucket()
    awsS3Bucket.uploadPhoto(req.file.buffer,req.regNumber).then(()=>{
      req.flash("success", "Profile photo successfully uploaded!!")
      if(req.accountType=="student"){
        res.redirect("/student-home")
      }else if(req.accountType=="professor"){
        res.redirect("/professor-home")
      }else if(req.accountType=="officialAssistant"){
        res.redirect("/official-assistant-home")
      }else{
        res.redirect("/administration-home")
      } 
    }).catch(()=>{
      req.flash("errors", "There is some problem")
      req.session.save(() => res.render("404"))
    })
  }
  
  
exports.getPhoto=function(req,res){
    let awsS3Bucket=new AWSS3Bucket()
    awsS3Bucket.getPhoto(req.params.key).then((bodyData)=>{
      bodyData.pipe(res)
    }).catch((e)=>{
      // default image url(In case of image is not uploaded)
        res.redirect("/images/defaultProfilePic.jfif");
    })
  }
  