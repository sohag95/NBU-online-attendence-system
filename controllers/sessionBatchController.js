const SessionBatch = require('../models/SessionBatch')

exports.ifSessionBatchExists =async function (req, res,next) {
    try{
        let batchDetails=await SessionBatch.getBatchDetailsBySessionId(req.params.sessionId)
        if(batchDetails){
            req.batchDetails=batchDetails
            next()
        }else{
            res.render("404")
        }
    }catch{
        res.render('404')
    }
}

exports.isSessionIdValid = function (req,res,next) {
    let validSesssionBatch=false
    req.departmentDetails.runningSessionBatches.forEach((batch)=>{
        if(batch.sessionId==req.body.sessionId){
            validSesssionBatch=true
        }
    })   
    if(validSesssionBatch){
        next()
    }else{
        req.flash("errors", "Session batch is not running Or data has been manipulated!!")
        res.render('404')
    }
}

exports.getBatchDetailsPage =function (req, res) {
    try{
        let days=["Monday","Tuesday","Wednesday","Thursday","Friday"]
        let presentStudentsRegs=[]
        if(req.batchDetails.isBatchRunning){
            req.batchDetails.presentDayActivities.students.forEach((student)=>{
                presentStudentsRegs.push(student.regNumber)
            })
        }
        //-----attendance related data-----
        let presentStudents
        let date
        if(req.batchDetails.isBatchRunning){
            presentStudents=Math.round((req.batchDetails.presentDayActivities.students.length/req.batchDetails.allPresentStudents.length)*100)
            date=new Date()
        }else{
            presentStudents=Math.round((req.batchDetails.lastDayActivities.students.length/req.batchDetails.allPresentStudents.length)*100)
            date=req.batchDetails.lastDayActivities.date
        }
        attendanceData={
            presentStudents:presentStudents,
            date:date,
        }
        console.log("Attendance Data:",attendanceData)
        //------------------------------------------
        res.render('session-batch-details',{
            batchDetails:req.batchDetails,
            presentStudentsRegs:presentStudentsRegs,
            attendanceData:attendanceData,
            days:days
        })
    }catch{
        res.render('404')
    }
}

exports.getCreateRoutinePage =function (req, res) {
    try{
        let days=["Monday","Tuesday","Wednesday","Thursday","Friday"]
        req.batchDetails.allProfessors=req.departmentDetails.allProfessors
        console.log("batch:",req.batchDetails)
        res.render('create-new-routine-page',{
            batchDetails:req.batchDetails,
            days:days
        })
    }catch{
        res.render('404')
    }
}

exports.addRoutineInitialData =function (req, res) {
    try{
        console.log("body data:",req.body)
        let sessionBatch=new SessionBatch(req.body)
        sessionBatch.addInitialRoutineData(req.body.sessionId).then(()=>{
            req.flash("success", "Initial routine data added successfully.")
            req.session.save(function () {
              res.redirect(`/create/${req.params.departmentCode}/${req.params.sessionId}/routine`)
            })
        }).catch((e)=>{
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect(`/create/${req.params.departmentCode}/${req.params.sessionId}/routine`)
            })
        })
    }catch{
        res.render('404')
    }
}
exports.addRoutineDayActivity =function (req, res) {
    try{
        console.log("body data:",req.body)
        let sessionBatch=new SessionBatch(req.body)
        sessionBatch.addRoutineDayActivity(req.body.sessionId,req.departmentDetails.allProfessors).then(()=>{
            req.flash("success", "Routine data added successfully.")
            req.session.save(function () {
              res.redirect(`/create/${req.params.departmentCode}/${req.params.sessionId}/routine`)
            })
        }).catch((e)=>{
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect(`/create/${req.params.departmentCode}/${req.params.sessionId}/routine`)
            })
        })
    }catch{
        res.render('404')
    }
}

exports.getBatchActivityDetailsPage = async function (req, res) {
    try{
        let batchActivityInfo={
            semesterStatus:"",
            semesterClassRecords:[],
            days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        }
        let batchDetails={
            sessionId:req.batchDetails.sessionId,
            sessionYear:req.batchDetails.sessionYear,
            departmentName:req.batchDetails.departmentName,
            semesterStatus:req.batchDetails.semesterStatus
        }
        let semesterStatus=req.batchDetails.semesterStatus
        let batchActivityDetails=await SessionBatch.getSessionBatchActivityDetails(req.batchDetails.sessionId)
        if(semesterStatus=="1st"){
            batchActivityInfo.semesterStatus="1st"
            batchActivityInfo.semesterClassRecords=batchActivityDetails.allRecords.firstSemester
        }else if(semesterStatus=="2nd"){
            batchActivityInfo.semesterStatus="2nd"
            batchActivityInfo.semesterClassRecords=batchActivityDetails.allRecords.secondSemester
        }else if(semesterStatus=="3rd"){
            batchActivityInfo.semesterStatus="3rd"
            batchActivityInfo.semesterClassRecords=batchActivityDetails.allRecords.thirdSemester
        }else if(semesterStatus=="4th"){
            batchActivityInfo.semesterStatus="4th"
            batchActivityInfo.semesterClassRecords=batchActivityDetails.allRecords.forthSemester
        }else{
            //will work later
        }
        console.log("batchData:",batchActivityInfo)
        res.render("session-batch-activity-details-page",{
            batchActivityInfo:batchActivityInfo,
            batchDetails:batchDetails
        })
    }catch{
        res.render('404')
    }
}