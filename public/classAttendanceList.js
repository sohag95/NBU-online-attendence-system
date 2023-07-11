// let allPresentStudents=[
//   {regNumber:"2022COMSC0001",userName:"Sohag Roy"},
//   {regNumber:"2022COMSC0002",userName:"Debarati Barman"},
//   {regNumber:"2022COMSC0003",userName:"Pranab Sinha"},
//   {regNumber:"2022COMSC0004",userName:"Akash Goshwami"},
//   {regNumber:"2022COMSC0005",userName:"Pabitra Sarkar"},
//   {regNumber:"2022COMSC0006",userName:"Arnab Sinha"},
//   {regNumber:"2022COMSC0007",userName:"Apurba Ghosh"}
// ]

   

let allPresentStudents=allStudents

function allPresentStudentsTemplate(student) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center">
    <div class="mr-auto d-flex"> 
      <div class="mr-2">
        <img class="member-avatar"  src="/image/${student.regNumber}" alt="">
      </div>
      <div>
        <span class="item-text d-block"><strong>Name : </strong>${student.userName}</span>
        <span class="item-text d-block"><strong>Registration No : </strong>${student.regNumber}</span>
      </div>
    </div>
    <div>
      <button  value="${student.userName}" id="${student.regNumber}" class="addAsPresentStudent btn btn-primary btn-sm">Add As Present</button>
    </div>
  </li>`
}

let allPresentStudentsHTML = allPresentStudents.map(function(student) {
  return allPresentStudentsTemplate(student)
}).join('')
document.getElementById("allPresentStudents").insertAdjacentHTML("beforeend", allPresentStudentsHTML)
let addAsPresentStudentsButton=document.getElementsByClassName("addAsPresentStudent")

let presentStudents=[]

function addOnClassAttendedListTemplate(student) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <div class="mr-auto d-flex"> 
      <div class="mr-2">
        <img class="member-avatar"  src="/image/${student.regNumber}" alt="">
      </div>
      <div>
        <span class="item-text d-block"><strong>Name : </strong>${student.userName}</span>
        <span class="item-text d-block"><strong>Registration No : </strong>${student.regNumber}</span>
      </div>
    </div>
    <div>
      <button value="${student.userName}" id="${student.regNumber}" class="removePresentStudent btn btn-danger btn-sm">Remove</button>
    </div>
  </li>`
}



document.addEventListener("click", function(e) {
  //select player from registered players
  if (e.target.classList.contains("addAsPresentStudent")) {
        let userName=e.target.parentElement.parentElement.querySelector("button").value
        let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
        let student={
          regNumber:regNumber,
          userName:userName
        }
        presentStudents.push(student)
        e.target.parentElement.parentElement.remove()
        document.getElementById("addedStudents").insertAdjacentHTML("beforeend", addOnClassAttendedListTemplate(student))
  }


  // Remove player from playing 11
  if (e.target.classList.contains("removePresentStudent")) {
    e.preventDefault()
    let userName=e.target.parentElement.parentElement.querySelector("button").value
    let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
    if (confirm(`Do you really want to remove ${userName} from the attendance list?`)) {
        let student={
          regNumber:regNumber,
          userName:userName
        }
        //removing selected player from presentStudents array list
        presentStudents=presentStudents.filter((student)=>{
          if(student.regNumber!=regNumber){
            return student
          }
        })
        e.target.parentElement.parentElement.remove()
        //adding department on remain departments
        document.getElementById("allPresentStudents").insertAdjacentHTML("beforeend", allPresentStudentsTemplate(student))
        
    }
  }
})



document.getElementById("submitAttendanceListButton").addEventListener("click", function(e) {
  e.preventDefault()
  
    let totalPresentStudents=presentStudents.length
    if (confirm(`Are you sure to submit those (${totalPresentStudents}) present Students on this class?`)) {
      let allPresentStudents=JSON.stringify(presentStudents);
      console.log("All presentStudents :",presentStudents)
      document.getElementById("selectedStudents").value=allPresentStudents
      document.getElementById("addStudentsOnAttendanceList").submit()
    }
  
})