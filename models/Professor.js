const professorsCollection = require("../db").db().collection("Professors")
const professorActivityCollection=require("../db").db().collection("Professors_Activities")
const Department = require("./Department")
const IdCreation = require('./IdCreation')
const SentEmail = require('./SentEmail')

let Professor=function(data){ 
    this.data=data
    this.rawData=data
    this.errors=[]
    this.password
    this.professorActivities
}
Professor.prototype.dataPreparation=function(){
    return new Promise(async (resolve, reject) => {
        try{
            //get professor regNumber
            let regNumber=await IdCreation.getProfessorRegNumber(this.data.joiningDate,this.data.departmentCode)
            //create a random password
            this.password=String(IdCreation.getRendomPassword())
            this.data={
                regNumber:regNumber,
                userName:this.data.userName,
                departmentName:this.data.departmentName,
                email:this.data.email,
                presentDayActivities:{
                  classes:[]
                },
                password:this.password,//increpted Password 
                joiningDate:new Date(this.data.joiningDate),
            }
            this.professorActivities={
              regNumber:this.data.regNumebr,
              allRecords:{}
            }
            resolve()
        }catch{
            this.errors.push("Sorry,there is some problem!")
            reject()
          }
        })

}


Professor.prototype.validate=function(){
    return new Promise(async (resolve, reject) => {
      try{
        
        if (this.data.userName == "") {
          this.errors.push("You must provide professor name.")
        }
        if (this.data.email == "") {
            this.errors.push("You must provide email Id of the professor.")
          }
          if (this.data.joiningDate == "") {
            this.errors.push("You must provide joining date of the professor.")
          }
          if(this.data.email){
            let emailExists = await professorsCollection.findOne({email:this.data.email})
            if (emailExists) {
                this.errors.push("Every professor should contain unique email id.")
            }
          }
          console.log("This code is running")
          resolve()
          
      }catch{
        console.log("This code is running2")
        this.errors.push("Sorry,there is some problem!")
        reject()
      }
    })
}

Professor.prototype.addNewProfessor=function(){
    return new Promise(async (resolve, reject) => {
      try{
        // Step #1: Validate user data
        await this.dataPreparation()
        await this.validate()
        if (!this.errors.length) {
            //increase serial number on neededData
            await Department.increaseProfessorSerialNumber(this.data.regNumber.slice(0,9))
            //store professor details data
            await professorsCollection.insertOne(this.data)
            await professorActivityCollection.insertOne(this.professorActivities)
            //store professor id on departmental professor list
            let professorData={
              userName:this.data.userName,
              regNumber:this.data.regNumber,
              joiningDate:this.data.joiningDate
            }
            await Department.addProfessorOnDepartment(this.data.regNumber.slice(4,9),professorData)
            
            //send registration number and password to professor's email id
            let sentEmail=new SentEmail()
            this.rawData.regNumber=this.data.regNumber
            await sentEmail.professorAccountDetails(this.rawData,this.password)
            resolve()
        } else {
          
            reject(this.errors)
        }
      }catch{
      
        reject()
      }
    })
  }

  Professor.prototype.professorLoggingIn = function () {
    return new Promise((resolve, reject) => {
      if (typeof this.data.regNumber != "string") {
        reject("Try with valide data!")
      }
      if (typeof this.data.password != "string") {
        reject("Try with valide data!")
      } 
      professorsCollection
        .findOne({ regNumber:this.data.regNumber.toUpperCase() })
        .then(async(userData) => {
          if (userData.password==this.data.password) {
            this.data = {
              regNumber:userData.regNumber,
              userName:userData.userName,
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


  Professor.getProfessorDetailsByRegNumber=function(regNumber){
    return new Promise(async (resolve, reject) => {
      try{
        let professorDetails=await professorsCollection.findOne({regNumber:regNumber})
        professorDetails.password=null
        resolve(professorDetails)
      }catch{
        reject()
      }
    })
  }

  Professor.addClassDataOnPresentDayActivity=function(regNumber,classData){
    return new Promise(async (resolve, reject) => {
      try{
        await professorsCollection.updateOne(
          {regNumber:regNumber},
          {
            $push:{
              "presentDayActivities.classes":classData
            }
          }
        )
        resolve()
      }catch{
        reject()
      }
    })
  }


  Professor.storeAndCleanPresentDayActivitiesOnPersonalAccount=function(departmentData,runningSessionYear){
    return new Promise(async (resolve, reject) => {
      try{
       let regNumbers=departmentData.presentProfessors.map((professor)=>{
        return professor.regNumber
       })
       for(let i=0;i<regNumbers.length;i++){
        let professorData=await professorsCollection.findOne({regNumber:regNumbers[i]})
        let recordData={
          date:new Date(),
          classes:professorData.presentDayActivities.classes
        }
        let presentDayActivities={
          classes:[]
        }
        await professorsCollection.updateOne(
          {regNumber:regNumbers[i]},
          {
            $set:{
              presentDayActivities:presentDayActivities
            }
          }
        )
        let updationPlace="allRecords."+"Y"+runningSessionYear.slice(0,4)+runningSessionYear.slice(5,9)
        
        await professorActivityCollection.updateOne(
          {regNumber:regNumbers[i]},
          {
            $push:{
              [updationPlace]:recordData
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

  Professor.getProfessorDetailsByRegNumber=function(regNumber){
    return new Promise(async (resolve, reject) => {
      try{
        let professorData=await professorsCollection.findOne({regNumber:regNumber})
        resolve(professorData)
      }catch{
        reject()
      }
    })
  }

module.exports=Professor