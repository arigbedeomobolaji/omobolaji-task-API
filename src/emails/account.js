//jshint esversion:9

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMsg = ({email, name}) => {
  sgMail.send({
    to: email,
    from: "arigbedeesther18@gmail.com",
    subject: "Welcome on board",
    text: `We are really happy to have you, ${name}, Please let\'s know whatever we can offer you.`
  });
};

const sendCancellationMsg = ({ email, name }) => {
  sgMail.send({
    to: email,
    from: "arigbedeesther18@gmail.com",
    subject: "We\'re Sorry for the inconvienience",
    text: `dear ${name}, We\'re deeply sorry for the inconvienence, Please let\'s know why you left. We can\'t wait for you to come on board again`
  });
}

module.exports = {
  sendWelcomeMsg,
  sendCancellationMsg
}