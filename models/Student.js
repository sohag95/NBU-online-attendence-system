const IdCreation = require("./IdCreation")
const SentEmail = require("./SentEmail")
const SessionBatch = require("./SessionBatch")

const studentsCollection = require("../db").db().collection("Students")
const studentAttendenceCollection = require("../db").db().collection("Students_Attendence_Lists")

let Student=function(data){ 
    this.data=data
    this.errors=[]
    this.DOB=data.dateOfBirth
}

Student.prototype.dataPreparation=function(){
  return new Promise(async (resolve, reject) => {
    try{
      let regNumber=await IdCreation.createStudentRegNumber(this.data.sessionId)
      this.data={
        regNumber:regNumber,
        userName:this.data.userName,
        departmentCode:this.data.departmentCode,
        sessionYear:"20"+regNumber.slice(0,2)+"-"+"20"+regNumber.slice(2,4),
        departmentName:this.data.departmentName,
        dateOfBirth:new Date(this.data.dateOfBirth),
        email:this.data.email,
        createdDate:new Date()
      }
      resolve()
    }catch{
      reject()
    }
  })
  
    
}


Student.prototype.validate=function(){
  return new Promise(async (resolve, reject) => {
    try{
      
      if (this.data.userName == "") {
        this.errors.push("You must provide Student name.")
      }
      if (this.data.email == "") {
          this.errors.push("You must provide email Id of the Student.")
        }
        if (this.data.dateOfBirth == "") {
          this.errors.push("You must provide date of birth of the  student.")
        }
        if(this.data.email){
          let emailExists = await studentsCollection.findOne({email:this.data.email})
          if (emailExists) {
              this.errors.push("Provided emailid is already registered.")
          }
        }
        
        resolve()
        
    }catch{
      console.log("This code is running2")
      this.errors.push("Sorry,there is some problem!")
      reject()
    }
  })
}
Student.prototype.addNewStudent=function(hodName){
  return new Promise(async (resolve, reject) => {
    try{
      // Step #1: Validate user data
      await this.dataPreparation()
      await this.validate()
      if (!this.errors.length) {
        console.log("Student Data:",this.data)
          //increase serial number on neededData
          await SessionBatch.increaseStudentSerialNumber(this.data.regNumber.slice(0,9))
          //store student details data
          await studentsCollection.insertOne(this.data)
          //store professor id on session batch allPresentStudents list
          let studentData={
            regNumber:this.data.regNumber,
            userName:this.data.userName,
          }
          await SessionBatch.addStudentOnSessionBatch(this.data.regNumber.slice(0,9),studentData)
          
          //send registration number and password to professor's email id
          let sentEmail=new SentEmail()
          await sentEmail.studentAccountCreation(this.data,this.DOB,hodName)
          resolve()
      } else {
        
          reject(this.errors)
      }
    }catch{
    
      reject("Problem occoured!!")
    }
  })
}

Student.prototype.studentLoggingIn = function () {
    return new Promise((resolve, reject) => {
      if (typeof this.data.regNumber != "string") {
        reject("Try with valide data!")
      }
      if (typeof this.data.password != "string") {
        reject("Try with valide data!")
      } 
      studentsCollection
        .findOne({ regNumber:this.data.regNumber.toUpperCase() })
        .then(async(userData) => {
          if (String(userData.dateOfBirth)===String(new Date(this.data.password))) {
            console.log("I am here")
            this.data = {
              regNumber:userData.regNumber,
              userName:userData.userName,
              departmentCode:userData.departmentCode
            }
            resolve()
          } else {
            reject("Invalid username / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    })
  }

  Student.addClassDataOnPresentStudentsAccount=function(regNumbers,semesterStatus,classData){
    return new Promise(async (resolve, reject) => {
      try{
        let classDataStoreField=""
        if(semesterStatus=="1st"){
          classDataStoreField="allClasses.firstSemester"
        }else if(semesterStatus=="2nd"){
          classDataStoreField="allClasses.secondSemester"
        }else if(semesterStatus=="3rd"){
          classDataStoreField="allClasses.thirdSemester"
        }else if(semesterStatus=="4th"){
          classDataStoreField="allClasses.fourthSemester"
        }
        await studentAttendenceCollection.updateMany(
          { regNumber: { $in: regNumbers } },
          {
            $push:{
              [classDataStoreField]:classData
            }
          },
          {
            multi: true
          }
        )

        resolve()
      }catch{
        reject()
      }
    })
  }
module.exports=Student