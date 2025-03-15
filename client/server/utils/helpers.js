// 生成指定长度的随机验证码
const generateRandomCode = (length = 6) => {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

module.exports = {
  generateRandomCode
}
