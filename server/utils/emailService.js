const nodemailer = require('nodemailer')

// 创建邮件传输对象
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.qq.com',
  port: process.env.MAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS // QQ邮箱的授权码
  }
})

// 发送验证码邮件
const sendVerificationCode = async (to, code) => {
  const mailOptions = {
    from: `"课程评价系统" <${process.env.MAIL_USER}>`,
    to: to,
    subject: '密码重置验证码',
    html: `
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2 style="color: #333;">密码重置验证码</h2>
        <p style="font-size: 16px; color: #666;">您正在进行密码重置操作，验证码为：</p>
        <div style="
          background-color: #fff;
          padding: 10px 20px;
          margin: 20px 0;
          font-size: 24px;
          font-weight: bold;
          color: #2c42cf;
          display: inline-block;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        ">${code}</div>
        <p style="font-size: 14px; color: #999;">验证码有效期为5分钟，请尽快完成验证。</p>
        <p style="font-size: 14px; color: #999;">如果这不是您的操作，请忽略此邮件。</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('发送邮件失败:', error)
    return false
  }
}

module.exports = {
  sendVerificationCode
}
