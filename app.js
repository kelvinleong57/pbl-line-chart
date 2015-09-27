ROOT_URL = 'http://testing.berkeley-pbl.com';
var token = '6b656c76696e2e6c656f6e67406265726b656c65792e656475';

var app = angular.module('myApp', ['ngRoute']);
var app_graph = angular.module('myAppGraph', ['n3-line-chart']);

//app.controller('HomeController', function($scope, $http) {
//	$scope.test = 'test';
//	getPosts = function(){
//	 	$http.get(tokenizedURL(ROOT_URL + '/api/current_members')).
//	    	success(function(data, status, headers, config){
//	    		$scope.members = data;
//	    	}).
//	    	error(function(data, status, headers, config){
//	    		console.log('there was an error');
//	    		console.log(data);
//    	});
//	}	
//	getPosts();
//});

function tokenizedURL(url){
    if(url.indexOf('?') != -1){
        tokenized = url + '&token='+token;
    }
    else{
        tokenized =  url + '?token='+token;
    }
    return tokenized;
}

function dateParser(date) {
    var start_time_month = date.substring(5, 7) + "/";
    var start_time_day = date.substring(8, 10);
    
    if (start_time_month[0] == "0") {
        start_time_month = start_time_month.substring(1);
    }
    
    if (start_time_day[0] == "0") {
        start_time_day = start_time_day.substring(1);
    }
    
    return start_time_month + start_time_day;
}