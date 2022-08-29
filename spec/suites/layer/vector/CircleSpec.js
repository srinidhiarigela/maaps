describe('Circle', function () {
	var map, container, circle;

	beforeEach(function () {
		container = container = createContainer();
		map = L.map(container);
		map.setView([0, 0], 4);
		circle = L.circle([50, 30], {radius: 200}).addTo(map);
	});

	afterEach(function () {
		removeMapContainer(map, container);
	});

	describe('#init', function () {
		it('uses default radius if not given', function () {
			var circle = L.circle([0, 0]);
			expect(circle.getRadius()).to.eql(10);
		});

		it('throws error if radius is NaN', function () {
			expect(function () {
				L.circle([0, 0], NaN);
			}).to.throwException('Circle radius cannot be NaN');
		});

	});

	describe('#getBounds', function () {
		it('returns bounds', function () {
			var bounds = circle.getBounds();

			expect(bounds.getSouthWest()).nearLatLng([49.99820, 29.99720]);
			expect(bounds.getNorthEast()).nearLatLng([50.00179, 30.00279]);
		});
	});

	describe('Legacy factory', function () {
		it('returns same bounds as 1.0 factory', function () {
			var bounds = circle.getBounds();

			expect(bounds.getSouthWest()).nearLatLng([49.99820, 29.99720]);
			expect(bounds.getNorthEast()).nearLatLng([50.00179, 30.00279]);
		});
	});

	describe("#setRadius", function () {
		it("should fire the updateradius event", function () {
			var circle = new L.Circle([0, 0]);
			map.addLayer(circle);

			var beforeRadius = circle.getRadius();
			var afterRadius = 30;

			var updateRadiusEvent = sinon.spy();
			circle.on('updateradius', updateRadiusEvent);

			circle.setRadius(afterRadius);

			expect(updateRadiusEvent.callCount).to.not.be(0);
			expect(updateRadiusEvent.args[0][0].oldRadius).to.be(beforeRadius);
			expect(updateRadiusEvent.args[0][0].radius).to.be(afterRadius);
			expect(circle.getRadius()).to.be(afterRadius);
		});
	});
});
