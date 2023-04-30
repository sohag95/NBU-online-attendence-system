const Administration = require('../models/Administration')
const Department = require('../models/Department')
const Professor = require('../models/Professor')


exports.administratorMustBeLoggedIn=function(req,res,next){
    if(req.session.user){
      if (req.session.user.accountType == "administration") {
        next()
      } else {
        req.flash("errors", "You are not allowed to perform that action!!")
        req.session.save(function () {
          res.redirect("/")
        })
      }
    }else{
      req.flash("errors", "You must log-in first to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
}

exports.administrationLogInPage =function (req, res) {
    try{
        res.render('administrator-log-in-page')
    }catch{
        res.render('404')
    }
}

exports.administrationLoggingIn =function (req, res) {
    try{
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
            req.flash("error", e)
            req.session.save(function () {
              res.redirect("/administration-log-in")
            })
          })
        }catch{
        res.render('404')
    }
}

exports.administrationHomePage=async function(req,res){
    try{
        let allDepartments=await Administration.getAllDepartments()
        console.log(allDepartments)
        res.render("administration-home-page",{
          allDepartments:allDepartments
        })
    }catch{
        res.render('404')
    }
}

exports.addNewDepartment=function(req,res){
  let department = new Department(req.body)
  department
    .addNewDepartment()
    .then(() => {
      req.flash("success", "New department added successfully.")
      req.session.save(function () {
        res.redirect("/administration-home")
      })
    })
    .catch(regErrors => {
      req.flash("errors", regErrors)
      req.session.save(function () {
        res.redirect("/administration-home")
      })
    })
}


exports.departmentalHandlePage=function(req,res){
  try{
    console.log("Department Details :",req.departmentDetails)
    res.render("handle-department-page",{
      departmentDetails:req.departmentDetails
    })
  }catch{
    res.render("404")
  }
}


exports.addProfessor=function(req,res){
  console.log("Data:",req.body)
  console.log(new Date(req.body.joiningDate))
  console.log("Year :",req.body.joiningDate.slice(0,4))
  let professor = new Professor(req.body)
  professor
    .addNewProfessor()
    .then(() => {
      req.flash("success", "New professor added successfully.")
      req.session.save(function () {
        res.redirect(`/administration-handle/department/${req.body.departmentCode}`)
      })
    })
    .catch(regErrors => {
      req.flash("errors", regErrors)
      req.session.save(function () {
        res.redirect(`/administration-handle/department/${req.body.departmentCode}`)
      })
    })
}

exports.addHOD=function(req,res){
  console.log("Data:",req.body)
  Department
    .addNewHOD(req.body.joiningDate,req.professorDetails)
    .then(() => {
      req.flash("success", "New HOD added successfully.")
      req.session.save(function () {
        res.redirect(`/administration-handle/department/${req.params.departmentCode}`)
      })
    })
    .catch(regErrors => {
      req.flash("errors", regErrors)
      req.session.save(function () {
        res.redirect(`/administration-handle/department/${req.params.departmentCode}`)
      })
    })
}
