var BusStopApp = angular.module("BusStopApp", ["uiGmapgoogle-maps", "ngRoute"]);
var apikey = "97df55d10b30aac5a0ac7ce748c5b717";
var appid = "08eebd27";

BusStopApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
      templateUrl: '/app/pages/search.html',
        controller: 'searchController'
      }).
      when('/map/:latitude/:longitude', {
      templateUrl: '/app/pages/map.html',
        controller: 'busStopController'
      });
}]);

/**
 *  searchController
 */
 
BusStopApp.controller('searchController', function ($scope, $http, $location) {
    $scope.formInfo = {};
    $scope.saveData = function() {
    	getLatLong($scope.formInfo.Name);
    };

    function getLatLong(address){
    	//build url for google maps to get long lat and change app path
    	var googleMapsURL = "http://maps.googleapis.com/maps/api/geocode/json?callback=JSON_CALLBACK&address=" + address + ",london";
      $http.get(googleMapsURL)
      	.success(function(geoData){
      		var newURL = 'map/' + geoData.results[0].geometry.location.lat + "/" + geoData.results[0].geometry.location.lng;
          $location.path(newURL);
      });
  	}
});
// end of searchController


/**
 *  busStopController
 */
  
BusStopApp.controller('busStopController', function ($scope, $http, $routeParams) {

  var initialMapLoad = 0;
  var busStopURL = "";
  var markers = [];
  
	$scope.message = 'busStopController';

	$scope.latitude = $routeParams.latitude;
  $scope.longitude = $routeParams.longitude
  
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
    zoom: 18,
    dragging: false,
    bounds: {},
    events: {
      idle: function (map, eventName, args) {
        $scope.$apply(function () {
          busStopURL = buildAPIUrl(map.getBounds());
          $http.jsonp(busStopURL).success(function(data){
            console.log("-------- API CALL ----------");
            console.log("TransportAPI json url: " + busStopURL);
            console.log("-------- END API CALL ----------");
            setupGoogleMarkers(data, busStopURL, markers);
          }); 
        });
      }
    } 
  };
  
	$scope.markers = [];
	// add markers into array
	var addMarker = function (i, longitude, latitude, name, atcocode, bearing, locality, smscode) {

		var ret = {
			id: i,
      options: {
      	draggable: false,
      	labelAnchor: '10 39',
      	labelContent: i,
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
    console.log(ret);
    return ret;
  };

  // function to build url
  function buildAPIUrl(bounds){
    var url = "http://transportapi.com/v3/uk/bus/stops/bbox.json?callback=JSON_CALLBACK&minlon=" + bounds.ma.j + "&minlat=" + bounds.va.k + "&maxlon=" + bounds.ma.k + "&maxlat=" + bounds.va.j + "&api_key=fed809061ed9956f32d719787fcf8d0e&app_id=ad0f4534"; 
    
    return url;
  }

	// builds markers on map
	function setupGoogleMarkers(busStops, url, markers )
	{
  	var pages = busStops.total/25;
    
		for (var key in busStops.stops) {
      var stop = busStops.stops[key];
      var addToArray=true;
      
      for(var i=0; i < markers.length; i++){
        if(markers[i].atcocode === stop.atcocode){
          addToArray=false;
          console.log("no");
        }
      }
      if(addToArray){
        markers.push(addMarker(stop.atcocode, stop.longitude, stop.latitude, stop.name, stop.atcocode, stop.bearing, stop.locality, stop.smscode));
      }
		}
		$scope.markers = markers;
	}
});