var l3viAPI = "http://api.l3vi.de/";
var weatherAPI = "http://api.openweathermap.org/data/2.5/weather?";
var timezoneAPI = "https://maps.googleapis.com/maps/api/timezone/json";

var offset = 0;
var intervals = {};

var timezone, place, address;

function toFixed(n) {
	return n<10?"0"+n:n;	
}

function refreshTime() {
	var offset = +$("#time").data("offset");
	var x = new Date(+new Date() + offset);
	setText("#time",toFixed(x.getUTCHours()) + ":" + toFixed(x.getMinutes()) + ":" + toFixed(x.getSeconds()));
	setTimeout(refreshTime, 1000);
}

function getData() {
	var loc = $.ajax({
		dataType: "json",
		url: l3viAPI + "location.json",
		async: false
	}).responseJSON;
	
	setText("#address",loc["address"]);
	address = loc["address"]
	$("#address").addClass("clickable");
	$("#address").click(function(){
		document.location.href="https://www.google.com/maps?q=" + address;
	});
	
	$.getJSON(l3viAPI + "status.json", function(data){
		setText("#status",data["status"]);
		var diff = parseInt((+new Date() - data["last_update"])/360000);
		setText("#statustime",diff + " hours");
		$("#status").addClass("clickable");
		$("#status").click(function(){
			document.location.href="https://play.google.com/store/apps/details?id=com.urbandroid.sleep";
		});
	});
	
	$.getJSON(l3viAPI + "mood.json", function(data){
		setText("#mood",data["mood"]);
		$("#mood").addClass("clickable");
		$("#mood").click(function(){
			document.location.href="//api.l3vi.de/posts/api.html";
		});
	});
	
	$.getJSON(weatherAPI, {lat: loc.lat, lon: loc.lon},function(data){
		place=data["name"];
		setText("#city",data["name"]);
		setText("#temp",Math.round(10*(data["main"]["temp"]-272.15))/10 + "°C");
		setText("#weather",data["weather"][0]["description"].replace("Sky is Clear","a clear sky"));
		$("#weather").addClass("clickable");
		$("#weather").click(function(){
			document.location.href="https://google.com/search?q=" + place.replace(" ","+");
		});
	});
	
	$.getJSON(timezoneAPI + "?location=" + loc.lat + "," + loc.lon + "&timestamp=" + +new Date()/1000, function(data){
		$("#time").data("offset",(data["rawOffset"] + data["dstOffset"]) * 1000);
		timezone = data["timeZoneName"];
		$("#time").click(function(){
			document.location.href="https://en.wikipedia.org/wiki/" + timezone.replace(" ","_");
		});
		$("#time").addClass("clickable");
		refreshTime();
	});
	
	$.getJSON(l3viAPI + "battery.json", function(data){
		setText("#battery", data["battery"] + "%");
		var timediff = +new Date() - parseInt(data["last_update"]*1000);
		if(timediff>12000000) {
			setText("#batterytime", "out of date");
			console.log(timediff);
		}
		else {
			setText("#batterytime", "up to date");
		}
	});
	
	$.getJSON(l3viAPI + "calendar.json", function(data){
		var cal = (data["calendar"] != "") ? data["calendar"] : "unknown"
		setText("#calendar", data["calendar"]);
	});
	
	setTimeout(getData, 120000)
}

function setText(where,what) {
	clearInterval(intervals[where]);
	$(where).text(what);
}

function jibber(what) {
	var len=$(what).text().length;
	var ret="";
	for(var i=len;i>0;i--){
		ret += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.round(Math.random()*61)];
	}
	$(what).text(ret);
}

function jibbertime() {
	$("#time").text(Math.round(Math.random()*100) + ":" + Math.round(Math.random()*100) + ":" + Math.round(Math.random()*100));
}

function jibbertemp() {
	$("#temp").text(Math.round(Math.random()*100)/10 + "°C");
}

function jibberbattery() {
	$("#battery").text(Math.round(Math.random()*100) + "%");
}

$(function(){
	intervals["#status"] = setInterval("jibber('#status')", 100);
	intervals["#address"] = setInterval("jibber('#address')", 100);
	intervals["#mood"] = setInterval("jibber('#mood')", 100);
	intervals["#batterytime"] = setInterval("jibber('#batterytime')", 100);
	intervals["#time"] = setInterval("jibbertime()", 100);
	intervals["#city"] = setInterval("jibber('#city')", 100);
	intervals["#temp"] = setInterval("jibbertemp()", 100);
	intervals["#weather"] = setInterval("jibber('#weather')", 100);
	intervals["#battery"] = setInterval("jibberbattery()", 100);
	intervals["#calendar"] = setInterval("jibber('#calendar')", 100);
	setTimeout(getData,1000);
});