var initialLocs = [
	{id: "1", name: "Colonia Roma", coords: {lat: 19.4210353, lng: -99.156829}, visible: true},
	{id: "2", name: "Chapultepec", coords: {lat: 19.4200509, lng: -99.1847189}, visible: true},
	{id: "3", name: "Xochimilco", coords: {lat: 19.2366455, lng: -99.1507596}, visible: true},
	{id: "4", name: "Frida Kahlo Museum", coords: {lat: 19.355148, lng: -99.1647136}, visible: true},
	{id: "5", name: "Condesa", coords: {lat: 19.4149962, lng: -99.170139}, visible: true}
];

var Location = function(loc) {
	var self = this;
	this.name = ko.observable(loc.name);
	this.coords = ko.observable(loc.coords);
	this.visible = ko.observable(loc.visible);
	this.id = ko.observable(loc.id);
};


var ViewModel = function() {
	var self = this;
	this.map = ko.observable();

	this.locList = ko.observableArray([]);

	initialLocs.forEach(function(loc) {
		self.locList.push(new Location(loc));
	})

	this.centerLoc = ko.observable(this.locList()[0]);

	this.markers = ko.observableArray([]);

	this.filter = ko.observable('');

	var apiCall = function(loc) {
		var wikiRequestURL = ("https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=extracts&exintro=&explaintext=&titles=" +
						  	  loc.name() + "&callback=wikiCallback");
		var wikiRequestTimeout = setTimeout(function() {
			$("#info").text('Failed to obtain Wikipedia links')
		}, 8000);

		$.ajax({url: wikiRequestURL, dataType: 'jsonp'}).done(function(response) {
			$("#info").text(response.query.pages[0].extract)
			clearTimeout(wikiRequestTimeout)
		});
	};

	var initMap = (function() {
	    	self.map = new google.maps.Map(document.getElementById('map'), {
	    	zoom: 12,
	    	center: self.centerLoc().coords()
	    });
	    self.locList().forEach(function(loc) {
		    var marker = new google.maps.Marker({
		    	position: loc.coords(),
		    });
		    marker.id = loc.id();
		    self.markers.push(marker);
		    marker.setMap(self.map);

		    var infowindow = new google.maps.InfoWindow({
			    content: loc.name()
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
				apiCall(loc);
			});
		});
	})(self);

	self.filterMarkers = ko.computed(function() {
		if (self.filter() !== '') {
			self.locList().forEach(function(loc) {
		    	if (self.filter() === loc.id()) {
					loc.visible(true);
				} else {
					loc.visible(false);
				}
			});
		}
	}, self);

	self.toggleVisibility = function(loc) {
		loc.visible(!loc.visible);
	};

	self.updateMarkers = ko.computed(function() {
		self.locList().forEach(function(loc) {
	    	if (loc.visible()) {
				self.markers().forEach(function(marker) {
					if (marker.id === loc.id()) {
						marker.setMap(self.map);
					}
				}); 
			} else {
				self.markers().forEach(function(marker) {
					if (marker.id === loc.id()) {
						marker.setMap(null);
					}
				});
			}
		});
	}, self);

}


ko.applyBindings(new ViewModel());

	// var wikiRequestURL = ("https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=extracts&exintro=&explaintext=&titles=" + this.name() + "&callback=wikiCallback");
	// $.ajax({url: wikiRequestURL, dataType: 'jsonp', success: function(response) {
	// 	if (response.query.pages[0].extract) {
	// 		self.info(response.query.pages[0].extract);
	// 		$("#info").append(response.query.pages[0].extract);
	// 	} else {
	// 		self.info("Could not retrieve Wikipedia information");
	// 	}
	// }});
	// console.log(this.info())

	// var wikiRequestURL = ("https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=extracts&exintro=&explaintext=&titles=Mexico&callback=wikiCallback");
	// var info;
	// $.ajax({url: wikiRequestURL, dataType: 'jsonp', success: function(response){
	//     info = response.query.pages[0].extract;               
	// }});         
	// function assignInfo() {
	//     return info;
	// };
	// console.log(info)

