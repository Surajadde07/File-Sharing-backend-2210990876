const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"File Sharing App" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent to", to);
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
};

module.exports = sendEmail;
