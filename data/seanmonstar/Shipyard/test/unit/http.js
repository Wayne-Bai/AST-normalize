var Request = require('../../lib/shipyard/http/Request'),
	mockXHR = require('../../lib/shipyard/test/mockXHR'),
	Spy = require('../testigo/lib/spy').Spy;


module.exports = {
	
	'Request': function(it, setup) {

		it('should fire success if successful', function(expect) {
			mockXHR('ok', 200);
			var spy = new Spy();
			var r = new Request({
				url: 'http://x.com',
				onSuccess: spy
			});

			r.send();

			expect(spy.getCallCount()).toBe(1);
		});

		it('should fire failure if failed', function(expect) {
			mockXHR('error', 404);
			var spy = new Spy();
			var r = new Request({
				url: 'http://x.com',
				onFailure: spy
			});

			r.send();

			expect(spy.getCallCount()).toBe(1);
		});

		it('should send data as query string when GET', function(expect) {
			mockXHR('whatever');
			mockXHR('dontcare');
			var r = new Request({
				url: 'http://x.com',
				method: 'get',
				data: {
					'foo': 'bar'
				}
			});

			r.send({ 'baz': 'derp' });

			expect(r.xhr.open.getLastArgs()[1]).toBe('http://x.com?foo=bar&baz=derp');

			var r2 = new Request({
				url: 'http://x.com/?a=1',
				method: 'get',
				data: {
					'foo': 'bar'
				}
			});
			r2.send();

			expect(r2.xhr.open.getLastArgs()[1]).toBe('http://x.com/?a=1&foo=bar');
		});

        it('should have default headers', function(expect) {
			mockXHR('mock');
            var r = new Request({ url: '/' });
            expect(r.options.headers['X-Requested-With']).toBe('XMLHttpRequest');

			var headers = r.options.headers;
			var count = 0;
			for (var h in headers) {
				count++;
			}
            
            r.send();
            expect(r.xhr.setRequestHeader.getCallCount()).toBe(count);
        });
	}

};
