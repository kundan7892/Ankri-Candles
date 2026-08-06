import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    family: 4,
    tls: { rejectUnauthorized: false }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kundan.gupta@gmail.com', // use a real-looking email just to test connection
    subject: 'Test Email',
    text: 'Testing SMTP connection'
};

console.log('Sending test email...');
transporter.sendMail(mailOptions)
    .then(info => console.log('Success!', info.response))
    .catch(err => console.error('Error!', err.message));
