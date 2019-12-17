import { promises as fsPromises } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { json, file } from './universal.js'

/**
 * Verify that the package directory declares a valid ECMAScript module file
 * @param packageRootDirectory the root path of the package directory to validate, defaults to the current working directory
 * @rejects if otherwise
 */
export async function local(
	packageRootDirectory: string = cwd()
): Promise<true> {
	try {
		const data = JSON.parse(
			await fsPromises.readFile(
				join(packageRootDirectory, 'package.json'),
				'utf8'
			)
		)
		await json(data)
		const content = await fsPromises.readFile(
			join(packageRootDirectory, data.module),
			'utf8'
		)
		return await file(content)
	} catch (err) {
		return Promise.reject(err)
	}
}
