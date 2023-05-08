const administrationCollection = require("../db").db().collection("Administration")

let Administration=function(data){ 
    this.data=data
}
Administration.prototype.checkAdministrationData=function(){
    return "Sohag"
}

Administration.prototype.administrationLoggingIn = function () {
    return new Promise((resolve, reject) => {
      if (typeof this.data.regNumber != "string") {
        reject("Try with valide data!")
      }
      if (typeof this.data.password != "string") {
        reject("Try with valide data!")
      } 
      console.log("Auth data :",this.data)
      administrationCollection
        .findOne({ dataType:"administrator" }
        )
        .then(async(userData) => {
          if (userData.regNumber==this.data.regNumber.toUpperCase() && userData.password==this.data.password.toLowerCase()) {
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

  Administration.addDepartmentOnList = function (departmentData) {
    return new Promise(async(resolve, reject) => {
      await administrationCollection.updateOne(
        {dataType:"neededData"},
        {
          $push:{
            "allDepartments":departmentData
          }
        }
      )
      resolve()
    })
  }

  

  Administration.addNewSessionYear=function(data){
    return new Promise(async(resolve, reject) => {
      try {
        if (typeof data.newSessionYear != "string") {
          reject("Try with valide data!")
        }
        if (data.newSessionYear.length!=9) {
          reject("Session-Year format should be :'2021-2022'")
        }
        await administrationCollection.updateOne(
          { dataType: "neededData" },
          {
            $set: {
              presentSessionYear: data.newSessionYear
            }
          }
        )
        resolve()
      } catch {
        reject()
      }
    })
  }

  Administration.getAllDepartments = function () {
    return new Promise(async(resolve, reject) => {
      let data=await administrationCollection.findOne({dataType:"neededData"})
      resolve(data.allDepartments)
    })
  }

  Administration.getAdminHomeData= function () {
    return new Promise(async(resolve, reject) => {
      let data=await administrationCollection.findOne({dataType:"neededData"})
      resolve(data)
    })
  } 

  Administration.getPresentSessionYear = function () {
    return new Promise(async(resolve, reject) => {
      let data=await administrationCollection.findOne({dataType:"neededData"})
      resolve(data.presentSessionYear)
    })
  }

  Administration.increaseTotalStudentAttendenceCountGlobally=function(newStudents){
    return new Promise(async(resolve, reject) => {
      try {
        console.log("Count:",newStudents)
        await administrationCollection.updateOne(
          { dataType: "attendanceCountData" },
          {
             $inc: { "presentDayAttendance.students": newStudents } 
          }
        )
        resolve()
      } catch {
        reject()
      }
    })
  }

  Administration.getAttendanceCountData=function(){
    return new Promise(async(resolve, reject) => {
      try {
        let countData=await administrationCollection.findOne({ dataType: "attendanceCountData" })
        resolve(countData)
      } catch {
        reject()
      }
    })
  }
module.exports=Administration