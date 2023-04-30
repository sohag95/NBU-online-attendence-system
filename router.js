const express=require('express')
const router=express.Router()
const userController=require('./controllers/userController')
const departmentController=require('./controllers/departmentController')
const sessionBatchController=require('./controllers/sessionBatchController')
const administrationController=require('./controllers/administrationController')
const professorController=require('./controllers/professorController')
const studentController=require('./controllers/studentsController')
const awsS3BucketController=require('./controllers/awsS3BucketController')
const hodController=require('./controllers/hodController')
const officialAssistantController=require('./controllers/officialAssistantController')


const multer=require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//########################
//photo fetching related routers
//key=user Id/file-name
router.get('/image/:key',awsS3BucketController.getPhoto)
router.post("/photo-upload",upload.single('image'),awsS3BucketController.uploadPhoto)

//########################
//guest-user related routers
router.get('/test',userController.test)
router.get('/',userController.guestHomePage)
router.get('/all-departments',userController.getAllDepartments)
router.post('/loggingOut',userController.loggingOut)

//########################
//Administration related routers
router.get('/administration-log-in',administrationController.administrationLogInPage)
router.post('/administration-logging-in',userController.userMustNotLoggedIn,administrationController.administrationLoggingIn)
router.get('/administration-home',administrationController.administratorMustBeLoggedIn,administrationController.administrationHomePage)
router.post('/adding-new-department',administrationController.administratorMustBeLoggedIn,administrationController.addNewDepartment)
router.get('/administration-handle/department/:departmentCode',administrationController.administratorMustBeLoggedIn,departmentController.isDepartmentExists,administrationController.departmentalHandlePage)
router.post('/add-professor/:departmentCode',administrationController.administratorMustBeLoggedIn,administrationController.addProfessor)
router.post('/add-HOD/:departmentCode',administrationController.administratorMustBeLoggedIn,professorController.getProfessorDetails,administrationController.addHOD)

//########################
//Department related routers
router.get('/department/:departmentCode/details',departmentController.isDepartmentExists,departmentController.getDetailsPage)

//########################
//Session-batch related routers
router.get('/session-batch/:sessionId/details',sessionBatchController.ifSessionBatchExists,sessionBatchController.getBatchDetailsPage)

//########################
//Student related routers
router.post('/student-logging-in',userController.userMustNotLoggedIn,studentController.studentLoggingIn)
router.get('/student-home',studentController.studentMustBeLoggedIn,studentController.getTodaysSubjectDetails,studentController.studentHomePage)

//########################
//Professors related routers
router.post('/professor-logging-in',userController.userMustNotLoggedIn,departmentController.getDepartmentalHODData,professorController.professorLoggingIn)
router.get('/professor-home',professorController.professorMustBeLoggedIn,professorController.getProfessorDepartmentDetails,professorController.getTodaysSubjectDetails,professorController.professorHomePage)
router.get('/class/:classId/take-attendence',professorController.professorMustBeLoggedIn,professorController.isClassValidOrNot,professorController.getClassDetails,professorController.getClassAttendencePage)
router.post('/class/:classId/submit-attendence',professorController.professorMustBeLoggedIn,professorController.isClassValidOrNot,professorController.getClassDetails,professorController.submitClassAttendence)

//Class-attendence related router
router.get('/class/:classId/details',userController.isClassExists,userController.getClassDetailsPage)

//########################
//HOD related routers
router.get('/HOD-handle/:departmentCode/page',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,hodController.getDepartmentHandlePage)
router.post('/add-new-session/:departmentCode',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,hodController.addNewSession)
router.post('/add-student/:departmentCode/:sessionId',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,sessionBatchController.isSessionIdValid,hodController.addStudent)
router.post('/add-official-assistant/:departmentCode',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,hodController.addOfficialAssistant)
router.get('/create/:departmentCode/:sessionId/routine',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,sessionBatchController.ifSessionBatchExists,sessionBatchController.getCreateRoutinePage)
router.post('/add-initial-routine-data/:departmentCode/:sessionId',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,sessionBatchController.isSessionIdValid,sessionBatchController.addRoutineInitialData)
router.post('/add-routine-day-activity/:departmentCode/:sessionId',professorController.professorMustBeLoggedIn,departmentController.professorMustBeDepartmentalHOD,sessionBatchController.isSessionIdValid,sessionBatchController.addRoutineDayActivity)

//########################
//department-Official related routers
router.post('/official-assistant-logging-in',userController.userMustNotLoggedIn,departmentController.getDepartmentDetails,officialAssistantController.officialAssistantLogIn)
router.get('/official-assistant-home',officialAssistantController.offitialAssistantMustBeLoggedIn,officialAssistantController.getOffitialAssistantHome)

router.post('/department/:departmentCode/open',officialAssistantController.offitialAssistantMustBeLoggedIn,departmentController.isDepartmentExists,officialAssistantController.checkPreOpeningData,officialAssistantController.openingDepartment)
router.post('/department/:departmentCode/close',officialAssistantController.offitialAssistantMustBeLoggedIn,departmentController.isDepartmentExists,officialAssistantController.checkPreClosingData,officialAssistantController.closingDepartment)
router.post('/professor/:departmentCode/attendence',officialAssistantController.offitialAssistantMustBeLoggedIn,departmentController.isDepartmentExists,officialAssistantController.checkPreAttendenceData,officialAssistantController.professorAttendence)
router.post('/professor/:departmentCode/attendenceUndo',officialAssistantController.offitialAssistantMustBeLoggedIn,departmentController.isDepartmentExists,officialAssistantController.checkPreAttendenceUndoData,officialAssistantController.professorAttendenceUndo)





module.exports=router
