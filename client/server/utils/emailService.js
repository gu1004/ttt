const nodemailer = require('nodemailer')
require('dotenv').config()

// 创建邮件传输对象
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, // 使用SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

// 发送验证码邮件
const sendVerificationCode = async (toEmail, code) => {
  try {
    await transporter.sendMail({
      from: `"课程评价系统" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: '密码重置验证码',
      html: `
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h2 style="color: #333;">密码重置验证码</h2>
          <p style="color: #666; font-size: 16px;">您的验证码是：</p>
          <div style="background-color: #fff; padding: 10px; border-radius: 3px; margin: 15px 0; text-align: center;">
            <span style="color: #2c42cf; font-size: 24px; font-weight: bold;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">验证码有效期为5分钟，请尽快使用。</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error('发送邮件失败:', error)
    return false
  }
}

module.exports = {
  sendVerificationCode
}
