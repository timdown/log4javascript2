define([
	'intern!tdd',
	'intern/chai!assert',
	'../cookie'
], function (test, assert, cookie) {
	var aKey = 'a=; ',
		aValue = 'a1=; ',
		bKey = 'b=; ',
		bValue = 'b1=; ';

	test.suite('cookie', function () {
		test.before(function () {
			if (!navigator.cookieEnabled) {
				throw new Error('Cookies not enabled in the current environment');
			}
		});

		test.beforeEach(function eraseAllCookies() {
			var aWhileAgo = new Date(1970, 0, 1).toUTCString(),
				cookies = document.cookie.split('; ');

			cookies.forEach(function (cookie) {
				document.cookie = cookie.split('=', 1)[0] + '=; expires=' + aWhileAgo;
			});

			if (document.cookie.length) {
				throw new Error('Failed to erase cookies. Still existing cookies: ' + document.cookie);
			}
		});

		test.test('basic tests', function () {
			assert.strictEqual(cookie.length, 0, 'no cookies exist');
			assert.strictEqual(cookie.getItem(aKey), null, 'a value is null');

			cookie.setItem(aKey, aValue);
			assert.strictEqual(cookie.length, 1, 'one cookie exists after set');
			assert.strictEqual(cookie.getItem(bKey), null, 'b value is null');

			cookie.setItem(bKey, bValue);
			assert.strictEqual(cookie.length, 2, 'two cookies exist after set');
			assert.strictEqual(cookie.getItem(aKey), aValue, 'a value is a1');
			assert.strictEqual(cookie.getItem(bKey), bValue, 'b value is b1');

			cookie.setItem(aKey, bValue);
			assert.strictEqual(cookie.length, 2, 'setting already existing cookie does not add new cookie');
			assert.strictEqual(cookie.getItem(aKey), bValue, 'a value is changed to b1');

			/* TODO: Determine whether Chrome 24 is buggy or this test is not valid, since it fails there but passes
			 * everywhere else.
			assert.strictEqual(cookie.key(0), aKey, 'key 0 is a');
			assert.strictEqual(cookie.key(1), bKey, 'key 1 is b');
			*/
			assert.strictEqual(cookie.key(2), null, 'key 2 is null');

			cookie.removeItem(aKey);
			assert.strictEqual(cookie.length, 1, 'one cookie exists after remove');
			assert.strictEqual(cookie.key(0), bKey, 'key 0 is b');
			assert.strictEqual(cookie.key(1), null, 'key 1 is null');

			cookie.removeItem(bKey);
			assert.strictEqual(cookie.length, 0, 'no cookies exist after remove');
			assert.strictEqual(document.cookie.length, 0, 'document.cookie is also empty');
		});

		test.test('expires', function () {
			assert.strictEqual(cookie.length, 0, 'no cookies exist');
			cookie.setItem(aKey, aValue, { expires: new Date(1970, 0, 1) });
			assert.strictEqual(cookie.length, 0, 'expired cookie was not set');

			var expiry = new Date(),
				secondsToWait = 2,
				dfd = this.async((secondsToWait + 3) * 1000, 2),
				// The fuzz value is set high because at least Opera 12 seems to not clear cookies exactly when it
				// should; a small fuzz value is needed in any case to avoid timers that fire a little early leading
				// to spontaneous test failures
				msFuzz = 1000;

			expiry.setSeconds(expiry.getSeconds() + secondsToWait, 0);
			cookie.setItem(aKey, aValue, { expires: expiry });
			assert.strictEqual(cookie.length, 1, 'expiring cookie a is set');

			setTimeout(dfd.callback(function () {
				assert.strictEqual(cookie.length, 1, 'one expired cookie expired');
				assert.strictEqual(cookie.getItem(aKey), null, 'cookie a correctly expired');
			}), expiry - Date.now() + msFuzz);

			expiry = new Date(expiry);
			expiry.setSeconds(expiry.getSeconds() + secondsToWait, 0);
			cookie.setItem(bKey, bValue, { expires: expiry });
			assert.strictEqual(cookie.length, 2, 'expiring cookie b is set');

			setTimeout(dfd.callback(function () {
				assert.strictEqual(cookie.length, 0, 'two expired cookies expired');
			}), expiry - Date.now() + msFuzz);
		});
	});
});