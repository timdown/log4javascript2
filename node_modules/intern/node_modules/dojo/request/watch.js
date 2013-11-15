define([
	'./util',
	'../errors/RequestTimeoutError',
	'../errors/CancelError'
], function(util, RequestTimeoutError, CancelError){
	// avoid setting a timer per request. It degrades performance on IE
	// something fierece if we don't use unified loops.
	var _inFlightIntvl = null,
		_inFlight = [];

	function watchInFlight(){
		// summary:
		//		internal method that checks each inflight XMLHttpRequest to see
		//		if it has completed or if the timeout situation applies.

		var now = Date.now();

		// we need manual loop because we often modify _inFlight (and therefore 'i') while iterating
		for(var i = 0, dfd; i < _inFlight.length && (dfd = _inFlight[i]); i++){
			var response = dfd.response,
				options = response.options;
			if((dfd.isCanceled && dfd.isCanceled()) || (dfd.isValid && !dfd.isValid(response))){
				_inFlight.splice(i--, 1);
				watch._onAction && watch._onAction();
			}else if(dfd.isReady && dfd.isReady(response)){
				_inFlight.splice(i--, 1);
				dfd.handleResponse(response);
				watch._onAction && watch._onAction();
			}else if(dfd.startTime){
				// did we timeout?
				if(dfd.startTime + (options.timeout || 0) < now){
					_inFlight.splice(i--, 1);
					// Cancel the request so the io module can do appropriate cleanup.
					dfd.cancel(new RequestTimeoutError('Timeout exceeded', response));
					watch._onAction && watch._onAction();
				}
			}
		}

		watch._onInFlight && watch._onInFlight(dfd);

		if(!_inFlight.length){
			clearInterval(_inFlightIntvl);
			_inFlightIntvl = null;
		}
	}

	function watch(dfd){
		// summary:
		//		Watches the io request represented by dfd to see if it completes.
		// dfd: Deferred
		//		The Deferred object to watch.
		// response: Object
		//		The object used as the value of the request promise.
		// validCheck: Function
		//		Function used to check if the IO request is still valid. Gets the dfd
		//		object as its only argument.
		// ioCheck: Function
		//		Function used to check if basic IO call worked. Gets the dfd
		//		object as its only argument.
		// resHandle: Function
		//		Function used to process response. Gets the dfd
		//		object as its only argument.
		if(dfd.response.options.timeout){
			dfd.startTime = Date.now();
		}

		if(dfd.isFulfilled()){
			// bail out if the deferred is already fulfilled
			return;
		}

		_inFlight.push(dfd);
		if(!_inFlightIntvl){
			_inFlightIntvl = setInterval(watchInFlight, 50);
		}

		// handle sync requests separately from async:
		// http://bugs.dojotoolkit.org/ticket/8467
		if(dfd.response.options.sync){
			watchInFlight();
		}
	}

	watch.cancelAll = function cancelAll(){
		// summary:
		//		Cancels all pending IO requests, regardless of IO type
		try{
			_inFlight.forEach(function(dfd){
				try{
					dfd.cancel(new CancelError('All requests canceled.'));
				}catch(e){}
			});
		}catch(e){}
	};

	return watch;
});
