import { equal } from 'assert-helpers'
import kava from 'kava'
import { local, registry, json, file } from './index.js'

function pass(result: Promise<true>, done: kava.Errback) {
	result.then(() => done()).catch(done)
}
function fail(result: Promise<true>, done: kava.Errback) {
	result
		.then(() => done(new Error('expected this test to fail')))
		.catch(() => done())
}

kava.suite('valid-module', function(suite, test) {
	test('valid package.json', function(done) {
		pass(json({ module: 'something' }), done)
	})
	test('invalid package.json', function(done) {
		fail(json({}), done)
	})
	test('valid file', function(done) {
		pass(file('export default 5'), done)
	})
	test('invalid file', function(done) {
		fail(file('module.exports = 5'), done)
	})
	test('remote success', function(done) {
		pass(registry('daet', '1.1.0'), done)
	})
	test('remote failure', function(done) {
		fail(registry('daet', '1.11.0'), done)
	})
	test('local success', function(done) {
		pass(local(), done)
	})
})
