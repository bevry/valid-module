import { cwd } from 'process'
import { local } from './index.js'
const path = cwd()
local(path)
	.then(function () {
		console.log(`${path} is valid`)
	})
	.catch(function (err) {
		console.error(`${path} failed to validate`)
		console.error(err)
		if (!process.exitCode) {
			process.exitCode = 1
		}
	})
