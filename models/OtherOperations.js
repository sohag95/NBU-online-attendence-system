let OtherOperations=function(data){
    this.data=data
}
    
OtherOperations.getBatchId=function(sessionYear,departmentCode){
    let firstYear=sessionYear.slice(2,4)
    let secondYear=sessionYear.slice(7,9)
    let batchId=firstYear+secondYear+departmentCode
    return batchId
}
    
     
 module.exports=OtherOperations