const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'joebonds@gmail.com',
        pass: 'Hotstuff1',
    },
});
const mailOptions = {
    from: 'joebonds@gmail.com',
    to: 'joebonds@gmail.com',
    subject: 'hello world!',
    html: 'hello world!',
};
transport.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
});
