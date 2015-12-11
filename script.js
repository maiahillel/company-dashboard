var apiKey = ''; // add your Mixpanel apiKey here
var apiSecret = ''; // add you Mixpanel apisecret here
var expire = new Date().getTime() + 120;
var type = 'general';
var unit = 'day';

var yesterday = getDay(1);
var sameDayLastWeek = getDay(8);

var yesterdayVisits;
var sameDayLastWeekVisits;
var weeklyVisits;
var previousWeeklyVisits;

// sets the title of the page.
function setTitle() {
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var dayNames = ["Sunday", "Monday", "Tuesday","Wednesday", "Thursday", "Friday", "Saturday"];
	var date = new Date();
	date.setDate(date.getDate() - 1);
	var todaysDate = dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " +  date.getDate() + " " + date.getFullYear();
	return(todaysDate);
}

// returns the sum of weekly visits
// param index - the day to begin a week back
function weekly(index, list) {
	var sum = 0;
	for (var i = 0; i < 7; i++) {
		sum += list[getDay(index+i)];
	}
	return sum;
}

// gets the date of today minus daysback
// for example, if daysBack = 1 then you will get yesterday's date
// returns the date in the format yyyy-mm-dd
function getDay(daysBack) {
	var date = new Date();
	date.setDate(date.getDate() - daysBack);
	return formatDate(date);
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function getArrow(difference) {
	if (difference >= 0) {
        return '<span class="glyphicon glyphicon-triangle-top" style="color:green">';
    }
    else {
        return '<span class="glyphicon glyphicon-triangle-bottom" style="color:red">';	
    }
}

// get and update the daily visits in the website from mixpanel
function websiteVisits() {
	var events = '["Visited the website"]';
	var sig = md5("api_key=" + apiKey + 'event=' + events + "expire=" + expire + "interval=16" + "type=" + type + "unit=day" + apiSecret);
	$.getJSON('http://mixpanel.com/api/2.0/events/?callback=?', {
			event: events,
            api_key: apiKey,
            expire: expire,
            interval: 16,
            type: type,
            unit: 'day',
            sig: sig,   
        }, function (result) {
        		$('#title').html("<p class='text-center'> <b> Dashboard For Yesterday - " + setTitle() + "</b> </p>");
        		var visitsData = result.data.values["Visited the website"];
            	yesterdayVisits = visitsData[yesterday];
            	sameDayLastWeekVisits = visitsData[sameDayLastWeek];
            	var difference = (( yesterdayVisits - sameDayLastWeekVisits ) / sameDayLastWeekVisits * 100).toFixed(1);
            	$('#dailyVisits').html(yesterdayVisits +  "   " + getArrow(difference) + difference + "%");

            	weeklyVisits = weekly(1, visitsData);
            	previousWeeklyVisits = weekly(8, visitsData);
            	var weeklyDifference = (( weeklyVisits - previousWeeklyVisits ) / previousWeeklyVisits * 100).toFixed(1);
            	$('#weeklyVisits').html(weeklyVisits +  "   " + getArrow(weeklyDifference) + weeklyDifference + "%");

                marketingGrade();
        });
    
}

// get and update the marketing and sales leads from mixpanel
function conversions() {
	var events = '["downloaded case study","Downloaded the product deck","Viewed Blog Page", "asked for a demo bag", "asked for a free demo", "clicked on sign-up", "clicked on sign-in"]';
	var sig = md5("api_key=" + apiKey + 'event=' + events + "expire=" + expire + "interval=16" + "type=" + type + "unit=day" + apiSecret);
	$.getJSON('http://mixpanel.com/api/2.0/events/?callback=?', {
			event: events,
            api_key: apiKey,
            expire: expire,
            interval: 16,
            type: type,
            unit: 'day',
            sig: sig,   
        }, function (result) {

        	// Marketing Leads
        	var downloadedDeck = result.data.values["Downloaded the product deck"];
        	var viewedBlog = result.data.values["Viewed Blog Page"];
        	var downloadedCaseStudy = result.data.values["downloaded case study"];

        	// Daily marketing leads formula, compared to same day last week formula
        	var yesterdayConversions = (( downloadedDeck[yesterday] + viewedBlog[yesterday] + downloadedCaseStudy[yesterday] ) / yesterdayVisits * 100).toFixed(1) ;
        	var sameDayLastWeekConversions = (( downloadedDeck[sameDayLastWeek] + viewedBlog[sameDayLastWeek] + downloadedCaseStudy[sameDayLastWeek] ) / sameDayLastWeekVisits  * 100).toFixed(1);
        	if ( sameDayLastWeekConversions == 0 ) {
        		var difference = yesterdayConversions*100;
        	}
        	else {
        		var difference = getDifference(yesterdayConversions, sameDayLastWeekConversions);
        	}
        	$('#dailyMarketing').html(yesterdayConversions +  "%   " + getArrow(difference) + difference + "%");

        	// Weekly marketing leads formula, compared to previous week 
			var weeklyConversions = (( weekly(1, downloadedDeck) + weekly(1, viewedBlog) + weekly(1, downloadedCaseStudy) ) / weeklyVisits *100 ).toFixed(1) ;
			var previousWeeklyConversions = (( weekly(8, downloadedDeck) + weekly(8, viewedBlog) + weekly(8, downloadedCaseStudy) ) / previousWeeklyVisits *100).toFixed(1) ;
			var weeklyDifference = getDifference(weeklyConversions, previousWeeklyConversions);
			$('#weeklyMarketing').html(weeklyConversions +  "%   " + getArrow(weeklyDifference) + weeklyDifference + "%");

			// Sales Leads
			var signUp = result.data.values["clicked on sign-up"];
        	var signIn = result.data.values["clicked on sign-in"];
        	var demoBag = result.data.values["asked for a demo bag"];
        	var freeBag = result.data.values["asked for a free demo"];

        	// Daily
			var yesterdaySalesConversions = (( signUp[yesterday] + signIn[yesterday] + demoBag[yesterday] + freeBag[yesterday] ) / yesterdayVisits *100 ).toFixed(1);
        		var sameDayLastWeekSalesConversions = (( signUp[sameDayLastWeek] + signIn[sameDayLastWeek] + demoBag[sameDayLastWeek] + freeBag[sameDayLastWeek]) / sameDayLastWeekVisits *100 ).toFixed(1);

			var difference = getDifference(yesterdaySalesConversions, sameDayLastWeekSalesConversions);
			$('#dailySales').html(yesterdaySalesConversions +  "%   " + getArrow(difference) + difference + "%");

			// Weekly
			var weeklySalesConversions = (( weekly(1, signUp) + weekly(1, signIn) + weekly(1, demoBag) + weekly(1, freeBag) ) / weeklyVisits *100 ).toFixed(1);
			var previousWeeklySalesConversions = (( weekly(8, signUp) + weekly(8, signIn) + weekly(8, demoBag) + weekly(8, freeBag)) / previousWeeklyVisits *100).toFixed(1);
			var weeklyDifference = getDifference(weeklySalesConversions, previousWeeklySalesConversions);
			$('#weeklySales').html(weeklySalesConversions +  "%   " + getArrow(weeklyDifference) + weeklyDifference + "%");

    	});
}

function getDifference(current, previous) {
    return ((current - previous) / previous * 100 ).toFixed(2);
}

var index;

// get slots booked from google sheets
function salesConversions() {
        var query = "SELECT A, E";
        blockspring.run("query-google-spreadsheet", { 
        "query": query,
        "url": "" // add your google spreadsheets link here 
        }, { cache: true, expiry: 1000}, function(res) {
            try {
                var slotsByDate = JSON.parse(res).data;
            }
            catch (err) {
                console.log(err);
            }
            var date = new Date(yesterday);

            for (var i = 0; i < 5; i++ ) {
                var regex = /\d{4},\d{1,2},\d{1,2}/;
                var sheetDate = new Date(regex.exec(slotsByDate[i]["Week"]));
                sheetDate.setMonth(sheetDate.getMonth()+1);
                // Look for the week of the current date
                if (date < sheetDate){
                    index = i - 1;
                    var slots = slotsByDate[i-1]["Main KPI slots booked"];
                    var previousWeeklySlots = slotsByDate[i-2]["Main KPI slots booked"];
                    demos();
                    break;
                }

            }   

            // if the slots cell is not initialized to zero in sheet, set to zero
            if (slots == null) {
                slots = 0
            }

            // For calculating the percentage and to avoid dividing by zero       
            if (( previousWeeklySlots == 0 ) || (previousWeeklySlots == null) ){
                previousWeeklySlots = 0;
                var difference = (slots * 100).toFixed(1);
            } 
            else {
                var difference = (( slots - previousWeeklySlots ) / previousWeeklySlots * 100).toFixed(1);

            }

            $('#weeklySlots').html(slots +  "   " + getArrow(difference) + difference + "%");
        });
}

function demos() {
    var query = "SELECT A, F";
    blockspring.runParsed("query-google-spreadsheet", { 
    "query": query,
    "url": "" // add google spreadsheets link here 
        }, { cache: true, expiry: 1000}, function(res) {
            var demosByDate = JSON.parse(res).data;
            var weeklyDemos = demosByDate[index]["demos"];
            var previousWeeklyDemos = demosByDate[index-1]["demos"];
            
            if ( weeklyDemos == null )
                weeklyDemos = 0;
            var difference = (( weeklyDemos - previousWeeklyDemos ) / previousWeeklyDemos * 100).toFixed(1);
            $('#weeklyDemos').html(weeklyDemos +  "   " + getArrow(difference) + difference + "%");
            
        });
}          


// shoold be added manually at this point as HubSpot doesn't have a working API
function marketingGrade() {
    var latestGrade = 63;
    var prevGrade = 81;
    var difference = (( latestGrade - prevGrade ) / prevGrade * 100).toFixed(1);
    $('#grade').html(latestGrade +  "%   " + getArrow(difference) + difference + "%");
    
}

// Run
websiteVisits();
conversions();
salesConversions();

