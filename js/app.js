var Location = function(loc) {
   /**
	* Initialies Location objects
	*/
	this.name = loc.name;
	this.coords = loc.coords;
	this.visible = ko.observable(loc.visible);
	this.id = loc.id;
	this.wikiName = loc.wikiName;
	this.keywords = loc.keywords;
	this.icon = loc.icon;
};

var initMap = function() {
	var ViewModel = function() {
	   /**
		* Initialies ViewModel properties
		*/
		var self = this;
		this.map = ko.observable();
		this.locList = ko.observableArray([]);
		locCollection.forEach(function(loc) {
			self.locList.push(new Location(loc));
		});
		this.centerLoc = ko.observable(this.locList()[0]);
		this.markers = ko.observableArray([]);
		this.infoWindows = ko.observableArray([]);
		this.filter = ko.observable('');
		this.showList = ko.observable(true);
		this.infoText = ko.observable('');

		var apiCall = function(loc) {
	   /**
		* Sends AJAX request to Wikipedia API and displays resultant info.
		* @loc {Object} Location for which info is being requested.
		*/
			(function(self, loc) {
				var wikiRequestURL = ('https://en.wikipedia.org/w/api.php?format=' +
									  'json&formatversion=2&action=query&prop=extracts' +
									  '&exintro=&explaintext=&titles=' +
								  	  loc.wikiName + '&callback=wikiCallback');
				var wikiRequestTimeout = setTimeout(function() {
					self.infoText('Failed to obtain Wikipedia links');
				}, 8000);

				$.ajax({url: wikiRequestURL, dataType: 'jsonp'}).done(function(response) {
					pageURL = ('https://en.wikipedia.org/?curid=' +
							  response.query.pages[0].pageid);
					infoString = response.query.pages[0].extract + ('<br><br>' +
								 '<span id="wiki">INFORMATION FROM <a href="' +
								 pageURL + '"">WIKIPEDIA</a></span>');
					self.infoText(infoString);
					clearTimeout(wikiRequestTimeout);
				});
			})(self, loc);
		};

		var initMap = (function() {
	   /**
		* Initialises Google map, markers and info windows.
		* Adds event listener to markers.
		*/
		    self.map = new google.maps.Map(document.getElementById('map'), {
		    	zoom: 14,
		    	center: self.centerLoc().coords
		    });
		    var infowindow = new google.maps.InfoWindow();
		    self.locList().forEach(function(loc) {
			    var marker = new google.maps.Marker({
			    	position: loc.coords,
			    	icon: loc.icon
			    });
			    marker.id = loc.id;
			    self.markers.push(marker);
			    marker.setMap(self.map);

			    var infowindow = new google.maps.InfoWindow({
				    content: loc.name
				});
				marker.addListener('click', (function(marker, infowindow) {
					return function() {
						infowindow.setContent(loc.name);
						infowindow.open(map, marker);
						marker.setAnimation(google.maps.Animation.BOUNCE);
						self.infoWindows.push(infowindow);
						apiCall(loc);
					};
				})(marker, infowindow));
			});
		})(self);

		self.filterMatchKeyword = function(keyword) {
	   /**
		* Determines whether current filter term matches a given keyword.
		* @keyword {String} Keyword provided iteratively from loc.keywords
		* @return {Boolean}
		*/
			filter = self.filter().toLowerCase();
			return filter === keyword;
		};

		self.filterMarkers = ko.computed(function() {
	   /**
		* Hides markers and location <li>s that correspond with Location objects
		* that do not have the current filter term among their keywords.
		*/
			if (self.filter() !== '') {
				self.infoText('');
				self.locList().forEach(function(loc) {
					if (!loc.keywords.some(self.filterMatchKeyword)) {
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
	   /**
		* Centers map on selected location, causes the corresponding marker to
		* bounce, and initiates an API call.
		* @loc {Object} Location that has been clicked on in the list.
		*/
			self.markers().forEach(function(marker) {
				if (marker.id === loc.id) {
					center = new google.maps.LatLng(loc.coords.lat,
													loc.coords.lng);
					self.map.panTo(center);
					marker.setAnimation(google.maps.Animation.BOUNCE);
					apiCall(loc);
				} else {
					marker.setAnimation(null);
				}
			});
		};

		self.clearSelection = function() {
	   /**
		* Clears all marker animations, closes all info windows, sets all location
		* 'visible' properties to true, clears Wikipedia info and resets filter.
		*/
			self.markers().forEach(function(marker) {
				marker.setAnimation(null);
			});
			self.infoWindows().forEach(function(infoWindow) {
				infoWindow.close();
			});
			self.locList().forEach(function(loc) {
				loc.visible(true);
			});
			self.infoText('');
			self.filter('');
		};

		self.updateMarkers = ko.computed(function() {
	   /**
		* Hides markers that have been filtered out and displays the rest.
		*/
			self.locList().forEach(function(loc) {
		    	if (loc.visible()) {
					self.markers().forEach(function(marker) {
						if (marker.id === loc.id) {
							marker.setVisible(true);
						}
					}); 
				} else {
					self.markers().forEach(function(marker) {
						if (marker.id === loc.id) {
							marker.setVisible(false);
						}
					});
				}
			});
		}, self);

		self.openCloseList = function() {
			self.showList() ? self.showList(false) : !self.showList(true);
		};
		self.autocompleteWords = ['roma', 'norte', 'colonia', 'cuauhtémoc',
								  'chapultepec', 'bosque', 'forest', 'park',
								  'arena', 'lucha', 'libre', 'wrestling',
								  'museo', 'museum', 'antropología',
								  'anthropology', 'condesa', 'hipódromo',
								  'zócalo', 'plaza', 'centro', 'centre',
								  'constitución', 'zona', 'rosa', 'juárez',
								  'gay', 'korea'];

		$('input').autocomplete({
			source: self.autocompleteWords,
			appendTo: '#autocomplete',
			select: function( event, ui ) {
				self.filter(ui.item.value);
			}
		});
	};
	ko.applyBindings(new ViewModel());
};

var mapFail = function() {
	$('#map').html("<br><br>Failed to load map. Please try refreshing the page.");
}
