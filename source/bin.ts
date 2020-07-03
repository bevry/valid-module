import { cwd, exit } from 'process'
import { local } from './node.js'
const path = cwd()
local(path)
	.then(function () {
		console.log(`${path} is valid`)
	})
	.catch(function (err) {
		console.error(`${path} failed to validate`)
		console.error(err)
		exit(1)
	})
