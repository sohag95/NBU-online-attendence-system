const Administration = require('../models/Administration')
const ClassAttendence = require('../models/ClassAttendence')
const Professor = require('../models/Professor')
const Department = require('../models/Department')


exports.userMustNotLoggedIn = function (req, res,next) {
  if(!req.session.user){
    next()
  }else{
    req.flash("errors", "You are already logged In.")
    req.session.save(() => res.redirect("/"))
  }
}
exports.userMustBeLoggedIn = function (req, res,next) {
  if(req.session.user){
    next()
  }else{
    req.flash("errors", "You must be logged-In to perform that action.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.logInPage =function (req, res) {
  try{
      res.render('log-in-page')
  }catch{
      res.render('404')
  }
}

exports.userLoggingIn = function (req, res,next) {
  try{
      if(req.body.userType=="admin"){
        let administration=new Administration(req.body)
        administration
          .administrationLoggingIn()
          .then(function (result) {
            req.session.user = { regNumber: administration.data.regNumber, userName: administration.data.userName,accountType: "administration" }
            req.session.save(function () {
              res.redirect("/administration-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else if(req.body.userType=="professor"){
        let professor=new Professor(req.body)
        professor
          .professorLoggingIn()
          .then(async (result)=> {
            req.session.user = { regNumber: professor.data.regNumber, userName: professor.data.userName,accountType: "professor" }
            let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode( professor.data.regNumber.slice(4,9))
            if(departmentDetails.HOD.regNumber==professor.data.regNumber){
                req.session.user.isHOD=true
            }else{
                req.session.user.isHOD=false
            }
            req.session.save(function () {
              res.redirect("/professor-home")
            })
          })
          .catch(function (e) {
            console.log("E val:",e)
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect('/log-in')
            })
          })
      }else{
        req.flash("errors", "User type has not matched!!")
        req.session.save(function () {
          res.redirect('/log-in')
        })
      }
    }catch{
      res.render('404')
  }
}

exports.loggingOut = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.guestHomePage =async function (req, res) {
  try{
      let attendanceData=await Administration.getAttendanceCountData()
      let presentStudents
      let presentProfessors
      let date
      let fullAttendanceBatches=[]
      if(attendanceData.isCampusOpen){
        presentStudents=Math.round((attendanceData.presentDayAttendance.students/attendanceData.allStudents)*100)
        presentProfessors=Math.round((attendanceData.presentDayAttendance.professors/attendanceData.allProfessors)*100)
        fullAttendanceBatches=attendanceData.presentDayAttendance.fullAttendanceBatches
        date=new Date()
      }else{
        presentStudents=Math.round((attendanceData.lastDayAttendance.students/attendanceData.allStudents)*100)
        presentProfessors=Math.round((attendanceData.lastDayAttendance.professors/attendanceData.allProfessors)*100)
        fullAttendanceBatches=attendanceData.lastDayAttendance.fullAttendanceBatches
        date=attendanceData.lastDayAttendance.date
      }
      attendanceData={
        isCampusOpen:attendanceData.isCampusOpen,
        presentStudents:presentStudents,
        presentProfessors:presentProfessors,
        fullAttendanceBatches:fullAttendanceBatches,
        date:date,
        totalStudents:attendanceData.allStudents,
        totalProfessors:attendanceData.allProfessors
      }
      console.log("Attendance Data:",attendanceData)
      res.render('guestHome-page',{
        attendanceData:attendanceData
      })
  }catch{
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
      if(classDetails){
        req.classDetails=classDetails
        next()
      }else{
        res.render("404")
      }
      
  }catch{
      res.render("404")
  }
}
exports.getClassDetailsPage = function (req, res) {
  try{
      console.log("Class Details:",req.classDetails)
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
      let date=new Date()
      res.render('test-page',{
        date:date
      })
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