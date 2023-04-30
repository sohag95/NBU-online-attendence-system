const express=require("express")
const router=require('./router')
const session=require('express-session')
const MongoStore=require('connect-mongo')
const flash=require('connect-flash')
const app=express()


let sessionOptions=session({
  secret:"hello there",
  store:new MongoStore({client:require('./db')}),
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:1000*60*60*24*7,httpOnly:true}
})

app.use(sessionOptions)
app.use(flash())



app.use(function (req, res, next) {

  // make all error and success flash messages available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  if(req.session.user){
    req.regNumber = req.session.user.regNumber
    req.userName = req.session.user.userName
    req.accountType=req.session.user.accountType
    if(req.accountType=="professor"){
      req.isHOD=req.session.user.isHOD
    }
    if(req.accountType=="student"){
      req.departmentCode=req.session.user.departmentCode
    }
    
  }else{
    req.regNumber = undefined
    req.userName = undefined
    req.accountType=undefined
  }
  
  res.locals.user = req.session.user
  next()
})

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(express.static('public'))
app.set("views",'views')
app.set("view engine","ejs")

app.use('/',router)

module.exports=app