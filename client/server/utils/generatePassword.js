const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function generatePassword() {
  rl.question('请输入用户名: ', async (username) => {
    rl.question('请输入密码: ', async (password) => {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      console.log('\n生成的密码信息：')
      console.log('用户名:', username)
      console.log('原始密码:', password)
      console.log('加密后的密码:', hash)

      console.log('\n更新数据库的 SQL：')
      const table = getTableName(username)
      console.log(`UPDATE ${table} SET password='${hash}' WHERE username='${username}';`)

      rl.close()
    })
  })
}

function getTableName(username) {
  if (username.startsWith('admin')) return 'administrators'
  if (username.startsWith('t')) return 'teachers'
  return 'students'
}

generatePassword()
