const Department = require('../models/Department')
const SessionBatch = require('../models/SessionBatch')
const Student = require('../models/Student')



exports.addNewSession =function (req, res) {
    try{
        req.body.departmentCode=req.departmentDetails.departmentCode
        req.body.departmentName=req.departmentDetails.departmentName   
        let sessionBatch=new SessionBatch(req.body)
        sessionBatch.addNewSessionBatch().then((batchId)=>{
            req.flash("success", "New Session Batch added successfully.")
            req.session.save(function () {
                res.redirect(`/session-batch/${batchId}/details`)
            })
        }).catch((e)=>{
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect(`/department/${req.params.departmentCode}/details`)
            })
        })
    }catch{
        res.render('404')
    }
}

exports.addStudent =function (req, res) {
    try{
        let hodName=req.userName
        req.body.departmentCode=req.departmentDetails.departmentCode
        req.body.departmentName=req.departmentDetails.departmentName 
        //console.log("Body Data:",req.body) 
        //res.redirect(`/session-batch/${req.params.sessionId}/details`) 
        let student=new Student(req.body)
        student.addNewStudent(hodName).then(()=>{
            //console.log("I am sohag")
            req.flash("success", "New Student added successfully.")
            req.session.save(function () {
                res.redirect(`/session-batch/${req.body.sessionId}/details`)
            })
        }).catch((e)=>{
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect(`/session-batch/${req.body.sessionId}/details`)
            })
        })
    }catch{
        res.render('404')
    }
}

exports.addOfficialAssistant =function (req, res) {
    try{
        let departmentData={
            departmentName:req.departmentDetails.departmentName,
            hod:req.userName
        }
        req.body.departmentCode=req.departmentDetails.departmentCode
        //console.log("Body Data:",req.body) 
        let department=new Department(req.body)
        department.addOfficialAssistant(departmentData).then(()=>{
            req.flash("success", "Official Assistant added successfully.")
            req.session.save(function () {
                res.redirect(`/department/${req.body.departmentCode}/details`)
            })
        }).catch((e)=>{
            req.flash("errors", e)
            req.session.save(function () {
                res.redirect(`/department/${req.body.departmentCode}/details`)
            })
        })
    }catch{
        res.render('404')
    }
}