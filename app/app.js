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

BusStopApp.controller('busStopController', function ($scope, $http, $routeParams) {
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
      maxZoom: 18,
      minZoom: 13
    },
    zoom: 16,
    dragging: false,
    bounds: {}
  };
  

});