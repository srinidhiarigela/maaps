describe('DomEvent', function () {
	var el, listener;

	beforeEach(function () {
		el = document.createElement('div');
		document.body.appendChild(el);
		listener = sinon.spy();
	});

	afterEach(function () {
		document.body.removeChild(el);
	});

	describe('#on (addListener)', function () {
		it('adds a listener and calls it on event', function () {
			var listener2 = sinon.spy();
			L.DomEvent.on(el, 'click', listener);
			L.DomEvent.on(el, 'click', listener2);

			happen.click(el);

			expect(listener.called).to.be.ok();
			expect(listener2.called).to.be.ok();
		});

		it('binds "this" to the given context', function () {
			var obj = {foo: 'bar'};
			L.DomEvent.on(el, 'click', listener, obj);

			happen.click(el);

			expect(listener.calledOn(obj)).to.be.ok();
		});

		it('passes an event object to the listener', function () {
			L.DomEvent.on(el, 'click', listener);

			happen.click(el);

			expect(listener.lastCall.args[0].type).to.eql('click');
		});

		it('is chainable', function () {
			var res = L.DomEvent.on(el, 'click', function () {});

			expect(res).to.be(L.DomEvent);
		});

		it('is aliased to addListener ', function () {
			expect(L.DomEvent.on).to.be(L.DomEvent.addListener);
		});

		it('adds listener with multiple events and calls it on every event', function () {
			L.DomEvent.on(el, 'click dblclick', listener);

			happen.dblclick(el);
			happen.click(el);

			expect(listener.calledTwice).to.be.ok();
		});

		it('adds listener with an event map and calls appropriate listener when DOM event type occurs', function () {
			var listener2 = sinon.spy();
			var eventMap = {
				click: listener,
				dblclick: listener2,
			};

			L.DomEvent.on(el, eventMap);

			happen.click(el);

			expect(listener.called).to.be.ok();
			expect(listener2.notCalled).to.be.ok();
		});
	});

	describe('#off (removeListener)', function () {
		it('removes a previously added listener', function () {
			L.DomEvent.on(el, 'click', listener);
			L.DomEvent.off(el, 'click', listener);

			happen.click(el);

			expect(listener.notCalled).to.be.ok();
		});

		it('is chainable', function () {
			var res = L.DomEvent.off(el, 'click', function () {});

			expect(res).to.be(L.DomEvent);
		});

		it('is aliased to removeListener ', function () {
			expect(L.DomEvent.off).to.be(L.DomEvent.removeListener);
		});

		it('removes a previously added listener with multiple types', function () {
			L.DomEvent.on(el, 'click dblclick', listener);
			L.DomEvent.off(el, 'click dblclick', listener);

			happen.click(el);
			happen.dblclick(el);

			expect(listener.notCalled).to.be.ok();
		});

		it('removes only specified types from a previously added listener', function () {
			L.DomEvent.on(el, 'click dblclick', listener);
			L.DomEvent.off(el, 'click', listener);

			happen.click(el);
			happen.dblclick(el);

			expect(listener.calledOnce).to.be.ok();
		});

		it('removes a previously added type/listener pair', function () {
			var listener2 = sinon.spy();
			var eventMap = {
				click: listener,
				dblclick: listener2,
			};

			L.DomEvent.on(el, eventMap);
			L.DomEvent.off(el, eventMap);

			happen.click(el);
			happen.dblclick(el);

			expect(listener.notCalled).to.be.ok();
			expect(listener2.notCalled).to.be.ok();
		});
	});

	describe('#stopPropagation', function () {
		it('stops propagation of the given event', function () {
			var child = document.createElement('div');
			el.appendChild(child);
			L.DomEvent.on(child, 'click', L.DomEvent.stopPropagation);
			L.DomEvent.on(el, 'click', listener);

			happen.click(child);

			expect(listener.notCalled).to.be.ok();
		});
	});

	describe('#disableScrollPropagation', function () {
		it('stops wheel events from propagation to parent elements', function () {
			var child = document.createElement('div');
			el.appendChild(child);
			var wheel = 'onwheel' in window ? 'wheel' : 'mousewheel';
			L.DomEvent.on(el, wheel, listener);

			L.DomEvent.disableScrollPropagation(child);
			happen.once(child, {type: wheel});

			expect(listener.notCalled).to.be.ok();
		});
	});

	describe('#disableClickPropagation', function () {
		it('stops click events from propagation to parent elements', function () { // except 'click'
			var child = document.createElement('div');
			el.appendChild(child);
			L.DomEvent.disableClickPropagation(child);
			L.DomEvent.on(el, 'dblclick mousedown touchstart', listener);

			happen.once(child, {type: 'dblclick'});
			happen.once(child, {type: 'mousedown'});
			happen.once(child, {type: 'touchstart', touches: []});

			expect(listener.notCalled).to.be.ok();
		});

		it('prevents click event on map object, but propagates to DOM elements', function () { // to solve #301
			var child = document.createElement('div');
			el.appendChild(child);
			L.DomEvent.disableClickPropagation(child);
			L.DomEvent.on(el, 'click', listener);
			var map = L.map(el).setView([0, 0], 0);
			var mapClickListener = sinon.spy();
			var mapOtherListener = sinon.spy();
			map.on('click', mapClickListener);
			map.on('keypress', mapOtherListener); // control case

			happen.once(child, {type: 'click'});
			happen.once(child, {type: 'keypress'});

			expect(listener.called).to.be.ok();
			expect(mapOtherListener.called).to.be.ok();
			expect(mapClickListener.notCalled).to.be.ok();

			map.remove();
		});

		it('does not interfere with stopPropagation', function () { // test for #1925
			var child = document.createElement('div');
			el.appendChild(child);
			L.DomEvent.disableClickPropagation(child);
			L.DomEvent.on(child, 'click', L.DomEvent.stopPropagation);
			var map = L.map(el).setView([0, 0], 0);
			map.on('click', listener);

			happen.once(child, {type: 'click'});

			expect(listener.notCalled).to.be.ok();

			happen.once(map.getContainer(), {type: 'click'});

			expect(listener.called).to.be.ok();

			map.remove();
		});
	});

	describe('#preventDefault', function () {
		it('prevents the default action of event', function () {
			L.DomEvent.on(el, 'click', listener);
			L.DomEvent.on(el, 'click', L.DomEvent.preventDefault);

			happen.click(el);

			var e = listener.lastCall.args[0];
			if ('defaultPrevented' in e) {
				expect(e.defaultPrevented).to.be.ok();
			} else {
				expect(e.returnValue).not.to.be.ok();
			}
		});
	});
});
