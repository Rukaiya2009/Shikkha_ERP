const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'farhanahoque251@gmail.com',
  from: 'farhanahoque251@gmail.com', // ← Use your signup email (this is often pre-verified)
  subject: '✅ SendGrid Test – ShikkhaERP',
  text: 'This is a test email from SendGrid!',
  html: '<strong>This is a test email from SendGrid!</strong>',
};

sgMail.send(msg)
  .then(() => console.log('✅ Email sent successfully!'))
  .catch((error) => console.error('❌ Error:', error.response?.body || error));