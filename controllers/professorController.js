const ClassAttendence = require('../models/ClassAttendence')
const Department = require('../models/Department')
const Professor = require('../models/Professor')
const SessionBatch = require('../models/SessionBatch')

exports.getProfessorDetails =async function (req, res,next) {
    try{
        let professorDetails=await Professor.getProfessorDetailsByRegNumber(req.body.regNumber)
        if(professorDetails){
            req.professorDetails=professorDetails
            console.log("professor details:",req.professorDetails)
            next()
        }else{
            req.flash("errors", "Professor does not exists.")
            res.render('404')
        }
    }catch{
        req.flash("errors", "There is some problem.")
        res.render('404')
    }
}

exports.ifProfessorExists =async function (req, res,next) {
    try{
        let professorDetails=await Professor.getProfessorDetailsByRegNumber(req.params.regNumber)
        if(professorDetails){
            req.professorDetails=professorDetails
            console.log("professor details:",req.professorDetails)
            next()
        }else{
            req.flash("errors", "Professor does not exists.")
            res.render('404')
        }
    }catch{
        res.render('404')
    }
}


exports.professorMustBeLoggedIn=function(req,res,next){
    if(req.session.user){
      if (req.session.user.accountType == "professor") {
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





exports.getProfessorDepartmentDetails =async function (req, res,next) {
  try{
      let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.regNumber.slice(4,9))
      req.neededData={
        isDepartmentRunning:departmentDetails.isDepartmentRunning,
        isProfessorPresent:false,
        takenClasses:[]
      }
      if(departmentDetails.isDepartmentRunning){
        departmentDetails.presentDayActivities.professors.forEach((professor)=>{
          if(professor.regNumber==req.regNumber){
            req.neededData.isProfessorPresent=true
          }
        })
        departmentDetails.presentDayActivities.classes.forEach((cls)=>{
          req.neededData.takenClasses.push(cls.classId)
        })
      }
      req.runningSessionBatches=departmentDetails.runningSessionBatches.map((session)=>{
        return session.sessionId
      })
      
      next()
  }catch{
      res.render('404')
  }
}



exports.getTodaysSubjectDetails =async function (req, res,next) {
  try{
    let today=new Date()
    let routineDetails=await SessionBatch.getSessionBatchRoutineDetailsBySessionIds(req.runningSessionBatches)
    req.todaysClasses=[]
    var dayIndex=today.getDay()-1//0,1,2,3,4,5,6
    let dateString=String(today.getDate())+String(today.getMonth()+1)+String(today.getFullYear())
    //classId=sessionId+date+dayIndex+classIndex
    if(dayIndex<=4 && dayIndex>=0){
      routineDetails.forEach((routineData)=>{
        if(routineData.routine){
          routineData.routine.activities[dayIndex].professors.forEach((professor,classIndex)=>{
            
            if(professor.regNumber==req.regNumber){
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
                semesterStatus:routineData.semesterStatus,
                period:classStatus
              }
              req.todaysClasses.push(classData)
            }
          })
        }
        
      })
    }
    //console.log("Todays Classes:",req.todaysClasses)
    next()
    }catch{
      console.log("I am from here sohag")
      res.render('404')
  }
}



exports.professorHomePage =async function (req, res) {
  try{
      
      let professorData=await Professor.getProfessorDetailsByRegNumber(req.regNumber)
      res.render('professor-home-page',{
        professorData:professorData,
        todaysClasses:req.todaysClasses,
        neededData:req.neededData
      })
  }catch{
      res.render('404')
  }
}

exports.getProfessorActivityDetailsPage = async function (req, res) {
  try{
      res.render("professor-activity-details-page")
  }catch{
      res.render('404')
  }
}

exports.isClassValidOrNot =async function (req, res,next) {
  try{
   let sessionId=req.params.classId.slice(0,9)
    let batchDetails=await SessionBatch.getBatchDetailsBySessionId(sessionId)
    //console.log("batchDetails:",batchDetails)
    req.batchDetails=batchDetails
    let today=new Date()
    let dateString=String(today.getDate())+String(today.getMonth()+1)+String(today.getFullYear())
    let startIndex=9
    let endIndex=startIndex+dateString.length
    //classId=sessionId+date+dayIndex+classIndex
      let classId=req.params.classId
      if(classId.slice(startIndex,endIndex)==dateString){
        let sessionId=classId.slice(0,9)
        let dayIndex=Number(classId.slice(-2,-1))
        let classIndex=Number(classId.slice(-1))
        let batchDetails=await SessionBatch.getBatchDetailsBySessionId(sessionId)
        if(batchDetails){
          req.batchDetails=batchDetails
          let validProfessor=false
          if(batchDetails.routine){
            let professorRegNumber=batchDetails.routine.activities[dayIndex].professors[classIndex].regNumber
            if(professorRegNumber==req.regNumber){
              validProfessor=true
            }
          }
          if(validProfessor){
            next()
          }else{
            req.flash("errors", "Invalid class access detected.")
            req.session.save(function () {
              res.redirect("/professor-home")
            })
          } 
        }else{
          req.flash("errors", "Class Id modification detected!!.")
          req.session.save(function () {
            res.redirect("/professor-home")
          })
        } 
      }else{
        req.flash("errors", "Class Id manipulation detected.")
        req.session.save(function () {
          res.redirect("/professor-home")
        })
      }
           
  }catch{
    console.log("i am here")
      res.render('404')
  }
}

exports.getClassDetails =function (req, res,next) {
  try{
    let batchDetails=req.batchDetails
    let classId=req.params.classId
    let dayIndex=Number(classId.slice(-2,-1))
    let classIndex=Number(classId.slice(-1))
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
    req.classData={
      classId:classId,
      departmentName:batchDetails.departmentName,
      departmentCode:batchDetails.departmentCode,
      semesterStatus:batchDetails.semesterStatus,
      timing:batchDetails.routine.timings[classIndex],
      subject:batchDetails.routine.activities[dayIndex].subjects[classIndex],
      professor:batchDetails.routine.activities[dayIndex].professors[classIndex],
      period:classStatus
    }
    next()
  }catch{
    console.log("I am from classData")
    res.render('404')
  }
}

exports.getClassAttendencePage =function (req, res) {
  try{
      //console.log("ClassData:",req.classData)
      let takenClassesIds=req.batchDetails.presentDayActivities.classes.map((cls)=>{
        return cls.classId
      })
      res.render('class-attendence-page',{
        batchDetails:req.batchDetails,
        classData:req.classData,
        takenClassesIds:takenClassesIds
      })
  }catch{
      res.render('404')
  }
}

exports.submitClassAttendence =function (req, res) {
  try{
      let data={
        classData:req.classData,
        presentStudents:JSON.parse(req.body.selectedStudents)
      }
      let newAttendenceLists={
        newStudentsCount:0,
        onBatch:req.batchDetails.presentDayActivities.students,
      }
      
      let previousPresentStudents=req.batchDetails.presentDayActivities.students
      
      data.presentStudents.forEach((student)=>{
        let present=false
        previousPresentStudents.forEach((stu)=>{
          if(student.regNumber==stu.regNumber){
            present=true
          }
        })
        if(!present){
          newAttendenceLists.onBatch.push(student)
          newAttendenceLists.newStudentsCount+=1
        }
      })
      
      let classAttendence=new ClassAttendence(data,newAttendenceLists)
      classAttendence.submitClassAttendence().then(()=>{
        req.flash("success", "Attendence successfully taken.")
        req.session.save(function () {
         res.redirect(`/class/${req.params.classId}/take-attendence`)
        })
      }).catch((e)=>{
        req.flash("errors", e)
        res.redirect(`/class/${req.params.classId}/take-attendence`)
      })
  }catch{
      res.render('404')
  }
}









