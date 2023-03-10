const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0]; // only first name
    this.url = url;
    this.from = `Laura <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'Sendgrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    } else {
      nodemailer.createTransport({
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
    }
  }

  async send(template, subject) {
    // render html based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // define the email options
    const mailOptions = {
      // from: this.from, //in dev env
      from: process.env.SENDGRID_EMAIL_FROM,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html), // get text from html template
    };

    // create transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to the Natours Family!'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
