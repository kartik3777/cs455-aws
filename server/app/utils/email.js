const nodemailer = require('nodemailer');

const sendEmail =  async options => {
    // create a transporter
   const transporter = nodemailer.createTransport({
    // we are doing this from maitrop.io only for testing
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth:{
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
   })

   //define email otpions
   const mailOptions ={
    from: "kartik <kartik.io>",
    to: options.email,
    subject: options.subject,
    text: options.message

   }
   
   await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;