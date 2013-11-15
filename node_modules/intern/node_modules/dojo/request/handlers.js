define([], function () {
	var handlers = {
		javascript: function (response) {
			/*jshint evil:true */
			return new Function(response.text || '')();
		},
		json: function (response) {
			return JSON.parse(response.text || null);
		}
	};

	function handle(response) {
		var handler = handlers[response.options.handleAs];

		response.data = handler ? handler(response) : (response.data || response.text);

		return response;
	}

	handle.register = function (name, handler) {
		handlers[name] = handler;
	};

	return handle;
});