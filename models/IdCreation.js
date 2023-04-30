const administrationCollection = require("../db").db().collection("Administration")
const departmentsCollection = require("../db").db().collection("Departments")
const sessionBatchCollection = require("../db").db().collection("Session_Batches")

let IdCreation=function(data){
  this.data=data
 }

 IdCreation.createSessionBatchId=function(data){
  let firstPart=data.startYear.slice(2,4)+data.endYear.slice(2,4)
  let sessionId
  if(data.departmentCode=="COMSC"){
    sessionId=firstPart+data.idLastPart

  }else{
    sessionId=firstPart+data.departmentCode

  }
   
    return sessionId
 }

 IdCreation.getProfessorRegNumber=function(joiningDate,departmentCode){
  return new Promise(async(resolve, reject) => {
    try{
      let firstPart = joiningDate.slice(0,4)
      let middlePart = departmentCode.toUpperCase()

      let data = await departmentsCollection.findOne({ departmentCode:departmentCode })
      
      let serialNumber = data.professorSerialNumber + 1
      let number = serialNumber.toString()
      let digit = number.length
      let lastPart
      if (digit == 1) {
        let onedigit = "000".concat(number)
        lastPart = onedigit
      } else if (digit == 2) {
        let twodigit = "00".concat(number)
        lastPart = twodigit
      } else if (digit == 3) {
        let threedigit = "0".concat(number)
        lastPart = threedigit
      } else {
        lastPart = number
      }
      let regNumber=firstPart+middlePart+lastPart
      //regNumber(As:2122COMSC0001) contains sessionYear=2021-2022+departmentCode=COMSCS+batchId=2122COMSC
      resolve(regNumber)
    }catch{
      reject()
    }
  })
 }
 
 IdCreation.createStudentRegNumber=function(sessionId){
    return new Promise(async(resolve, reject) => {
      try{
        let firstPart = sessionId
      
        let data = await sessionBatchCollection.findOne({ sessionId:sessionId })
        
        let serialNumber = data.studentSerialNumber + 1
        let number = serialNumber.toString()
        let digit = number.length
        let lastPart
        if (digit == 1) {
          let onedigit = "000".concat(number)
          lastPart = onedigit
        } else if (digit == 2) {
          let twodigit = "00".concat(number)
          lastPart = twodigit
        } else if (digit == 3) {
          let threedigit = "0".concat(number)
          lastPart = threedigit
        } else {
          lastPart = number
        }
        let regNumber=firstPart+lastPart
        //regNumber(As:2122COMSC0001) contains sessionYear=2021-2022+departmentCode=COMSCS+batchId=2122COMSC
        resolve(regNumber)
      }catch{
        reject()
      }
    })
   }
   
 IdCreation.getBatchId=function(sessionYear,departmentCode){
  let firstPart = sessionYear.slice(2,4)+sessionYear.slice(7,9)
  let lastPart = departmentCode.toUpperCase()
  let batchId=firstPart+lastPart
  return batchId
}

IdCreation.getRendomPassword=function(){
  let password = Math.floor(100000 + Math.random() * 900000);
  return password
}

 module.exports=IdCreation