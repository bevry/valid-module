import { promises as fsPromises } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import Errlop from 'errlop'
import { json, file } from './index.js'
export * from './index.js'

/**
 * Verify that the package directory declares a valid ECMAScript module file
 * @param packageRootDirectory the root path of the package directory to validate, defaults to the current working directory
 * @rejects if otherwise
 */
export async function local(
	packageRootDirectory: string = cwd(),
): Promise<true> {
	let path = packageRootDirectory
	try {
		const data = JSON.parse(
			await fsPromises.readFile(
				join(packageRootDirectory, 'package.json'),
				'utf8',
			),
		)
		await json(data)
		path = join(packageRootDirectory, data.module)
		const content = await fsPromises.readFile(path, 'utf8')
		return await file(content)
	} catch (err: any) {
		return Promise.reject(new Errlop(`${path} is not a valid module`, err))
	}
}
