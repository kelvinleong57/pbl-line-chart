app_graph.controller('PointsController', function($scope, $http) {

    $scope.events = [];
    var max_points = 0;
    
    // for coordinating asynchronous functions
    var events_lock = false;
    var points_lock = false;
    
	getAllEvents = function(){
	 	$http.get(tokenizedURL(ROOT_URL + '/api/events')).
	    	success(function(data, status, headers, config){
            
                // get today's date
                var now = new Date();
                var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var today_timestamp = startOfDay / 1000;
            
                // only keep previous ones
                data.forEach(function(entry) {
                    if (entry.timestamp <= today_timestamp) {
                        $scope.events.push(entry);
                        max_points += entry.points;
                    }
                });
            
                // events are newest first, so reverse it
                $scope.events.reverse();
                
                events_lock = true;
                generateLineChart();
	    	}).
	    	error(function(data, status, headers, config){
	    		console.log('there was an error');
	    		console.log(data);
    	});
	}
    
    getUserPointsAndAttendance = function(user_email) {
	 	$http.get(tokenizedURL(ROOT_URL + '/api/get_points/?email=' + user_email)).
	    	success(function(data, status, headers, config){
	    		$scope.user_points_attend = data;
            
                points_lock = true;
                generateLineChart();
	    	}).
	    	error(function(data, status, headers, config){
	    		console.log('there was an error');
	    		console.log(data);
    	});
	}
    
    
    // SCOPE DATA
    
    generateLineChart = function() {
        
        // if neither asynchronous function has ended, then don't run this
        if (!events_lock || !points_lock) {
            return;
        } else {
            // reset the locks
            events_lock = false;
            points_lock = false;
        }
    
        $scope.data = [];
        $scope.data.push({x: 0, value: 0, date: "", label: ""});

        var accumulated_points = 0;
        
        var user_points_attend_length = $scope.user_points_attend.attended.length;
        var user_points_attend_index = 0;
        
        // loop through all event data and created the scope data
        for (i = 0; i < $scope.events.length; i++) {
            var event = $scope.events[i];
            
            // to prevent having to unnecessarily search when total events reached
            if (user_points_attend_index < user_points_attend_length) {
                if ($scope.user_points_attend.attended.indexOf(event.id) > -1) {
                    accumulated_points += event.points;
                    user_points_attend_index++;
                }
            }
            
            $scope.data.push({x: i + 1, value: accumulated_points, date: dateParser(event.start_time), label: event.name});
        }

        var data_length = $scope.data.length;

        $scope.options = {
            axes: {
                x: {key: 'x',
                    ticksFormatter: function(x) {
                        // to prevent crashing since it renders 0, 0.2, 0.4, 0.6, 0.8 for some reason
                        if ((x > 0 && x < 1) || x >= data_length) {
                            return x;
                        }
                        return $scope.data[x].date;
                    },
                    type: 'linear', min: 0, max: data_length - 1, ticks: data_length},
                y: {type: 'linear', min: 0, max: max_points, ticks: max_points / 10, innerTicks: true, grid: true},
//                y2: {type: 'linear', min: 0, max: 10, ticks: [1, 2, 3, 4]}
            },
            margin: {
                left: 100
            },
            series: [
                {y: 'value', color: 'steelblue', thickness: '2px', type: 'area', striped: true, label: 'Your points'},
//                {y: 'otherValue', axis: 'y2', color: 'lightsteelblue', visible: false, drawDots: true, dotSize: 2}
            ],
            lineMode: 'linear',
            tension: 0.7,
            tooltip: {
                mode: 'scrubber',
                formatter: function(x, y, series) {
                    if (x == 0) {
                        return "Welcome!";
                    }
                    return $scope.data[x].label + ": " + y + " pts";
                }
            },
            drawLegend: true,
            drawDots: true,
            hideOverflow: true,
            columnsHGap: 5
        }
    }
    
    
    generateTop10Points = function() {
        $http.get(tokenizedURL(ROOT_URL + '/api/points')).
	    	success(function(data, status, headers, config){
	    		$scope.email_points = data;
            
                $scope.email_points = $scope.email_points.sort(function (a, b) {
                    // most points first
                    if (a.points > b.points) {
                        return -1;
                    }
                    if (a.points < b.points) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                });
            
	    	}).
	    	error(function(data, status, headers, config){
	    		console.log('there was an error');
	    		console.log(data);
    	});
    }
    
    
    // function calls from here
    getAllEvents();
    getUserPointsAndAttendance("kelvin.leong@berkeley.edu");
    
    generateTop10Points();
});