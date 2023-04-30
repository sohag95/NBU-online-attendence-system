const Administration = require('../models/Administration')
const ClassAttendence = require('../models/ClassAttendence')
const Department = require('../models/Department')
const User = require('../models/User')


exports.userMustNotLoggedIn = function (req, res,next) {
  if(!req.session.user){
    next()
  }else{
    req.flash("errors", "You are already logged In.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.loggingOut = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.guestHomePage =async function (req, res) {
  try{
      res.render('guestHome-page')
  }catch{
      console.log("There is some problem")
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.getAllDepartments =async function (req, res) {
  try{
    let allDepartments=await Administration.getAllDepartments()
    res.render('all-departments',{
      allDepartments:allDepartments
    })
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.isClassExists =async function (req, res,next) {
  try{
      let classDetails=await ClassAttendence.getClassDetailsByClassId(req.params.classId)
      req.classDetails=classDetails
      next()
  }catch{
      res.render("404")
  }
}
exports.getClassDetailsPage = function (req, res) {
  try{
      res.render('class-details-page',{
        classDetails:req.classDetails
      })
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }
}


//##################--DUMMY CODES BELOW--###################
exports.test = function (req, res) {
    try{
      res.render('test-page')
    }catch{
      req.flash("errors", "There is some problem.")
      req.session.save(() => res.redirect("/"))
    }
}



//Calling function to sent email
//const SentEmail = require('../models/SentEmail')
// let sentEmail=new SentEmail()
// await sentEmail.sendingToSingleAccountType("roysohag95@gmail.com")
// await sentEmail.sendingToMultipleAccountType(["roysohag95@gmail.com"])
// console.log("email sent successfully!")