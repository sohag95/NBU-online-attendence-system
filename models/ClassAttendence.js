const Administration = require("./Administration")
const Department = require("./Department")
const Professor = require("./Professor")
const SessionBatch = require("./SessionBatch")
const Student = require("./Student")

const classAttendenceCollection = require("../db").db().collection("Class_Attendences")

let ClassAttendence=function(data,newAttendenceLists){ 
    this.data=data
    this.newAttendenceLists=newAttendenceLists
    this.departmentalClassData
    this.sessionBatchClassData
    this.professorClassData
    this.studentClassData
    this.studentsRegNumbers
}

ClassAttendence.prototype.dataPreparation=function(){
    this.data={
        classId:this.data.classData.classId,
        departmentName:this.data.classData.departmentName,
        departmentCode:this.data.classData.departmentCode,
        semesterStatus:this.data.classData.semesterStatus,
        period:this.data.classData.period,
        timing:this.data.classData.timing,
        subject:this.data.classData.subject,
        professor:this.data.classData.professor,
        presentStudents:this.data.presentStudents,
        classDate:new Date()
    }
    
    this.departmentalClassData={
        classId:this.data.classId,
        semesterStatus:this.data.semesterStatus,
        period:this.data.period,
        timing:this.data.timing,
        subject:this.data.subject,
        professor:this.data.professor,
    }

    this.sessionBatchClassData={
        classId:this.data.classId,
        period:this.data.period,
        timing:this.data.timing,
        subject:this.data.subject,
        professor:this.data.professor,
    }
    this.professorClassData={
        classId:this.data.classId,
        semesterStatus:this.data.semesterStatus,
        period:this.data.period,
        timing:this.data.timing,
        subject:this.data.subject,
    }
    this.studentClassData={
        classId:this.data.classId,
        period:this.data.period,
        timing:this.data.timing,
        subject:this.data.subject,
        professor:this.data.professor,
        classDate:this.data.classDate
    }

    this.studentsRegNumbers=this.data.presentStudents.map((student)=>{
        return student.regNumber
    })
}

ClassAttendence.prototype.submitClassAttendence=function(){
    return new Promise(async (resolve, reject) => {
        try{
            this.dataPreparation()
            console.log("classData:",this.data)
            console.log("department class data:",this.departmentalClassData)
            console.log("session batch data:",this.sessionBatchClassData)
            console.log("professor class data:",this.professorClassData)
            console.log("Student class data:",this.studentClassData)
            console.log("New attendence list:",this.newAttendenceLists)
            //storing class data on class attendence table
            await classAttendenceCollection.insertOne(this.data)
            //store class activity on sessionBatch
            await SessionBatch.addClassDataOnSessionBatch(this.data.classId.slice(0,9),this.sessionBatchClassData,this.newAttendenceLists)
            //store class activity on department
            await Department.addClassDataOnDepartment(this.data.departmentCode,this.departmentalClassData,this.newAttendenceLists.newStudentsCount)
            //store class data on professor daily activity
            await Professor.addClassDataOnPresentDayActivity(this.data.professor.regNumber,this.professorClassData)
            //store attendence on student account
            await Student.addClassDataOnPresentStudentsAccount(this.studentsRegNumbers,this.data.semesterStatus,this.studentClassData)
            //global count updation
            console.log("count-",this.newAttendenceLists.newStudentsCount)
                
            if(this.newAttendenceLists.newStudentsCount>0){
                await Administration.increaseTotalStudentAttendenceCountGlobally(this.newAttendenceLists.newStudentsCount)
            }
            resolve()
        }catch{
            reject()
        } 
    })
}


ClassAttendence.getClassDetailsByClassId=function(classId){
    return new Promise(async (resolve, reject) => {
        try{
            let classDetails=await classAttendenceCollection.findOne({classId:classId})
            resolve(classDetails)
        }catch{
            reject()
        } 
    })
}
module.exports=ClassAttendence