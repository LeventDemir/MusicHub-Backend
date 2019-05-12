const nodemailer = require("nodemailer");


module.exports = sendMail = data => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "musichub.email@gmail.com",
      pass: "1453.1453"
    }
  });

  const mailOptions = {
    from: "hulagu122@gmail.com",
    to: data.to,
    subject: data.subject,
    text: data.text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
  });
};
