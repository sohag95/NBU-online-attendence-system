const Administration = require("./Administration")
const Department = require("./Department")
const Professor = require("./Professor")
const SessionBatch = require("./SessionBatch")
const Student = require("./Student")

const classAttendanceCollection = require("../db").db().collection("Class_Attendences")

let ClassAttendance=function(data,newAttendanceLists){ 
    this.data=data
    this.newAttendanceLists=newAttendanceLists
    this.departmentalClassData
    this.sessionBatchClassData
    this.professorClassData
    this.studentClassData
    this.studentsRegNumbers
}

ClassAttendance.prototype.dataPreparation=function(){
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

ClassAttendance.prototype.submitClassAttendance=function(){
    return new Promise(async (resolve, reject) => {
        try{
            this.dataPreparation()
            console.log("classData:",this.data)
            console.log("department class data:",this.departmentalClassData)
            console.log("session batch data:",this.sessionBatchClassData)
            console.log("professor class data:",this.professorClassData)
            console.log("Student class data:",this.studentClassData)
            console.log("New attendance list:",this.newAttendanceLists)
            //storing class data on class attendance table
            await classAttendanceCollection.insertOne(this.data)
            //store class activity on sessionBatch
            await SessionBatch.addClassDataOnSessionBatch(this.data.classId.slice(0,9),this.sessionBatchClassData,this.newAttendanceLists)
            //store class activity on department
            await Department.addClassDataOnDepartment(this.data.departmentCode,this.departmentalClassData,this.newAttendanceLists.newStudentsCount)
            //store class data on professor daily activity
            await Professor.addClassDataOnPresentDayActivity(this.data.professor.regNumber,this.professorClassData)
            //store attendance on student account
            await Student.addClassDataOnPresentStudentsAccount(this.studentsRegNumbers,this.data.semesterStatus,this.studentClassData)
            //global count updation
            console.log("count-",this.newAttendanceLists.newStudentsCount)
                
            if(this.newAttendanceLists.newStudentsCount>0){
                await Administration.increaseTotalStudentAttendanceCountGlobally(this.newAttendanceLists.newStudentsCount)
            }
            resolve()
        }catch{
            reject()
        } 
    })
}


ClassAttendance.getClassDetailsByClassId=function(classId){
    return new Promise(async (resolve, reject) => {
        try{
            let classDetails=await classAttendanceCollection.findOne({classId:classId})
            resolve(classDetails)
        }catch{
            reject()
        } 
    })
}
module.exports=ClassAttendance