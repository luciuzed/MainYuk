const nodemailer = require('nodemailer');

const otpStore = {};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendOtpEmail = async (recipient, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"MainYuk Support" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `Your Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Poppins,sans-serif; min-width:1000px; overflow:auto; line-height:2">
        <div style="margin:50px auto; width:70%; padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em; color: #009966; text-decoration:none; font-weight:600">MainYuk!</a>
          </div>
          <p style="font-size:1.1em">Your MainYuk Verification Code</p>
          <p>This code expires after 1 minute or if you request a new one.</p>
          <h2 style="background: #009966; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
            ${otpCode}
          </h2>
          <p style="font-size:0.9em;">Regards,<br />MainYuk Team</p>
          <hr style="border:none; border-top:1px solid #eee" />
          <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
            <p>MainYuk Support</p>
            <p>Indonesia</p>
          </div>
        </div>
      </div>
    `,
  });

  console.log('OTP email sent:', info.messageId);
  return info;
};

module.exports = {
  otpStore,
  generateOtp,
  sendOtpEmail
};
