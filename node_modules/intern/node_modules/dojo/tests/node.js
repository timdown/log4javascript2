define([
	'intern!tdd',
	'intern/chai!assert',
	'require'
], function (test, assert, require) {
	test.suite('node', function () {
		test.test('built-in module', function () {
			var dfd = this.async();

			require([ '../node!util' ], dfd.callback(function (util) {
				assert.isTrue('puts' in util, 'dojo/node should load the requested built-in module');
			}));
		});

		test.test('relative module', function () {
			require([ '../node!./data/node/module' ], function (module) {
				assert.strictEqual(module.foo, 'foo', 'dojo/node should load the requested relative module');
				assert.isFalse(module.defineDetected, 'global define should not be exposed to Node.js modules');
			});
		});

		test.test('non-existent module', function () {
			var dfd = this.async();

			try {
				require([ '../node!invalid' ], dfd.callback(function () {
					throw new assert.AssertionError({ message: 'invalid module should not have resolved' });
				}));
			}
			catch (e) {
				assert.strictEqual(e.message, 'Cannot find module \'invalid\'', 'dojo/node should throw when a Node.js module does not exist');
				dfd.resolve();
			}
		});
	});
});
