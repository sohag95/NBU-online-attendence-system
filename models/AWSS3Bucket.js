const s3=require("@aws-sdk/client-s3")
const dotenv = require('dotenv')
const AWSS3PhotoEdit = require("./AWSS3PhotoEdit")
dotenv.config()


let AWSS3Bucket=function(){
    this.bucketName=process.env.AWS_MEDIUM_BUCKET_NAME
    this.region = process.env.AWS_BUCKET_REGION
    this.accessKeyId = process.env.AWS_ACCESS_KEY
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    
    this.s3Client = new s3.S3Client({
      region:this.region,
      credentials: {
        accessKeyId:this.accessKeyId,
        secretAccessKey:this.secretAccessKey
      }
    })
  }
  
  AWSS3Bucket.prototype.uploadPhotoOnS3Bucket=function(fileBuffer, fileName){
    return new Promise(async (resolve, reject) => {
      try{
        const uploadParams = {
          Bucket: this.bucketName,
          Body: fileBuffer,
          Key: fileName,
          ContentType: "image/jpeg"
        }
        await this.s3Client.send(new s3.PutObjectCommand(uploadParams))
        resolve()
      }catch{
        reject()
      }
    })

  }

  AWSS3Bucket.prototype.uploadPhoto=function(fileBuffer, fileName){
    return new Promise(async (resolve, reject) => {
      try{
        let mediumBufferData=await AWSS3PhotoEdit.editAsMediumImage(fileBuffer)
        await this.uploadPhotoOnS3Bucket(mediumBufferData, fileName)
        resolve()
      }catch{
        reject()
      }
    })
  }

  AWSS3Bucket.prototype.getPhoto=function(key){
    return new Promise(async (resolve, reject) => {
      try{
        //"key" is the file name here
        let input={
          Bucket: this.bucketName,
          Key: key,
        }
        const command = new s3.GetObjectCommand(input);
        const response = await this.s3Client.send(command)
  
        resolve(response.Body)
      }catch{
        console.log("I am from getPhoto error.")
        reject()
      }
    })
  }
  
  module.exports=AWSS3Bucket