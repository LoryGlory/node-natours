const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    logger: true,
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // define email options
  const mailOptions = {
    from: 'Laura <hello@laura.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // actually send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
