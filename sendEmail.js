const nodemailer = require("nodemailer");


const sendEmail = async (email, subject, text, html = false) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.host,
            port: process.env.emailPort,
            secure: true,
            auth: {
                user: process.env.user,
                pass: process.env.pass,
            },
        });

        const mailObject = {
            from: process.env.user,
            to: email,
            subject: subject,
        }
        if (html) {
            mailObject.html = text;
        } else {
            mailObject.text = text;
        }
        await transporter.sendMail(mailObject);
        return true;
    } catch (error) {
        console.log("mail error :", email, error);
        return { status: 400, message: "email not sent", data: email };
    }
};


module.exports = sendEmail