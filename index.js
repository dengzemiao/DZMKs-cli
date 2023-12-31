// 文档地址：https://mp.kuaishou.com/docs/develop/developerTools/miniprogram-ci/miniprogram-ci.html
const ci = require('ks-miniprogram-ci')
const fs = require('fs')
const path = require('path')
const colors = require('colors')

// 提示
console.log('============================== 开始发布 =============================='.bgGreen)

// 项目文件夹名
const fileName = process.env.NODE_ENV === 'production' ? 'build' : 'dev'
// 项目文件路径
const filePath = `./dist/${fileName}/mp-kuaishou`
// 微信小程序ID
const appid = process.env.APPID
// 微信小程序版本
const version = process.env.VERSION
// 小程序对应的上传私钥地址
const keyPath = `./key/private.${appid}.key`

// 项目是否打包
if (!fs.existsSync(path.join(__dirname, filePath))) {
	console.log(`Error：找不到小程序《${appid}》打包后的项目工程，请先打包!`.red)
	// 记录日志
	setLog('找不到项目工程！')
	// 结束脚本
	process.exit(1)
}
// 是否存在对应小程序的上传私钥
if (!fs.existsSync(path.join(__dirname, keyPath))) {
	console.log(`Error：找不到小程序《${appid}》上传私钥，请联系小程序管理员生成并导入 key 文件中!`.red)
	// 记录日志
	setLog('找不到上传私钥！')
	// 结束脚本
	process.exit(1)
}
// 读取微信项目配置文件，做一下校验，因为命令提交不会管appid是否一致，都能正常提交
const config = JSON.parse(fs.readFileSync(path.join(__dirname, `${filePath}/project.config.json`), 'utf8'))
// 记录日志
setLog('开始上传...')
// 校验 appid 是否一致
if (config.appid === appid) {
	// 匹配，正常跑起来
	run()
} else {
	// 不匹配，中断
	console.log(`Error：本地 dist 文件中小程序包的 appid《${config.appid}》 与指定提交的 appid《${appid}》 不匹配，请重新打包对应的微信小程序!`.red)
	// 记录日志
	setLog(`本地 dist 文件中小程序包的 appid《${config.appid}》 与指定提交的 appid《${appid}》 不匹配`)
	// 结束脚本
	process.exit(1)
}

// 执行
async function run() {
	// 创建项目
	const project = new ci.Project({
		// appid
		appid: appid,
		// 项目地址
		projectPath: filePath,
		// 私钥
		privateKeyPath: keyPath,
		// 当前的项目类型
		type: 'miniProgram',
		// 忽略文件
		ignores: ['node_modules/**/*']
	})
	try {
		// 创建任务 - 上传
		const result = await ci.upload({
			// 项目
			project,
			// 版本
			version: version,
			// 备注
			desc: `${version} - ${process.env.NODE_ENV}`,
			// 编译配置
			setting: {
				// 对应小程序开发者工具的 “es6 转 es5”
				es6: true,
				// 压缩所有代码，对应小程序开发者工具的 “压缩代码”
				minify: true
			},
			// 进度更新监听
			onProgressUpdate: console.log,
		})
		// 上传结果
		console.log('======================================================================'.bgGreen)
		console.log(`项目名称：${config.projectname}(${config.appid})\n项目版本：${version}\n打包环境：${process.env.NODE_ENV}\n上传结果：成功\n上传时间：${nowDate()}`.green)
		console.log('提示信息：测试、发包直接前往：小程序后台管理【版本管理】中扫码体验、测试、发包！'.yellow)
		// console.log(result)
		console.log('======================================================================'.bgGreen)
		// 记录日志
		setLog(`上传成功！`)
		// 结束脚本
		process.exit(0)
	} catch (error) {
		// 验证码有误
		console.log(error.message.red)
		// 记录日志
		setLog(`${error.message}！`)
		// 结束脚本
		process.exit(1)
	}
}

// 日志记录
function setLog(msg) {
	// 文件名称
	const logFileName = 'log.txt'
	// 创建日志文件
	if (!fs.existsSync(path.join(__dirname, logFileName))) { fs.writeFileSync(logFileName, '', 'utf-8') }
	// 写入进度
	fs.appendFileSync(logFileName, `【 ${nowDate()} 】- ${appid} - ${version} - ${process.env.NODE_ENV}:${config.projectname ? `【${config.projectname}】` : ' '}${msg}\n`, 'utf-8')
}

// 获取当前时间
function nowDate() {
	var date = new Date()
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()
	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()
	if (month >= 1 && month <= 9) { month = '0' + month }
	if (day >= 0 && day <= 9) { day = '0' + day }
	if (hour >= 0 && hour <= 9) { hour = '0' + hour }
	if (minute >= 0 && minute <= 9) { minute = '0' + minute }
	if (second >= 0 && second <= 9) { second = '0' + second }
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}