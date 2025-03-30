const nodemailer = require("nodemailer");

async function sendMail(userMail, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "host mail",
    // port: host port,
    auth: {
      user: "your email",
      pass: "password",
    },
  });

  const mailOptions = {
    from: "your email",
    to: userMail,
    subject: subject,
    html: text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(true);
      }
    });
  });
}

module.exports = sendMail;
