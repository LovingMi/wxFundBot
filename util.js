const nodemailer = require('nodemailer');
const CONSTANT = require('./constant');

const { USER, PASS } = CONSTANT;

const Transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 587,
  secure: false,
  auth: {
    user: USER,
    pass: PASS,
  },
});

const sendMail = (to, htmlData, subject) => {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: `<${USER}>`,
      to: `<${to}>`,
      subject: subject,
      html: htmlData,
    };
    Transporter.sendMail(mailOptions, (error, info = {}) => {
      if (error) {
        console.error("邮件发送异常" + error);
        reject(error);
      } else {
        console.log("邮件发送成功", info.messageId);
        console.log("静等下一次发送");
        resolve();
      }
    });
  });
};

const randomRgbaColor = () => {
  //随机生成RGBA颜色
  var r = Math.floor(Math.random() * 256); //随机生成256以内r值
  var g = Math.floor(Math.random() * 256); //随机生成256以内g值
  var b = Math.floor(Math.random() * 256); //随机生成256以内b值
  var alpha = Math.random(); //随机生成1以内a值
  return `rgb(${r},${g},${b},${alpha})`; //返回rgba(r,g,b,a)格式颜色
};

module.exports = {
  sendMail,
  randomRgbaColor
}