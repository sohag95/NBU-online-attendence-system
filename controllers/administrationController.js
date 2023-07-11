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


exports.administrationHomePage=async function(req,res){
    try{
        let data=await Administration.getAdminHomeData()
        let isCampusOpen=await Administration.getIsCampusOpen()
        //console.log("isCampusOpen:",isCampusOpen)
        res.render("administration-home-page",{
          data:data,
          isCampusOpen:isCampusOpen
        })
    }catch{
        res.render('404')
    }
}

exports.openingCampus =async function (req, res) {
  try{
    if(req.body.open.toLowerCase()=="open"){
      Administration.openingCampus().then(()=>{
        req.flash("success", "Campus opened successfully!!")
        req.session.save(() => res.redirect("/administration-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/administration-home"))    
      })
    }else{
      req.flash("errors", "You have to type 'open' to opening the campus activity!")
      req.session.save(() => res.redirect("/administration-home"))
    }
  }catch{
    res.render("404")
  }
}

exports.closingCampus =async function (req, res) {
  try{
    if(req.body.close.toLowerCase()=="close"){
      Administration.closingCampus().then(()=>{
        req.flash("success", "Campus closed successfully!!")
        req.session.save(() => res.redirect("/administration-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/administration-home"))    
      })
    }else{
      req.flash("errors", "You have to type 'close' to closing the campus activity!")
      req.session.save(() => res.redirect("/administration-home"))
    }
  }catch{
    res.render("404")
  }
}

exports.addNewDepartment=function(req,res){
  let department = new Department(req.body)
  department
    .addNewDepartment()
    .then(() => {
      req.flash("success", "New department added successfully.Please add professors and HOD.")
      req.session.save(function () {
        res.redirect(`/administration-handle/department/${req.body.departmentCode.toUpperCase()}`)
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
    //console.log("Department Details :",req.departmentDetails)
    req.departmentDetails.departmentOfficial=null
    res.render("handle-department-page",{
      departmentDetails:req.departmentDetails
    })
  }catch{
    res.render("404")
  }
}


exports.addProfessor=function(req,res){
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
  //console.log("Data:",req.body)
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

exports.addNewSessionYear=function(req,res){

  Administration
    .addNewSessionYear(req.body)
    .then(() => {
      req.flash("success", "New session-year added successfully.")
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
