const SessionBatch = require('../models/SessionBatch')
const Student = require('../models/Student')


exports.studentMustBeLoggedIn=function(req,res,next){
    if(req.session.user){
      if (req.session.user.accountType == "student") {
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



exports.getTodaysSubjectDetails =async function (req, res,next) {
  try{
    let today=new Date()
    let routineDetails=await SessionBatch.getSessionBatchRoutineDetailsBySessionIds([req.regNumber.slice(0,9)])
    req.todaysClasses=[]
    let dayIndex=today.getDay()-1//0,1,2,3,4,5,6
    let dateString=String(today.getDate())+String(today.getMonth()+1)+String(today.getFullYear())
    //classId=sessionId+date+dayIndex+classIndex
    if(dayIndex<=4){
      routineDetails.forEach((routineData)=>{
        if(routineData.routine){
          routineData.routine.activities[dayIndex].professors.forEach((professor,classIndex)=>{
            if(professor.regNumber!="NAN"){
              let classStatus=""
              if(classIndex=0){
                classStatus="1st"
              }else if(classIndex=1){
                classStatus="2nd"
              }else if(classIndex=2){
                classStatus="3rd"
              }else if(classIndex=3){
                classStatus="4th"
              }
              let classData={
                classId:routineData.sessionId+dateString+String(dayIndex)+String(classIndex),
                timing:routineData.routine.timings[classIndex],
                subject:routineData.routine.activities[dayIndex].subjects[classIndex],
                professorName:professor.userName,
                period:classStatus
              }
              req.todaysClasses.push(classData)
            }
          })
        }
        
      })
    }
    next()
  }catch{
      res.render('404')
  }
}


exports.studentHomePage =function (req, res) {
    try{
        res.render('student-home-page',{
          todaysClasses:req.todaysClasses
        })
    }catch{
        res.render('404')
    }
}

exports.studentLoggingIn =function (req, res) {
    try{
        let student=new Student(req.body)
        student
          .studentLoggingIn()
          .then(function () {
            req.session.user = { regNumber: student.data.regNumber, userName: student.data.userName,departmentCode:student.data.departmentCode,accountType: "student" }
            req.session.save(function () {
              res.redirect("/student-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect(`/department/${req.body.departmentCode}/details`)
            })
          })
        }catch{
        res.render('404')
    }
}