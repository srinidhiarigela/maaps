describe("Control.Scale", () => {
	it("can be added to an unloaded map", () => {
		var map = L.map(document.createElement('div'));
		new L.Control.Scale().addTo(map);
	});
});
