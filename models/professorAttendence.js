const attendenceCollection = require("../db").db().collection("Attendence_Lists")

let ProfessorAttendence=function(data){ 
    this.data=data
}
ProfessorAttendence.prototype.checkAttendenceData=function(){
    return "Sohag"
}
module.exports=ProfessorAttendence