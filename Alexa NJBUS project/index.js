"use strict";

var Alexa = require("alexa-sdk");
//var Alexa = require("ask-sdk");
var content = "";
var genre = "";
var stop;
var data;
var whole = "abcd";
var responseString = "never changed";
var destinationURL; 
var urls = "";
var cities = [];
var finalID = ""; 
var url; 
//var https = require('https');
var http = require('http');

function stopID(id,callback){
  http.get('http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id='+id, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      //console.log("start"+data+"-end");
    	if(data == ""){
    	  console.log("Invalid stopID");
    		whole = " Invalid stop ID. Please try again";
    		callback(whole);
    		return;
    	}
    	else if(data.includes("No arrival times available.")){
        console.log("No arrival times available.");
    		whole = "It seems that a bus is not going to come for a while: No arrival times available for stop #"+id;
    		callback(whole);
    		return;
    	}
    	else if(data.includes("No service is scheduled for this stop at this time.")){
    	  console.log("No service is scheduled for this stop at this time.");
    		whole = " No service is scheduled for this stop at this time.";
    		callback(whole);
    		return;
    	}
    	console.log("after checking website for bad id's or no scheduels");
      whole = data.substring(data.indexOf(id),data.length);
      //console.log("start-"+whole+"--end");
    
    	
      
      var regex = /#.*&/gm;
      const str = whole;
      let m;
      var busArr = [];
      var destArr = [];
      var arrivalArr=[];
      //search for buses
      while ((m = regex.exec(str)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
              regex.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
              match = match.substring(1,match.indexOf("&"));
              //console.log(`Found match, group ${groupIndex}: ${match}-`);
              busArr.push(match);
          });
      }
      busArr.forEach(function(eachName,index){
        //console.log("bus: "+eachName);
      })
      // this regex that has the bus in the destinationregex = /.*;$/gm;
      regex = /[a-zA-z].*;$/gm;
      //str = whole;
      let m2;
      //search for destination
      while ((m2 = regex.exec(str)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m2.index === regex.lastIndex) {
              regex.lastIndex++;
          }
          
          // The result can be accessed through the `m`-variable.
          m2.forEach((match, groupIndex) => {

              match = match.substring(0,match.indexOf("&"));
              //console.log(`Found match, group ${groupIndex}: ${match}-`);
              destArr.push(match);
          });
      }
        destArr.forEach(function(eachName,index){
          //console.log(" going to : "+eachName);
      })
      // this regex that has the bus in the destinationregex = /.*;$/gm;
      regex = />.*MIN/gm;
      //str = whole;
      let m3;
      //search for destination
      while ((m3 = regex.exec(str)) !== null) {
        
          // This is necessary to avoid infinite loops with zero-width matches
          if (m3.index === regex.lastIndex) {
              regex.lastIndex++;
          }
          
          // The result can be accessed through the `m`-variable.
          m3.forEach((match, groupIndex) => {
            //console.log(`Found match, group ${groupIndex}: ${match}-`);
              if(match.includes("DELAYED")){
					      arrivalArr.push("DELAYED");
				      }
				      else if(match.includes("< 1 MIN")){	
					      arrivalArr.push("less than 1 Minute");
				      }
				     
				else{
				
              match = match.substring(1,match.indexOf("&"));
              //console.log(`Found match, group ${groupIndex}: ${match}-`);
              if(match == "1"){
                 arrivalArr.push("less than 1 Minute");
              }
              else{
                arrivalArr.push(match+" Minutes");  
              }
              
				}
          });
      }
      whole = "";
        arrivalArr.forEach(function(eachName,index){
          
          whole += "bus "+busArr[index]+" going to "+destArr[index]+" is arriving in : "+eachName+". ";
      })
      //console.log(whole);
     
      
      //console.log("right before deafult callback");
      callback(whole);
      
    });
  
  }).on("error", (err) => {
     console.log("Error: " + err.message);
  });;
  
  
}
function searchBus(bus,callback){
  console.log("searchBUs begins here");
  url = "http://mybusnow.njtransit.com/bustime/wireless/html/selectdirection.jsp?route="+bus
  cities = [];
  console.log(url);
    http.get(url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
//-------------------------------------------
    //const regex = /selectstop.*"|				[a-zA-z].*/gm;  
    const regex = /				[a-zA-z].*/gm;      
    const str = data;
    let m;
    var check = false;
    //to get the actual link to the next page: const regex = /selectstop.*>/gm;
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            
            //console.log(`Found swag match, group ${groupIndex}: ${match}`);
            //if(match.charAt(match.length-1) == '\"'){
              //urls ='http://mybusnow.njtransit.com/bustime/wireless/html/'+match.substring(0,match.length-1);
              //console.log("wow"+urls);
            //}
           // else{
              match = match.trim();
              //match = match.substring(3,match.indexOf("\""));
              console.log("found match: "+match+"-");
              cities.push(match);
              console.log(cities[0]+" "+cities[1]);
              /*
              //check = match.includes(toCity);
              if(check){
                //console.log(match+" is in "+toCity);
                //console.log("We are going to take "+bus+" towards "+toCity+" and url :"+urls);
                responseString = " was found";
                callback();
                //return;
              }
              else{
                //console.log(toCity+" is not in "+match);
              }*/
            //}
            
        });

    }
    callback();
    /*
    if(check == false){
      responseString = "Sorry, the "+bus+" does not travel to"+toCity+". Please refer to the NJ Transit offical website for route information";
      callback(responseString);
      return;
    }
    */
    });
  
  }).on("error", (err) => {
     console.log("Error first: " + err.message);
  });;
  
}
function searchCity(city,callback){
  
}
function searchStreet(street,callback){
  console.log("search street starts here with url"+urls);
    http.get(urls, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      //const regex = /<a.*off/gm;
      //const regex = /direction.*off/gm;
      //const regex = /eta.*$/gm;;
      //const regex = /eta.*$|				[a-zA-z].*/gm;
      const regex = /id=.*&|				[a-zA-z].*/gm;
      const str = data;
      let m;
      var check
      var count = 1; 
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            
            //console.log(`Found swag match, group ${groupIndex}: ${match}`);
            if(count % 2 != 0){
              //console.log(count);
              //urls ='http://mybusnow.njtransit.com/bustime/wireless/html/'+match.substring(0,match.length-2);
              console.log("id being scanned "+match);
              urls = match;
              //console.log("wow"+urls);
              //count++;
            }
            else{
              console.log("WOW"+match);
              match = match.trim();
              //match = match.substring(3,match.indexOf("\""));
              //console.log("-"+street+"- compare to -"+match+"-");
              
              check = (street.toUpperCase()).includes(match);
              if(check){
                console.log(match+" is in "+street);
                
                console.log("The bus is arriving to the street: "+street+" final url is "+urls);
                responseString = street+" was found";
                finalID = urls
                callback(finalID);
                //return;
              }
              else{
                //console.log(street+" is not in "+match);
              }
            }
            count++;
        });
        
    }
      console.log("after loop");
          callback();
          });
        
        }).on("error", (err) => {
           console.log("Error second: " + err.message);
        });
}

var handlers = {
  "LaunchRequest": function () {
    this.response.speak("Hello. I am your busBuddy. What would you like me to do?").listen("I'm sorry what was that?"); 
    this.emit(':responseReady');
  },
  "findaBUS": function () {
    var bus = this.event.request.intent.slots.bus.value;
    //var toCity = this.event.request.intent.slots.toCity.value;
    //var street = this.event.request.intent.slots.street.value;
    var self = this;
    //this.handler.state("_Questions");
    //console.log("i want to take the "+bus+" going to "+toCity+" on "+street);

    
    searchBus(bus,function(){
      
      if(cities.length == 0){
        console.log("could not find bus"+bus);
        //self.handler.state = "_Questions";
        self.response.speak("The "+bus+" bus does not exist. Please try again.");
        self.emit(':responseReady');
        return;
      }
      console.log("Back in here");
      console.log(cities[0]+" and  "+cities[1]+"on bus "+bus);
      self.handler.state = "_Questions";
      self.response.speak("Ok you chose the "+bus+" bus. In which direction, "+cities[0]+" or "+cities[1]).listen("What was that?");
      self.emit(":responseReady");
    });
    /*searchBus(bus,toCity,street,function(){
      console.log("Back here");
      if(urls == ""){
        console.log("could not find bus"+bus);
        self.response.speak("The "+bus+" does not exist. Please try again.");
        self.emit(':responseReady');
        return;
      }
      searchStreet(street,function(){
        console.log("final callback in main with id: "+finalID+" and response string "+responseString);
        if(finalID == ""){
          self.response.speak(street+" could not be found for bus "+bus+". Please try again.");
          self.emit(':responseReady');
        }
        var intID = finalID.substring(3,finalID.length-1);
        intID = parseInt(intID);
        console.log("final callback in main with changed id: "+intID);
        
        stopID(parseInt(finalID.substring(3,finalID.length-1)),function() {
          if(whole == " Invalid stop ID. Please try again"){
            self.response.speak(intID+" is an invalid stop ID. Please try again");   
          }
         else if(whole == " No service is scheduled for this stop at this time."){
            self.response.speak(" No service is scheduled for stop "+intID+" at this time."); 
         }
         else{
          self.response.speak("Ok you tracked bus stop "+intID+". Here are the incoming buses: "+whole);
         }
          self.emit(':responseReady');
              
        })
          
      })
          
    });*/
    
    /*
    if(toCity.includes(" ")){
      toCity = toCity.replace(" ", "+");
    }
    */
   
   //this.response.speak("Here are the buses arriving to the stop with the "+bus+" bus going towards "+toCity+" on "+street);
    //this.emit(':responseReady');
  },
  "stopID" : function(){
    stop = this.event.request.intent.slots.stop.value;
    console.log(stop+" is the stop inputed");
    var self = this;

    stopID(stop,function() {
      //console.log("whole has been changed to "+whole);
       if(whole == " Invalid stop ID. Please try again"){
        self.response.speak(stop+" is an invalid stop ID. Please try again");   
       }
       else if(whole == " No service is scheduled for this stop at this time."){
          self.response.speak(" No service is scheduled for stop "+stop+" at this time."); 
       }
       else{
        self.response.speak("Ok you tracked bus stop "+stop+". Here are the incoming buses: "+whole);
       }
       self.emit(':responseReady');
      /*setTimeout(function(){
        self.response.speak("Ok you tracked bus stop "+stop+". Heres are the incoming buses :"+whole);
        self.emit(':responseReady');
    },6000);*/
    });
  },

};
var questionhandlers = Alexa.CreateStateHandler("_Questions",{
  "citySearch": function(){
    /*if(url == ""){
      this.response.speak("You have not selected a bus. Ask me something like: I want to take the 73 bus");
      this.emit(":responseReady");
    }*/
    var res; 
    var city = this.event.request.intent.slots.city.value;
    if(((cities[0]).toUpperCase()).includes(city.toUpperCase()) || ((cities[1]).toUpperCase()).includes(city.toUpperCase())){
      res = cities[0].replace("/", "%2F");
      res = res.replace(" ","+"); 
      urls = "http://mybusnow.njtransit.com/bustime/wireless/html/selectstop.jsp?route=73&direction="+res;
      this.response.speak("Ok, you want to go to "+city+". On what street?").listen("What street is the bus stop on?");
      this.emit(":responseReady");
    }
    else if(((cities[1]).toUpperCase()).includes(city.toUpperCase())){
      res = cities[1].replace("/", "%2F");
      res = res.replace(" ","+"); 
      urls = "http://mybusnow.njtransit.com/bustime/wireless/html/selectstop.jsp?route=73&direction="+res;
      this.response.speak("Ok, you want to go to "+city+". On what street?").listen("What street is the bus stop on?");
      this.emit(":responseReady");
    }
    console.log(cities[0]);
    console.log(cities[1]);
    this.response.speak(city+" is an invalid city. Please try again");
    this.emit(":responseReady");
  },
  "searchStreet": function(){
    var street = this.event.request.intent.slots.street.value;
    var self = this; 
    searchStreet(street,function(){
      if(finalID == ""){
          self.response.speak(street+" could not be found for that bus. Please try again.");
          self.emit(':responseReady');
      }
      var intID = finalID.substring(3,finalID.length-1);
      intID = parseInt(intID);
      console.log("final callback in main with changed id: "+intID);
      
      stopID(parseInt(finalID.substring(3,finalID.length-1)),function() {
        if(whole == " Invalid stop ID. Please try again"){
          self.response.speak(intID+" is an invalid stop ID. Please try again");   
        }
        else if(whole == " No service is scheduled for this stop at this time."){
          self.response.speak(" No service is scheduled for stop "+intID+" at this time."); 
        }
        else{
          self.response.speak("Ok you tracked bus stop "+intID+". Here are the incoming buses: "+whole);
        }
        self.emit(':responseReady');
    });
          
    });

    //this.response.speak(street+" is what you said right?");
    //this.emit(":responseReady");
  }
});
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers,questionhandlers);
    alexa.execute();
};