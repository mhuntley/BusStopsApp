var busStopApp = angular.module("busStopApp", ["uiGmapgoogle-maps", "ngRoute"]);
var apikey = "97df55d10b30aac5a0ac7ce748c5b717";
var appid = "08eebd27";

busStopApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
      templateUrl: 'app/pages/search.html',
        controller: 'SearchController'
      }).
      when('/map/:latitude/:longitude/:address', {
      templateUrl: 'app/pages/map.html',
        controller: 'BusStopController'
      }).
      when('/times/:atcocode', {
        templateUrl: 'app/pages/bustimes.html',
        controller: 'BusTimeController'
      });
}]);

/**
 *  SearchController
 */

busStopApp.controller('SearchController', function ($scope, $http, $location) {
  
  $scope.formInfo = {};
  $scope.saveData = function() {
  	getLatLong($scope.formInfo.Name);
  };

  function getLatLong(address){
  	//build url for google maps to get long lat and change app path
  	var googleMapsURL = "http://maps.googleapis.com/maps/api/geocode/json?callback=JSON_CALLBACK&address=" + address + ",london";
    $http.get(googleMapsURL)
    	.success(function(geoData){
    		var newURL = 'map/' + geoData.results[0].geometry.location.lat + "/" + geoData.results[0].geometry.location.lng + "/" + address;
        $location.path(newURL);
    });
	}
});
// end of SearchController

/**
 *  BusStopController
 */

busStopApp.controller('BusStopController', function ($scope, $http, $routeParams, $location) {

  var busStopURL = "";
  var markers = [];

	$scope.message = 'BusStopController';

	$scope.latitude = $routeParams.latitude;
  $scope.longitude = $routeParams.longitude;
  $scope.address = $routeParams.address;

  // builds button functions
  $scope.returnHome = function() {
  	$location.path('/');
  };
  
  // builds map
  $scope.map =
  {
    control: {},
    showTraffic: false,
    showBicycling: false,
    showWeather: false,
    showHeat: false,
    center: {
      latitude: $scope.latitude,
      longitude: $scope.longitude
    },
    options: {
      streetViewControl: false,
      panControl: false,
      maxZoom: 20,
      minZoom: 16
    },
    zoom: 17,
    dragging: false,
    bounds: {},
    events: {
      // creates event so that when the map is idle it calls the
      // api to see if any bus stops are new in the map frame
      idle: function (map) {
        $scope.$apply(function () {
          busStopURL = buildAPIUrl(map.getBounds());
          $http.jsonp(busStopURL).success(function(data){
            setupGoogleMarkers(data, busStopURL, markers);
          });
        });
      }
    }
  };

	$scope.markers = [];

	 /**
    *  add markers into array
    */
	var addMarker = function (i, longitude, latitude, name, atcocode, bearing, locality, smscode) {
    // setups the marker variables
		var ret = {
			id: i,
      options: {
      	draggable: false,
      	labelAnchor: '-7 10',
      	labelContent: name,
      	labelClass: 'labelMarker'
      },
      latitude: latitude,
      longitude: longitude,
      title: name,
      atcocode: atcocode,
      bearing: bearing,
      locality: locality,
      smscode: smscode
    };

    return ret;
  };

  /**
   *  function to build url
   */
  function buildAPIUrl(bounds){
    var url = "http://transportapi.com/v3/uk/bus/stops/bbox.json?callback=JSON_CALLBACK&minlon=" + bounds.ma.j + "&minlat=" + bounds.va.k + "&maxlon=" + bounds.ma.k + "&maxlat=" + bounds.va.j + "&api_key=fed809061ed9956f32d719787fcf8d0e&app_id=ad0f4534";

    return url;
  }

	/**
  *   builds markers on map
  */
	function setupGoogleMarkers(busStops, url, markers )
	{
    // loops through bus stops
		for (var key in busStops.stops) {
      var stop = busStops.stops[key];
      var addToArray=true;

      // checks to see if the bus stop is already in the markers array.
      // if it is then change variable addToArray to false so that the
      // push event is not run
      for(var i=0; i < markers.length; i++){
        if(markers[i].atcocode === stop.atcocode){
          addToArray=false;
        }
      }

      // push new marker
      if(addToArray){
        markers.push(addMarker(stop.atcocode, stop.longitude, stop.latitude, stop.name, stop.atcocode, stop.bearing, stop.locality, stop.smscode));
      }
		}
		$scope.markers = markers;
	}
});
// end of SearchController

/**
 *  BusStopController
 */
busStopApp.controller('BusTimeController', function ($scope, $http, $routeParams, $location, $window) {
  // builds button functions
  $scope.returnHome = function() {
  	$location.path('/');
  };
  $scope.back = function() {
  	$window.history.back();
  };
  
  // creates url to get the bus stop data
	var busTimeURL = "http://transportapi.com/v3/uk/bus/stop/" + $routeParams.atcocode + "/live.json?callback=JSON_CALLBACK&&group=route&api_key=" + apikey + "&app_id=" + appid + "";

  $http.jsonp(busTimeURL).success(function(timeData){
    $scope.buses = timeData.departures;
  });
	$scope.streetName = $routeParams.street;
});
// end of BusStopController