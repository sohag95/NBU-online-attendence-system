const sessionBatchCollection = require("../db").db().collection("Session_Batches")
const sessionBatchActivityCollection = require("../db").db().collection("Session_Batch_Activities")

const departmentsCollection = require("../db").db().collection("Departments")

const Department = require("./Department")
const IdCreation = require('./IdCreation')

let SessionBatch=function(data){ 
    this.data=data
    this.errors=[]
    this.sessionBatchActivities
}

SessionBatch.prototype.dataPreparation=function(){
    return new Promise(async (resolve, reject) => {
        try{
            //get professor regNumber
            let sessionId= IdCreation.createSessionBatchId(this.data)
            let allSubjects=this.data.allSubjects.split(",")
            this.data={
                sessionId:sessionId,
                sessionYear:this.data.startYear+"-"+this.data.endYear,
                departmentName:this.data.departmentName,
                departmentCode:this.data.departmentCode,
                semesterStatus:this.data.semesterStatus,//1st,2nd,3rd,4th,completed
                allSubjects:allSubjects,
                routine:null,
                allPresentStudents:[],
                presentDayActivities:{
                  students:[],
                  classes:[]
                },
                lastDayActivities:{
                  students:[],
                  classes:[],
                  date:new Date()
                },
                sessionCreatedDate:new Date(),
                studentSerialNumber:0,
                isBatchRunning:false
            }
            this.sessionBatchActivities={
              sessionId:this.data.sessionId,
              allRecords:{
                firstSemester:[],
                secondSemester:[],
                thirdSemester:[],
                fourthSemester:[]
              }
            }
            resolve()
        }catch{
          //console.log("I am here")
            this.errors.push("Sorry,there is some problem!")
            reject()
          }
        })

}


SessionBatch.prototype.validate=function(){
    return new Promise(async (resolve, reject) => {
      try{
        
        // if (this.data.startYear == "") {
        //   this.errors.push("You must provide session starting year.")
        // }
        
        if (this.data.sessionId.length !=9) {
          this.errors.push("You may provided wrong data.")
        }
        
          if(this.data.sessionId){
            let sessionExists = await sessionBatchCollection.findOne({sessionId:this.data.sessionId})
            if (sessionExists) {
                this.errors.push("The session has already added.")
            }
          }
          resolve()
          
      }catch{
        //console.log("This code is running2")
        this.errors.push("Sorry,there is some problem!")
        reject()
      }
    })
}
SessionBatch.prototype.addNewSessionBatch=function(){
    return new Promise(async (resolve, reject) => {
      try{
        // Step #1: Validate user data
        await this.dataPreparation()
        await this.validate()
        if (!this.errors.length) {
            //add session on sessionBatch table
            await sessionBatchCollection.insertOne(this.data)
            await sessionBatchActivityCollection.insertOne(this.sessionBatchActivities)
            //add sessionId on departmental page
            let batchData={
              sessionId:this.data.sessionId,
              semesterStatus:this.data.semesterStatus
            }
            //await Department.addSessionOnDepartmentAsCurrentBatch(batchData,this.data.departmentCode)
            await departmentsCollection.updateOne(
              {departmentCode:this.data.departmentCode},
              {
                $push:{
                  "runningSessionBatches":batchData
                }
              }
            )
            resolve(this.data.sessionId)
        } else {
            reject(this.errors)
        }
      }catch{
      
        reject("There is some problem!")
      }
    })
  }
  
  SessionBatch.prototype.routineDataValidate=function(){
    if (!(this.data.maxSlots == "3" || this.data.maxSlots == "4")) {
      this.errors.push("Maximum time slots should be 3 or 4")
    }
    if(this.data.maxSlots=="3"){
      if (this.data.firstClass=="") {
        this.errors.push("You must provide first class timing!")
      }
      if (this.data.secondClass=="") {
        this.errors.push("You must provide second class timing!")
      }
      if (this.data.thirdClass=="") {
        this.errors.push("You must provide third class timing!")
      }
    }else{
      if (this.data.fourthClass=="") {
        this.errors.push("You must provide fourth class timing!")
      }
    }
  }

  SessionBatch.prototype.routineDataPrepare=function(){
    let timings=[]
    if(this.data.maxSlots=="3"){
      timings=[this.data.firstClass,this.data.secondClass,this.data.thirdClass]
    }
    if(this.data.maxSlots=="4"){
      timings=[this.data.firstClass,this.data.secondClass,this.data.thirdClass,this.data.fourthClass]
    }
    this.data={
      slotsPerDay:this.data.maxSlots,
      timings:timings,
      activities:[]
    }
  }


  SessionBatch.prototype.addInitialRoutineData=function(sessionId){
    return new Promise(async (resolve, reject) => {
      try{
        // Step #1: Validate user data
        this.routineDataValidate()
        this.routineDataPrepare()
        if (!this.errors.length) {
            //add session on sessionBatch table
            await sessionBatchCollection.updateOne(
              {sessionId:sessionId},
              {
                $set:{
                  "routine":this.data
                }
              }
            )
            //console.log("Data:",this.data)
            resolve()
        } else {
            reject(this.errors)
        }
      }catch{
      
        reject()
      }
    })
  }


  SessionBatch.prototype.routineDayActivityValidate=function(){
    if (!(this.data.slotsPerDay == "3" || this.data.slotsPerDay == "4")) {
      this.errors.push("Maximum time slots should be 3 or 4.Data may corrupted")
    }
    if(this.data.slotsPerDay=="3"){
      if (this.data.firstClass=="") {
        this.errors.push("You must provide first class timing!")
      }
      if (this.data.secondClass=="") {
        this.errors.push("You must provide second class timing!")
      }
      if (this.data.thirdClass=="") {
        this.errors.push("You must provide third class timing!")
      }
      if (this.data.firstProfessor=="") {
        this.errors.push("You must provide first class professor timing!")
      }
      if (this.data.secondProfessor=="") {
        this.errors.push("You must provide second class professor timing!")
      }
      if (this.data.thirdProfessor=="") {
        this.errors.push("You must provide third class professor timing!")
      }
    }else{
      if (this.data.fourthClass=="") {
        this.errors.push("You must provide fourth class timing!")
      }
      if (this.data.fourthProfessor=="") {
        this.errors.push("You must provide fourth class professor timing!")
      }
    }
  }

  SessionBatch.prototype.routineDayActivityPrepare=function(allProfessors){
    let subjects=[]
    let professorsReg=[]
    let professors=[]
    
    if(this.data.slotsPerDay=="3"){
      subjects=[this.data.firstClass,this.data.secondClass,this.data.thirdClass]
      professorsReg=[this.data.firstProfessor,this.data.secondProfessor,this.data.thirdProfessor]
      
    }
    if(this.data.slotsPerDay=="4"){
      professorsReg=[this.data.firstProfessor,this.data.secondProfessor,this.data.thirdProfessor,this.data.fourthProfessor]
      subjects=[this.data.firstClass,this.data.secondClass,this.data.thirdClass,this.data.fourthClass]
    }

    professorsReg.forEach((regNumber)=>{
      let data
      if(regNumber=="NAN"){
        data={
          regNumber:"NAN",
          userName:"---"
        }
      }else{
        let userName
        allProfessors.forEach((professor)=>{
          if(regNumber==professor.regNumber){
            userName=professor.userName
          }
        })
        data={
          regNumber:regNumber,
          userName:userName
        }
      }
      professors.push(data)

    })
    
    this.data={
      subjects:subjects,
      professors:professors
    }
  }
  SessionBatch.prototype.addRoutineDayActivity=function(sessionId,allProfessors){
    return new Promise(async (resolve, reject) => {
      try{
        // Step #1: Validate user data
        this.routineDayActivityValidate()
        this.routineDayActivityPrepare(allProfessors)
        if (!this.errors.length) {
            //add session on sessionBatch table
            await sessionBatchCollection.updateOne(
              {sessionId:sessionId},
              {
                $push:{
                  "routine.activities":this.data
                }
              }
            )
            //console.log("Data:",this.data)
            resolve()
        } else {
            reject(this.errors)
        }
      }catch{
      
        reject()
      }
    })
  }

  SessionBatch.increaseStudentSerialNumber=function(sessionId){
    return new Promise(async(resolve, reject) => {
      try {
        await sessionBatchCollection.updateOne(
          { sessionId: sessionId },
          {
            $inc: {
              studentSerialNumber: 1
            }
          }
        )
        resolve()
      } catch {
        reject()
      }
    })
  }

  SessionBatch.getBatchDetailsBySessionId=function(sessionId){
    return new Promise(async (resolve, reject) => {
      try{
          let batchDetails=await sessionBatchCollection.findOne({sessionId:sessionId}) 
          resolve(batchDetails)
      }catch{
        reject()
      }
    })
  }

  SessionBatch.addStudentOnSessionBatch = function (sessionId,studentData) {
    return new Promise(async(resolve, reject) => {
      try{
        await sessionBatchCollection.updateOne(
          {sessionId:sessionId},
          {
            $push:{
              "allPresentStudents":studentData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }


  SessionBatch.getSessionBatchRoutineDetailsBySessionIds = function (sessionIds) {
    return new Promise(async(resolve, reject) => {
      try{  
      let sessionBatches= await sessionBatchCollection.find({sessionId:{$in:sessionIds}}).toArray()
      routineDetails=sessionBatches.map((batch)=>{
        let data={
          sessionId:batch.sessionId,
          semesterStatus:batch.semesterStatus,
          routine:batch.routine
        }
        return data
      })
      //console.log("routineDetails:",routineDetails)
      resolve(routineDetails)
      }catch{
        reject()
      }
    })
  }

  SessionBatch.addClassDataOnSessionBatch=function(sessionId,classData,newAttendanceLists){
    return new Promise(async (resolve, reject) => {
      try{

        await sessionBatchCollection.updateOne(
          {sessionId:sessionId},
          {
            $push:{
              "presentDayActivities.classes":classData
            }
          }
        )
        if(newAttendanceLists.newStudentsCount){
          await sessionBatchCollection.updateOne(
            {sessionId:sessionId},
            {
              $set:{
                "presentDayActivities.students":newAttendanceLists.onBatch
              }
            }
          )
        }
        resolve()
      }catch{
        reject()
      }
    })
  }


  SessionBatch.storeAndCleanPresentDayActivities = function (sessionIds) {
    return new Promise(async(resolve, reject) => {
      try{  
        //console.log("ids:",sessionIds)
        for (let i=0;i<sessionIds.length;i++){
          let sessionId=sessionIds[i].sessionId
          let batchDetails=await sessionBatchCollection.findOne({sessionId:sessionId})
          //console.log("batchDetails:",batchDetails)
          let recordData={
            date:new Date(),
            record:batchDetails.presentDayActivities
          }
          //console.log("RecordData:",recordData)
          let lastActivities=batchDetails.presentDayActivities
          lastActivities.date=new Date()
          let presentActivities={
            students:[],
            classes:[]
          }
          await sessionBatchCollection.updateOne(
            {sessionId:sessionId},
            {
              $set:{
                "isBatchRunning":false,
                "presentDayActivities":presentActivities,
                "lastDayActivities":lastActivities
              }
            }
          )

          let updationField=""
          if(batchDetails.semesterStatus=="1st"){
            updationField="allRecords.firstSemester"
          }else if(batchDetails.semesterStatus=="2nd"){
            updationField="allRecords.secondSemester"
          }else if(batchDetails.semesterStatus=="3rd"){
            updationField="allRecords.thirdSemester"
          }else if(batchDetails.semesterStatus=="4th"){
            updationField="allRecords.fourthSemester"
          }

          await sessionBatchActivityCollection.updateOne(
            {sessionId:sessionId},
            {
              $push:{
                [updationField]:recordData
              }
            }
          )

        }
        resolve()
      }catch{
        reject()
      }
    })
  }
  SessionBatch.getSessionBatchActivityDetails = function (sessionId) {
    return new Promise(async(resolve, reject) => {
      try{  
        let batchActivityDetails=await sessionBatchActivityCollection.findOne({sessionId:sessionId})
        resolve(batchActivityDetails)
      }catch{
        reject()
      }
    })
  }
  SessionBatch.openBatchRunningStatus = function (runningBatchesIds) {
    return new Promise(async(resolve, reject) => {
      try{  
        for (let i=0;i<runningBatchesIds.length;i++){
          let sessionId=runningBatchesIds[i]
          await sessionBatchCollection.updateOne(
            {sessionId:sessionId},
            {
              $set:{
                "isBatchRunning":true,
              }
            }
          )

        }
        resolve()
      }catch{
        reject()
      }
    })
  }
module.exports=SessionBatch