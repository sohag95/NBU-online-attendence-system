

const reportingCollection = require("../db").db().collection("Problem_Reports")

let User=function(data){ 
    this.data=data
}
User.prototype.checkUserData=function(){
    return "Sohag"
}
module.exports=User