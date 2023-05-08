const Administration = require("./Administration")
const IdCreation = require("./IdCreation")
const Professor = require("./Professor")
const SentEmail = require("./SentEmail")
const SessionBatch = require("./SessionBatch")

const departmentsCollection = require("../db").db().collection("Departments")
const departmentActivityCollection=require("../db").db().collection("Departments_Activities")
let Department=function(data){ 
    this.data=data
    this.errors=[]
    this.departmentalActivities
}
Department.prototype.dataPreparation=function(){
    this.data={
        departmentCode:this.data.departmentCode.toUpperCase(),
        departmentName:this.data.departmentName,
        allProfessors:[],//{regNumber:"",userName:""}
        HOD:{
            regNumber:null,
            userName:null,
            joiningDate:null
        },
        runningSessionBatches:[],//{batchName:"",session:"2023-2025"}
        XSessionBatches:[],
        presentDayActivities:{
          students:0,//total student present for the day
          professors:[],  
          classes:[]
        },
        lastDayActivities:{
          students:0,
          professors:[],
          classes:[],
          date:null
        },
        isDepartmentRunning:false,
        //true-during running time.hod/assistant will declare running department.
        //false-->ssistant will declare closing department.
        departmentOfficial:null,
        professorSerialNumber:0
    }
    this.departmentalActivities={
      departmentCode:this.data.departmentCode,
      allRecords:{}
    }
}


Department.prototype.validate=function(){
    return new Promise(async (resolve, reject) => {
      try{
        if (this.data.departmentCode.length!=5) {
          this.errors.push("You must provide 5 alphabetic department code.")
        }
        if (this.data.departmentName == "") {
          this.errors.push("You must provide department name.")
        }
        let codeExists = await departmentsCollection.findOne({departmentCode:this.data.departmentCode})
          if (codeExists) {
            this.errors.push("Given department code has already been used.")
          }
          resolve()
      }catch{
        this.errors.push("Sorry,there is some problem!")
        reject()
      }
    })
}
    
Department.prototype.addNewDepartment=function(){
    return new Promise(async (resolve, reject) => {
      try{
        // Step #1: Validate user data
        this.dataPreparation()
        await this.validate()
        if (!this.errors.length) {
            await departmentsCollection.insertOne(this.data)
            await departmentActivityCollection.insertOne(this.departmentalActivities)
            await Administration.addDepartmentOnList({departmentCode:this.data.departmentCode,departmentName:this.data.departmentName})
            resolve()
        } else {
            reject(this.errors)
        }
      }catch{
        reject()
      }
    })
  }

  Department.prototype.addOfficialAssistant=function(departmentData){
    return new Promise(async (resolve, reject) => {
      try{
        let assistantDetails={
          userName:this.data.userName,
          email:this.data.email,
          password:String(IdCreation.getRendomPassword())
        }
        //update assistant data
        await departmentsCollection.updateOne(
          {departmentCode:this.data.departmentCode},
          {
            $set:{
              "departmentOffitial":assistantDetails
            }
          }
        )
        //sent email to official assistant
        let sentEmail=new SentEmail()
        await sentEmail.officialAssistantDeclared(assistantDetails,departmentData)
        resolve()
      }catch{
        reject("There is some problem!")
      }
    })
  }

  Department.increaseProfessorSerialNumber=function(departmentCode){
    return new Promise(async(resolve, reject) => {
      try {
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $inc: {
              professorSerialNumber: 1
            }
          }
        )
        resolve()
      } catch {
        reject()
      }
    })
  }

  Department.getDepartmentDetailsByDepartmentCode=function(departmentCode){
    return new Promise(async (resolve, reject) => {
      try{
        let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
        if(departmentDetails){
          resolve(departmentDetails)
        }else{
          reject()
        }
      }catch{
        reject()
      }
    })
  }

  
  Department.addProfessorOnDepartment = function (departmentCode,professorData) {
    return new Promise(async(resolve, reject) => {
      try{
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "allProfessors":professorData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }

  Department.addNewHOD = function (joiningDate,HODData) {
    return new Promise(async(resolve, reject) => {
      try{
        let HOD={
          regNumber:HODData.regNumber,
          userName:HODData.userName,
          joiningDate:new Date(joiningDate)
        }
        //update HOD data on departmental page
        await departmentsCollection.updateOne(
          {departmentCode:HODData.regNumber.slice(4,9)},
          {
            $set:{
              "HOD":HOD
            }
          }
        )
        //sent hod an welcome message
        let sentEmail=new SentEmail()
        await sentEmail.addedAsHOD(HODData,joiningDate)
        resolve()
      }catch{
        reject()
      }
    })
  }

  Department.addSessionOnDepartmentAsCurrentBatch = function (batchData,departmentCode) {
    return new Promise(async(resolve, reject) => {
      try{
        
        //update HOD data on departmental page
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "runningSessionBatches":batchData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }


  Department.openingDepartment=function(departmentCode){
    return new Promise(async (resolve, reject) => {
      try{
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $set:{
              "isDepartmentRunning":true
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }
  Department.closeDepartment=function(departmentCode,departmentData,runningSessionYear){
    return new Promise(async (resolve, reject) => {
      try{
        let lastActivities=departmentData.presentDayActivities
        let recordData={
          date:new Date(),
          record:departmentData.presentDayActivities
        }
        lastActivities.date=new Date()
        let presentActivities={
          students:0,
          professors:[],
          classes:[]
        }
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $set:{
              "isDepartmentRunning":false,
              "presentDayActivities":presentActivities,
              "lastDayActivities":lastActivities
            }
          }
        )

        let place="allRecords."+"Y"+runningSessionYear.slice(0,4)+runningSessionYear.slice(5,9)
        
        await departmentActivityCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              [place]:recordData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }
  Department.closingDepartment=function(departmentCode,departmentData,runningSessionYear){
    return new Promise(async (resolve, reject) => {
      try{
        await Department.closeDepartment(departmentCode,departmentData,runningSessionYear)
        //store todays departmental activity on last day activity and store data on departmental activity list
        //same as batch activity lists classes
        await SessionBatch.storeAndCleanPresentDayActivities(departmentData.runningSessionBatches)
        //update professorsclass details on there account
        await Professor.storeAndCleanPresentDayActivitiesOnPersonalAccount(departmentData,runningSessionYear)
        resolve()
      }catch{
        reject()
      }
    })
  }

  Department.takeProfessorAttendence=function(departmentCode,data){
    return new Promise(async (resolve, reject) => {
      try{

        let currDate = new Date();
        let time = currDate.toLocaleTimeString('hi-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        let professorData={
          regNumber:data.regNumber,
          userName:data.userName,
          time:time
        }

        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "presentDayActivities.professors":professorData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }


  Department.undoProfessorAttendence=function(departmentCode,newAttendenceList){
    return new Promise(async (resolve, reject) => {
      try{

        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $set:{
              "presentDayActivities.professors":newAttendenceList
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }

  Department.addClassDataOnDepartment=function(departmentCode,classData,newStudentsCount){
    return new Promise(async (resolve, reject) => {
      try{

        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "presentDayActivities.classes":classData
            },
            $inc:{
              "presentDayActivities.students":newStudentsCount
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }

module.exports=Department

