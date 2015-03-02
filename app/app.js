var BusStopApp = angular.module("BusStopApp", ["uiGmapgoogle-maps", "ngRoute"]);

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

  $scope.map = {
                center: {
                  latitude: $scope.latitude,
                  longitude: $scope.longitude
                },
                zoom: 15
              };
});
