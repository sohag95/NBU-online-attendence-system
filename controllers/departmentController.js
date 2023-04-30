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
exports.getDepartmentalHODData = async function (req, res,next) {
    try{
        let departmentDetails=await Department.getDepartmentDetailsByDepartmentCode(req.body.regNumber.slice(4,9).toUpperCase())
        if(departmentDetails){
            req.HODData=departmentDetails.HOD
            console.log("hod:",req.HODData)
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
        res.render('department-details-page',{
            departmentDetails:req.departmentDetails
        })
    }catch{
        res.render('404')
    }
}