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
    let batchDetails=await SessionBatch.getBatchDetailsBySessionId(req.regNumber.slice(0,9))
    
    req.neededData={
      isBatchRunning:batchDetails.isBatchRunning,
      takenClasses:[]
    }
    if(batchDetails.isBatchRunning){
      batchDetails.presentDayActivities.classes.forEach((cls)=>{
        req.neededData.takenClasses.push(cls.classId)
      })
    }


    let routineDetails=[{
      sessionId:batchDetails.sessionId,
      routine:batchDetails.routine
    }]

    req.todaysClasses=[]
    var dayIndex=today.getDay()-1;//0,1,2,3,4,5,6
   
    let dateString=String(today.getDate())+String(today.getMonth()+1)+String(today.getFullYear())
    //classId=sessionId+date+dayIndex+classIndex
    if(dayIndex<=4){
      routineDetails.forEach((routineData)=>{
        if(routineData.routine){
          routineData.routine.activities[dayIndex].professors.forEach((professor,classIndex)=>{
            if(professor.regNumber!="NAN"){
              let classStatus=""
              if(classIndex==0){
                classStatus="1st"
              }else if(classIndex==1){
                classStatus="2nd"
              }else if(classIndex==2){
                classStatus="3rd"
              }else if(classIndex==3){
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


exports.studentHomePage =async function (req, res) {
    try{
      //console.log("Needed data:",req.neededData)
        let studentData=await Student.getStudentDetailsByRegNumber(req.regNumber)
        res.render('student-home-page',{
          todaysClasses:req.todaysClasses,
          studentData:studentData,
          neededData:req.neededData
        })
    }catch{
        res.render('404')
    }
}


exports.getStudentActivityDetailsPage = async function (req, res) {
  try{
      //get attendance data
      let attendanceInfo={
        totalActiveDays:0,
        totalClassesTaken:0,
        semesterStatus:"",
        days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        allClasses:[]
      }
      
      let studentDetails=await Student.getStudentDetailsByRegNumber(req.regNumber)
      let attendanceDetails=await Student.getStudentAttendanceDetails(req.regNumber)
      //console.log("Attendance details:",attendanceDetails,studentDetails)
      let batchActivityDetails=await SessionBatch.getSessionBatchActivityDetails(req.regNumber.slice(0,9))
      let semesterAllClasses=[]
      ////console.log("batch details:",batchActivityDetails)
      // //console.log("attendanceDetails:",attendanceDetails)
      if(studentDetails.semesterStatus=="1st"){
        attendanceInfo.semesterStatus="1st"
        semesterAllClasses=batchActivityDetails.allRecords.firstSemester
        attendanceInfo.allClasses=attendanceDetails.allClasses.firstSemester.reverse()
      }else if(studentDetails.semesterStatus=="2nd"){
        attendanceInfo.semesterStatus="2nd"
        semesterAllClasses=batchActivityDetails.allRecords.secondSemester
        attendanceInfo.allClasses=attendanceDetails.allClasses.secondSemester.reverse()
      }else if(studentDetails.semesterStatus=="3rd"){
        attendanceInfo.semesterStatus="3rd"
        semesterAllClasses=batchActivityDetails.allRecords.thirdSemester
        attendanceInfo.allClasses=attendanceDetails.allClasses.thirdSemester.reverse()
      }else if(studentDetails.semesterStatus=="4th"){
        attendanceInfo.semesterStatus="4th"
        semesterAllClasses=batchActivityDetails.allRecords.fourthSemester
        attendanceInfo.allClasses=attendanceDetails.allClasses.fourthSemester.reverse()
      }else{
        //will work later
      }
      attendanceInfo.totalActiveDays=semesterAllClasses.length
      semesterAllClasses.forEach((days)=>{
        attendanceInfo.totalClassesTaken+=days.record.classes.length
      })
      
      //console.log("Attendance info:",attendanceInfo)
      res.render("student-activity-details-page",{
        attendanceInfo:attendanceInfo
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
