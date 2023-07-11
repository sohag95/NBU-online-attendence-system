
const nodemailer=require("nodemailer")
const dotenv = require('dotenv')
dotenv.config()

let SentEmail=function(data){
  this.transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.SENDER_EMAIL_ID,
      pass:process.env.SENDER_EMAIL_PASSWORD
    }
  })
  
  this.mailOptions={
    from:"NBU Community",
  }
}


SentEmail.prototype.sentEmailToSingleAccount=function(emailId){
    return new Promise(async (resolve, reject) => {
      try{
        this.mailOptions.to=emailId
        await this.transporter.sendMail(this.mailOptions)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }
  
  SentEmail.prototype.sentEmailToMultipleAccount=function(emailIds){
    return new Promise(async (resolve, reject) => {
      try{
        for(let i in emailIds){
          this.mailOptions.to=emailIds[i]
          await this.transporter.sendMail(this.mailOptions)
        }
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }

//Above functions are fixed
//Belowed functions will be used for calling the above function

  SentEmail.prototype.sendingToSingleAccountType=function(emailId){
    return new Promise(async (resolve, reject) => {
      try{
        let message="Message body will be here.This is from single sending function"
        this.mailOptions.subject="This is subject!!"
        this.mailOptions.html=message
        await this.sentEmailToSingleAccount(emailId)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }
  SentEmail.prototype.sendingToMultipleAccountType=function(emailIds){
    return new Promise(async (resolve, reject) => {
      try{
        let message="Message body will be here.This is from multiple sending function"
        this.mailOptions.subject="This is subject!!"
        this.mailOptions.html=message
        await this.sentEmailToMultipleAccount(emailIds)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }


  SentEmail.prototype.professorAccountDetails=function(accountData,password){
    return new Promise(async (resolve, reject) => {
      try{
        
        let message=`  
        <div>
          <h3>Hello Sir,Your account has been created on NBU Online Attendance System.</h3>
          <hr>
          <h3>Your Details :</h3>
          <p><strong>Name : ${accountData.userName}</strong></p>
          <p><strong>Department : ${accountData.departmentName}</strong></p>
          <p><strong>Joining Date : ${accountData.joiningDate}</strong></p>
          <hr>
          <h3>Your Account Details :</h3>
          <p><strong>Registration Number : ${accountData.regNumber}</strong></p>
          <p><strong>Password : ${password}</strong></p>
          <p><strong>[This password is auto generated.You can change your password after logging in on the application.]</p>
          <hr>
          <h3>NBU Online Attendance System</h3>
          <p><strong>-Administrator</strong></p>
          <p><strong>-Name : Sohag Roy</strong></p>
          <p><strong>-Phone : 7468987072</strong></p>
          <p><strong>[For any correction,please contact with administrator.]</p>
        </div>`
        this.mailOptions.subject="Account Created on NBU Online Attendance System!!!",
        this.mailOptions.html=message
        await this.sentEmailToSingleAccount(accountData.email)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }
  

  SentEmail.prototype.addedAsHOD=function(HODData,joiningDate){
    return new Promise(async (resolve, reject) => {
      try{
        
        let message=`  
        <div>
          <h3>Congratulations!!!You are added as new Head Of The Department of ${HODData.departmentName}.</h3>
          <hr>
          <h3>Your Details :</h3>
          <p><strong>Name : ${HODData.userName}</strong></p>
          <p><strong>Department : ${HODData.departmentName}</strong></p>
          <p><strong>Joining Date As HOD : ${joiningDate}</strong></p>
          <hr>
          <h3>Please Log-in again to access your functionalities on application.</h3>
          <hr>
          <h3>NBU Online Attendance System</h3>
          <p><strong>-Administrator</strong></p>
          <p><strong>-Name : Sohag Roy</strong></p>
          <p><strong>-Phone : 7468987072</strong></p>
          <p><strong>[For any correction,please contact with administrator.]</p>
        </div>`
        this.mailOptions.subject="Added As HOD",
        this.mailOptions.html=message
        await this.sentEmailToSingleAccount(HODData.email)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }


  SentEmail.prototype.studentAccountCreation=function(studentData,dob,hodName){
    return new Promise(async (resolve, reject) => {
      try{
        //console.log("All Data:",studentData,dob,hodName)
        let sessionYear="20"+studentData.regNumber.slice(0,2)+"-"+"20"+studentData.regNumber.slice(2,4)
        let message=`  
        <div>
          <h3>Dear ${studentData.userName},Your account has been created on NBU Online Attendance System.</h3>
          <hr>
          <h3>Your Details :</h3>
          <p><strong>Name : ${studentData.userName}</strong></p>
          <p><strong>Date of Birth : ${dob}</strong></p>
          <p><strong>Department : ${studentData.departmentName}</strong></p>
          <p><strong>Session Year : ${sessionYear}</strong></p>
          <hr>
          <h3>Your Account Details :</h3>
          <p><strong>Registration Number : ${studentData.regNumber}</strong></p>
          <p><strong>Password : 'Your Date Of Birth'</strong></p>
          <hr>
          <h3>NBU Online Attendance System</h3>
          <h4>Department of ${studentData.departmentName}</h4>
          <p><strong>-Head Of The Department</strong></p>
          <p><strong>-Name : ${hodName}</strong></p>
          <p><strong>[For any correction,please contact(offline) to the Head of the department.]</p>
        </div>`
        this.mailOptions.subject="Registered on NBU Online Attendance System!!!",
        this.mailOptions.html=message
        await this.sentEmailToSingleAccount(studentData.email)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }

  SentEmail.prototype.officialAssistantDeclared=function(assistantData,departmentData){
    return new Promise(async (resolve, reject) => {
      try{
       let message=`  
        <div>
          <h3>Dear ${assistantData.userName},You are added as offitial assistant on ${departmentData.departmentName} department.</h3>
          <hr>
          <h3>Your Details :</h3>
          <p><strong>Name : ${assistantData.userName}</strong></p>
          <p><strong>Department : ${departmentData.departmentName}</strong></p>
          <hr>
          <h3>Your Account Details :</h3>
          <p><strong>Email Id : ${assistantData.email}</strong></p>
          <p><strong>Password : ${assistantData.password}</strong></p>
          <p><strong>[This password is auto generated.You can change your password after logging in on the application.]</p>
          
          <hr>
          <h3>NBU Online Attendance System</h3>
          <h4>Department of ${departmentData.departmentName}</h4>
          <p><strong>-Head Of The Department</strong></p>
          <p><strong>-Name : ${departmentData.hod}</strong></p>
          <p><strong>[For any correction,please contact(offline) to the Head of the department.]</p>
        </div>`
        this.mailOptions.subject="Registered on NBU Online Attendance System!!!",
        this.mailOptions.html=message
        await this.sentEmailToSingleAccount(assistantData.email)
        resolve()
      }catch{
        //console.log("This code ran.")
        reject()
      }
    })
  }
  
  
  module.exports=SentEmail