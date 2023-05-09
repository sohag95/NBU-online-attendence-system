const Department = require('../models/Department')

exports.functionName =function (req, res) {
    try{
        res.render('')
    }catch{
        res.render('404')
    }
}

exports.isDepartmentExists = async function (req, res,next) {
    try{
        let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.params.departmentCode)
        if(departmentDetails){
            req.departmentDetails=departmentDetails
            next()
        }else{
            res.render('404') 
        }
    }catch{
        res.render('404')
    }
}

exports.getDepartmentDetails = async function (req, res,next) {
    try{
        let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.body.departmentCode)
        if(departmentDetails){
            req.departmentDetails=departmentDetails
            next()
        }else{
            res.render('404') 
        }
    }catch{
        res.render('404')
    }
}

exports.getDepartmentActivityDetailsPage = async function (req, res) {
    try{
        
        res.render("department-activity-details-page")
    }catch{
        res.render('404')
    }
}

exports.professorMustBeDepartmentalHOD = async function (req, res,next) {
    try{
        let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.params.departmentCode)
        if(departmentDetails){
            if(departmentDetails.HOD.regNumber==req.regNumber){
                req.departmentDetails=departmentDetails            
                next()
            }else{
                req.flash("errors", "Only hod can perform that action.")
                req.session.destroy(function () {
                    res.redirect("/")
                }) 
            }
        }else{
            res.render('404')
        }
    }catch{
        req.flash("errors", "There is some problem!!")

        res.render('404')
    }
}

exports.getDetailsPage = function (req, res) {
    try{
        console.log("Department Details:",req.departmentDetails)
        let presentProfessorsRegs=[]
        if(req.departmentDetails.isDepartmentRunning){
            req.departmentDetails.presentDayActivities.professors.forEach((professor)=>{
            presentProfessorsRegs.push(professor.regNumber)
            })
        }
         //-----attendence related data-----
         let presentStudents
         let presentProfessors
         let date
         if(req.departmentDetails.isDepartmentRunning){
             presentStudents=req.departmentDetails.presentDayActivities.students
             presentProfessors=Math.round((req.departmentDetails.presentDayActivities.professors.length/req.departmentDetails.allProfessors.length)*100)
             date=new Date()
         }else{
             presentStudents=req.departmentDetails.lastDayActivities.students
             presentProfessors=Math.round((req.departmentDetails.lastDayActivities.professors.length/req.departmentDetails.allProfessors.length)*100)
             date=req.departmentDetails.lastDayActivities.date
         }
         attendanceData={
             presentStudents:presentStudents,
             presentProfessors:presentProfessors,
             date:date,
         }
         console.log("Attendance Data:",attendanceData)
         //------------------------------------------
        res.render('department-details-page',{
            departmentDetails:req.departmentDetails,
            attendanceData:attendanceData,
            presentProfessorsRegs:presentProfessorsRegs
        })
    }catch{
        res.render('404')
    }
}