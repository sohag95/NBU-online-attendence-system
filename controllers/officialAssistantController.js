const Administration = require('../models/Administration')
const Department = require('../models/Department')


exports.officialAssistantMustBeLoggedIn=function(req,res,next){
    if(req.session.user){
      if (req.session.user.accountType == "officialAssistant") {
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

exports.officialAssistantLogIn = function (req, res) {
    try{
      
        //regNumber=departmentCode for offitial assistant
        let assistantData=req.departmentDetails.departmentOfficial
        console.log("Data:",req.body)
        console.log("assistantData Details:",assistantData)
      if(assistantData.email==req.body.email && assistantData.password==req.body.password){
        req.session.user = { regNumber:req.departmentDetails.departmentCode, userName: assistantData.userName,accountType: "officialAssistant" }
        req.session.save(function () {
          res.redirect("/official-assistant-home")
        })
      }else{
        req.flash("errors", "Invalid email/password!!")
        req.session.save(function () {
          res.redirect(`/department/${req.body.departmentCode}/details`)
        })
      }
    }catch{
      req.flash("errors", "There is some problem.")
      req.session.save(() => res.redirect(`/department/${req.body.departmentCode}/details`))
    }
}

exports.getOfficialAssistantHome =async function (req, res) {
    try{
    
      //offitial Assistant's : regNumber="departmentCode"
      let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.regNumber)
      let departmentalDetails={
          departmentCode:departmentDetails.departmentCode,
          departmentName:departmentDetails.departmentName,
          allProfessors:departmentDetails.allProfessors,
          isDepartmentRunning:departmentDetails.isDepartmentRunning,
          todaysPresentProfessors:departmentDetails.presentDayActivities.professors,
          assistantEmail:departmentDetails.departmentOfficial.email
      } 
      let presentProfessors=[]
      if(departmentDetails.isDepartmentRunning){
        departmentalDetails.todaysPresentProfessors.forEach((professor)=>{
          presentProfessors.push(professor.regNumber)
        })
      } 
      console.log("Department:",departmentalDetails)

      res.render("official-assistant-home-page",{
        departmentDetails:departmentalDetails,
        presentProfessors:presentProfessors
      })
    }catch{
     res.render(404)
    }
}


exports.checkPreOpeningData = function (req, res,next) {
    if(req.regNumber==req.departmentDetails.departmentCode){
      if(!req.departmentDetails.isDepartmentRunning){
        next()
      }else{
        req.flash("errors", "Department has already opened.")
        req.session.save(() => res.redirect("/official-assistant-home"))
      }
    }else{
      req.flash("errors", "You have no permission to open other departent.")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
}

exports.checkPreClosingData = function (req, res,next) {
  if(req.regNumber==req.departmentDetails.departmentCode){
    if(req.departmentDetails.isDepartmentRunning){
      next()
    }else{
      req.flash("errors", "Department has already closed.")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
  }else{
    req.flash("errors", "You have no permission to open other departent.")
    req.session.save(() => res.redirect("/official-assistant-home"))
  }
}


exports.checkPreAttendanceData = function (req, res,next) {
  if(req.regNumber==req.departmentDetails.departmentCode){
    if(req.departmentDetails.isDepartmentRunning){
      let professorPresent=false
      req.departmentDetails.allProfessors.forEach((professor)=>{
        if(professor.regNumber==req.body.regNumber && professor.userName==req.body.userName){
          professorPresent=true
        }
      })
      if(professorPresent){
        let notAdded=true
        req.departmentDetails.presentDayActivities.professors.forEach((professor)=>{
          if(professor.regNumber==req.body.regNumber){
            notAdded=false
          }
        })
        if(notAdded){
          next()
        }else{
          req.flash("errors", "Professor's attendance has already been taken.")
          req.session.save(() => res.redirect("/official-assistant-home"))
        }

      }else{
        req.flash("errors", "Professor has not found.")
        req.session.save(() => res.redirect("/official-assistant-home"))  
      }
    }else{
      req.flash("errors", "Department should open first to take attendance.")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
  }else{
    req.flash("errors", "You have no permission to access other department.")
    req.session.save(() => res.redirect("/official-assistant-home"))
  }
}

exports.checkPreAttendanceUndoData = function (req, res,next) {
  if(req.regNumber==req.departmentDetails.departmentCode){
    if(req.departmentDetails.isDepartmentRunning){
        let present=false
        req.departmentDetails.presentDayActivities.professors.forEach((professor)=>{
          if(professor.regNumber==req.body.regNumber){
            present=true
          }
        })
        if(present){
          next()
        }else{
          req.flash("errors", "Professor's is not present.")
          req.session.save(() => res.redirect("/official-assistant-home"))
        }
    }else{
      req.flash("errors", "Department should open first to undo attendance.")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
  }else{
    req.flash("errors", "You have no permission to access other department.")
    req.session.save(() => res.redirect("/official-assistant-home"))
  }
}

exports.openingDepartment = function (req, res) {
  try{
    let runningBatchesIds=req.departmentDetails.runningSessionBatches.map((batch)=>{
      return batch.sessionId
    })
    console.log("Running batches:",runningBatchesIds)
    if(req.body.open.toLowerCase()=="open"){
      Department.openingDepartment(req.regNumber,runningBatchesIds).then(()=>{
        req.flash("success", "Department opened successfully!!")
        req.session.save(() => res.redirect("/official-assistant-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/official-assistant-home"))    
      })
    }else{
      req.flash("errors", "You have to type 'open' to opening the departmental activity!")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
  }catch{
    res.render("404")
  }
}

exports.closingDepartment =async function (req, res) {
  try{
    if(req.body.close.toLowerCase()=="close"){
      let runningSessionYear=await Administration.getPresentSessionYear()
      let departmentData={
        presentProfessors:req.departmentDetails.presentDayActivities.professors,
        presentDayActivities:req.departmentDetails.presentDayActivities,
        runningSessionBatches:req.departmentDetails.runningSessionBatches
      }
      Department.closingDepartment(req.regNumber,departmentData,runningSessionYear).then(()=>{
        req.flash("success", "Department closed successfully!!")
        req.session.save(() => res.redirect("/official-assistant-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/official-assistant-home"))    
      })
    }else{
      req.flash("errors", "You have to type 'close' to closing the departmental activity!")
      req.session.save(() => res.redirect("/official-assistant-home"))
    }
  }catch{
    res.render("404")
  }
}

exports.professorAttendance = function (req, res) {
  try{
    Department.takeProfessorAttendance(req.regNumber,req.body).then(()=>{
        req.flash("success", "Professor's attendance added successfully!!")
        req.session.save(() => res.redirect("/official-assistant-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/official-assistant-home"))    
      })
    
  }catch{
    res.render("404")
  }
}

exports.professorAttendanceUndo = function (req, res) {
  try{
    let newAttendanceList=req.departmentDetails.presentDayActivities.professors.filter((professor)=>{
      if(professor.regNumber!=req.body.regNumber){
        return professor
      }
    })
    Department.undoProfessorAttendance(req.regNumber,newAttendanceList).then(()=>{
        req.flash("success", "Professor's attendance undo successfully!!")
        req.session.save(() => res.redirect("/official-assistant-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem.Try again..")
        req.session.save(() => res.redirect("/official-assistant-home"))    
      })
    
  }catch{
    res.render("404")
  }
}