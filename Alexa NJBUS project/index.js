"use strict";
var Alexa = require("alexa-sdk");
var stop;
var whole = "abcd";
var urls = "";
var cities = [];
var finalID = "";
var url;
var http = require('http');

function stopID(id, callback) {
  http.get('http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id=' + id, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      if (data == "") {
        //Inputed stop doesnt exist
        console.log("Invalid stopID");
        whole = " Invalid stop ID. Please try again";
        callback(whole);
        return;
      }
      else if (data.includes("No arrival times available.")) {
        //Bus stop exist, but there are no buses available 
        console.log("No arrival times available.");
        whole = "It seems that a bus is not going to come for a while: No arrival times available for stop #" + id;
        callback(whole);
        return;
      }
      else if (data.includes("No service is scheduled for this stop at this time.")) {
        //Bus stop exist, but there are no buses available 
        console.log("No service is scheduled for this stop at this time.");
        whole = " No service is scheduled for this stop at this time.";
        callback(whole);
        return;
      }
      //Regex to search page contents.
      whole = data.substring(data.indexOf(id), data.length);
      var regex = /#.*&/gm;
      const str = whole;
      let m;
      var busArr = [];
      var destArr = [];
      var arrivalArr = [];
      //search for buses
      while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
          match = match.substring(1, match.indexOf("&"));
          busArr.push(match);
        });
      }
      busArr.forEach(function (eachName, index) {
        //console.log("bus: "+eachName);
      })
      // regex that has the bus in the destinationregex = /.*;$/gm;
      regex = /[a-zA-z].*;$/gm;
      let m2;
      //search for destination
      while ((m2 = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m2.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m2.forEach((match, groupIndex) => {
          match = match.substring(0, match.indexOf("&"));
          //console.log(`Found match, group ${groupIndex}: ${match}-`);
          destArr.push(match);
        });
      }
      destArr.forEach(function (eachName, index) {
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
          if (match.includes("DELAYED")) {
            arrivalArr.push("DELAYED");
          }
          else if (match.includes("< 1 MIN")) {
            arrivalArr.push("less than 1 Minute");
          }

          else {

            match = match.substring(1, match.indexOf("&"));
            //console.log(`Found match, group ${groupIndex}: ${match}-`);
            if (match == "1") {
              arrivalArr.push("less than 1 Minute");
            }
            else {
              arrivalArr.push(match + " Minutes");
            }

          }
        });
      }
      whole = "";
      arrivalArr.forEach(function (eachName, index) {

        whole += "bus " + busArr[index] + " going to " + destArr[index] + " is arriving in : " + eachName + ". ";
      })
      callback(whole);

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });;


}
function searchBus(bus, callback) {
  console.log("searchBUs begins here");
  url = "http://mybusnow.njtransit.com/bustime/wireless/html/selectdirection.jsp?route=" + bus
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
          match = match.trim();
          console.log("found match: " + match + "-");
          cities.push(match);
          console.log(cities[0] + " " + cities[1]);
        });

      }
      callback();
    });

  }).on("error", (err) => {
    console.log("Error first: " + err.message);
  });;

}
function searchStreet(street, callback) {
  console.log("search street starts here with url" + urls);
  http.get(urls, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
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
          if (count % 2 != 0) {
            console.log("id being scanned " + match);
            urls = match;
          }
          else {
            console.log("WOW" + match);
            match = match.trim();
            check = (street.toUpperCase()).includes(match);
            if (check) {
              console.log(match + " is in " + street);
              console.log("The bus is arriving to the street: " + street + " final url is " + urls);
              responseString = street + " was found";
              finalID = urls
              callback(finalID);
            }
            else {
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
    //activated when user opens skill
    this.response.speak("Hello. I am your busBuddy. What would you like me to do?").listen("I'm sorry what was that?");
    this.emit(':responseReady');
  },
  "findaBUS": function () {
    //user has requested to find a bus route
    var bus = this.event.request.intent.slots.bus.value;
    var self = this;

    searchBus(bus, function () {
      if (cities.length == 0) {
        //if cities array is empty, exit
        console.log("could not find bus" + bus);
        self.response.speak("The " + bus + " bus does not exist. Please try again.");
        self.emit(':responseReady');
        return;
      }
      console.log("Back in here");
      console.log(cities[0] + " and  " + cities[1] + "on bus " + bus);
      self.handler.state = "_Questions";
      self.response.speak("Ok you chose the " + bus + " bus. In which direction, " + cities[0] + " or " + cities[1]).listen("What was that?");
      self.emit(":responseReady");
    });
  },
  "stopID": function () {
    //User gave alexa exact Bus ID Number. 
    stop = this.event.request.intent.slots.stop.value;
    console.log(stop + " is the stop inputed");
    var self = this;

    stopID(stop, function () {
      if (whole == " Invalid stop ID. Please try again") {
        self.response.speak(stop + " is an invalid stop ID. Please try again");
      }
      else if (whole == " No service is scheduled for this stop at this time.") {
        self.response.speak(" No service is scheduled for stop " + stop + " at this time.");
      }
      else {
        self.response.speak("Ok you tracked bus stop " + stop + ". Here are the incoming buses: " + whole);
      }
      self.emit(':responseReady');
    });
  },

};
var questionhandlers = Alexa.CreateStateHandler("_Questions", {
  "citySearch": function () {
    //lots of text formatting. 
    var res;
    var city = this.event.request.intent.slots.city.value;
    if (((cities[0]).toUpperCase()).includes(city.toUpperCase()) || ((cities[1]).toUpperCase()).includes(city.toUpperCase())) {
      res = cities[0].replace("/", "%2F");
      res = res.replace(" ", "+");
      urls = "http://mybusnow.njtransit.com/bustime/wireless/html/selectstop.jsp?route=73&direction=" + res;
      this.response.speak("Ok, you want to go to " + city + ". On what street?").listen("What street is the bus stop on?");
      this.emit(":responseReady");
    }
    else if (((cities[1]).toUpperCase()).includes(city.toUpperCase())) {
      res = cities[1].replace("/", "%2F");
      res = res.replace(" ", "+");
      urls = "http://mybusnow.njtransit.com/bustime/wireless/html/selectstop.jsp?route=73&direction=" + res;
      this.response.speak("Ok, you want to go to " + city + ". On what street?").listen("What street is the bus stop on?");
      this.emit(":responseReady");
    }
    console.log(cities[0]);
    console.log(cities[1]);
    this.response.speak(city + " is an invalid city. Please try again");
    this.emit(":responseReady");
  },
  "searchStreet": function () {
    var street = this.event.request.intent.slots.street.value;
    var self = this;
    searchStreet(street, function () {
      if (finalID == "") {
        self.response.speak(street + " could not be found for that bus. Please try again.");
        self.emit(':responseReady');
      }
      var intID = finalID.substring(3, finalID.length - 1);
      intID = parseInt(intID);
      console.log("final callback in main with changed id: " + intID);

      stopID(parseInt(finalID.substring(3, finalID.length - 1)), function () {
        if (whole == " Invalid stop ID. Please try again") {
          self.response.speak(intID + " is an invalid stop ID. Please try again");
        }
        else if (whole == " No service is scheduled for this stop at this time.") {
          self.response.speak(" No service is scheduled for stop " + intID + " at this time.");
        }
        else {
          self.response.speak("Ok you tracked bus stop " + intID + ". Here are the incoming buses: " + whole);
        }
        self.emit(':responseReady');
      });

    });
  }
});
exports.handler = function (event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers, questionhandlers);
  alexa.execute();
};
