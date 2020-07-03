import fetch from 'cross-fetch'
import Errlop from 'errlop'

/** Trim the trailing slash off the path */
function trim(path: string) {
	return path.replace(/\/+$/, '')
}

/** The fields that we make use of when reading a module package.json file  */
interface ModulePackageData {
	module?: string
}

/**
 * Verify that the package has a `module` field present
 * @rejects if otherwise
 */
export function json(data: ModulePackageData): Promise<true> {
	if (!data.module) return Promise.reject(new Error('module field was missing'))
	return Promise.resolve(true)
}

/**
 * Verify that the provided file contents is a valid ECMAScript Module
 * @param file the file contents that we wish to validate
 * @rejects if otherwise
 */
export function file(content: string): Promise<true> {
	// search the start of newlines, and trim any indentation
	// this avoids comments and strings, except for template literals, but that is rare
	content = '\n' + content.replace(/^[ \t]+/, '') + '\n'
	if (content.includes('\nmodule.exports ='))
		return Promise.reject(new Error('module file uses [module.exports = ]'))
	if (content.includes('\nexports = '))
		return Promise.reject(new Error('module file uses [exports =]'))
	if (content.includes('\nexports.'))
		return Promise.reject(new Error('module file uses [exports.* =]'))
	if (content.includes('\nrequire('))
		return Promise.reject(
			new Error('module file used the CommonJS require method')
		)
	if (!content.includes('\nexport '))
		return Promise.reject(new Error('module file did not make use of export'))
	return Promise.resolve(true)
}

/**
 * Verify that the package URL declares a valid ECMAScript module file
 * @param packageRootURL the root CDN URL of the package, e.g. `https://unpkg.com/daet@1.11.0`
 * @rejects if otherwise
 */
export async function remote(packageRootURL: string): Promise<true> {
	let path = packageRootURL
	try {
		const pkgURL = trim(packageRootURL) + '/package.json'
		const pkgResponse = await fetch(pkgURL)
		const data = await pkgResponse.json()
		await json(data)
		path = trim(packageRootURL) + '/' + data.module
		const fileResponse = await fetch(path)
		const content = await fileResponse.text()
		return await file(content)
	} catch (err) {
		return Promise.reject(new Errlop(`${path} is not a valid module`, err))
	}
}

/**
 * Verify that the published package declares a valid ECMAScript module file
 * Uses unpkg behind the scenes.
 * @param packageName the name of the published package that we should validate, e.g. `daet`
 * @param packageVersion the version of the published package that we should validate, e.g. `1.11.0`
 * @rejects if otherwise
 */
export function registry(
	packageName: string,
	packageVersion: string | number
): Promise<true> {
	const url =
		`https://unpkg.com/${packageName}` +
		(packageVersion ? `@${packageVersion}` : '')
	return remote(url)
}
