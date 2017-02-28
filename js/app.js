var initialLocs = [
	{id: "1", name: "Roma Norte", coords: {lat: 19.417910, lng: -99.161575}, visible: true,
	wikiName: "Colonia Roma", keywords: ["roma", "norte", "colonia", "cuauhtémoc", "cuauhtemoc"]},
	{id: "2", name: "Chapultepec", coords: {lat: 19.419851, lng: -99.186111}, visible: true,
	wikiName: "Chapultepec", keywords: ["chapultepec", "bosque", "forest", "park"]},
	{id: "3", name: "Arena México", coords: {lat: 19.424507, lng: -99.152091}, visible: true,
	wikiName: "Arena México", keywords: ["arena", "lucha", "libre", "wrestling"]},
	{id: "4", name: "National Museum of Anthropology", coords: {lat: 19.426001, lng: -99.186462}, visible: true,
	wikiName: "National Museum of Anthropology (Mexico)", keywords: ["museo", "museum", "antropología", "antropologia", "anthropology"]},
	{id: "5", name: "Condesa", coords: {lat: 19.415189, lng: -99.175612}, visible: true,
	wikiName: "Condesa", keywords: ["condesa", "colonia", "cuauhtémoc", "cuauhtemoc", "hipódromo", "hipodromo"]},
	{id: "6", name: "Zócalo", coords: {lat: 19.432606, lng: -99.133180}, visible: true,
	wikiName: "Zócalo", keywords: ["zócalo", "zocalo", "plaza", "centro", "center", "centre", "constitución", "constitucion"]},
	{id: "7", name: "Zona Rosa", coords: {lat: 19.425653, lng: -99.163658}, visible: true,
	wikiName: "Zona Rosa, Mexico City", keywords: ["zona", "rosa", "colonia", "juárez", "juarez", "gay", "korean", "korea"]}
];

var Location = function(loc) {
	var self = this;
	this.name = ko.observable(loc.name);
	this.coords = ko.observable(loc.coords);
	this.visible = ko.observable(loc.visible);
	this.id = ko.observable(loc.id);
	this.wikiName = ko.observable(loc.wikiName);
	this.keywords = ko.observableArray(loc.keywords);
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

	this.infoWindows = ko.observableArray([]);

	this.filter = ko.observable("");

	this.showList = ko.observable(true);

	this.infoText = ko.observable("");

	var apiCall = function(loc) {
		var wikiRequestURL = ("https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=extracts&exintro=&explaintext=&titles=" +
						  	  loc.wikiName() + "&callback=wikiCallback");
		var wikiRequestTimeout = setTimeout(function() {
			$("#info").text('Failed to obtain Wikipedia links');
		}, 8000);

		$.ajax({url: wikiRequestURL, dataType: 'jsonp'}).done(function(response) {
			$("#info").css("display", "block");
			pageURL = "https://en.wikipedia.org/?curid=" + response.query.pages[0].pageid;
			$("#info").text(response.query.pages[0].extract);
			$("#info").append("<br><br><span id='wiki-link'>INFORMATION FROM <a href='" + pageURL + "'>WIKIPEDIA</a></span>");
			clearTimeout(wikiRequestTimeout);
		});
	};

	var initMap = (function() {
	    	self.map = new google.maps.Map(document.getElementById('map'), {
	    	zoom: 14,
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
			marker.addListener('click', (function(marker, infowindow) {
				return function() {
					infowindow.open(map, marker);
					self.infoWindows.push(infowindow);
					apiCall(loc);
				}
			})(marker, infowindow));
		});
	})(self);

	self.filterMatchKeyword = function(keyword) {
		filter = self.filter().toLowerCase();
		return filter === keyword;
	};

	self.filterMarkers = ko.computed(function() {
		if (self.filter() !== '') {
			self.locList().forEach(function(loc) {
				if (!loc.keywords().some(self.filterMatchKeyword)) {
					loc.visible(false);
				} else {
					loc.visible(true);
				}
			}, self);
		} else {
			self.locList().forEach(function(loc) {
				loc.visible(true);
			});
		}
	}, self);

	self.clickLocation = function(loc) {
		self.markers().forEach(function(marker) {
			if (marker.id === loc.id()) {
				center = new google.maps.LatLng(loc.coords().lat, loc.coords().lng);
				self.map.panTo(center);
				marker.setAnimation(google.maps.Animation.BOUNCE);
				apiCall(loc);
			} else {
				marker.setAnimation(null);
			}
		});
	};

	self.clearSelection = function(loc) {
		self.markers().forEach(function(marker) {
			marker.setAnimation(null);
		});
		self.infoWindows().forEach(function(infoWindow) {
			infoWindow.close();
		});
		self.locList().forEach(function(loc) {
			loc.visible(true);
		});
		$("#info").text("");
		$("#info").css("display", "none");
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

	self.openCloseList = function() {
		self.showList() ? self.showList(false) : !self.showList(true);
	}
}

ko.applyBindings(new ViewModel());
