/* 
  weather.js - Javascript file for Weather Comparison
  By Brian Munger - CS 290 at Oregon State Univ
  05/19/2024
*/

// Will only run code once the page is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // My API code to my specific OpenWeatherMap account 
  const apiKey = "8201307a5bfbca6321671d903df1c63b";

  // Variables for the entered cities and states by the user
  var cityName1;
  var stateCode1;
  var cityName2;
  var stateCode2;

  // Search querey is limited to the United States (can't be changed)
  const countryCode = "US";
  
  // Variable that stores the temperature type the user chooses (F or C)
  var temp_type = '';

  /*
    This function displays the weather information for the first city/state that 
    the user chooses. It does this by altering predefined HTML elements and updating
    their text/image. 
  */
  function displayCity1(dayofweek, highs, lows, rain, outlook_icon_id) {
    // Displays the previously hidden table
    document.getElementById('table1').removeAttribute("hidden");

    // Updates the header of the table with the city name 
    document.getElementById('city1nameheader').textContent = cityName1;

    /*
      Displays the day of the week, forecasted highs and lows, rain probability, and outlook
      image. Compacted into a for loop to save space. 
    */
    for (let i = 0; i < 5; i++) {
      document.getElementById(`1day${i+1}`).textContent = dayofweek[i];
      document.getElementById(`1high${i+1}`).textContent = highs[i];
      document.getElementById(`1low${i+1}`).textContent = lows[i];
      document.getElementById(`1rain${i+1}`).textContent = rain[i] + "%";
      document.getElementById(`1outlook${i+1}`).src = `images/${outlook_icon_id[i]}.png`;
    }
  }
  

  /*
    This function displays the weather information for the second city/state that 
    the user chooses. It does this by altering predefined HTML elements and updating
    their text/image. 
  */
  function displayCity2(dayofweek, highs, lows, rain, outlook_icon_id) {
    // Displays the previously hidden table
    document.getElementById('table2').removeAttribute("hidden");

    // Updates the header of the table with the city name 
    document.getElementById('city2nameheader').textContent = cityName2;

    /*
      Displays the day of the week, forecasted highs and lows, rain probability, and outlook
      image.
    */
      for (let i = 0; i < 5; i++) {
        document.getElementById(`2day${i+1}`).textContent = dayofweek[i];
        document.getElementById(`2high${i+1}`).textContent = highs[i];
        document.getElementById(`2low${i+1}`).textContent = lows[i];
        document.getElementById(`2rain${i+1}`).textContent = rain[i] + "%";
        document.getElementById(`2outlook${i+1}`).src = `images/${outlook_icon_id[i]}.png`;
      }
  }

  /*
    This function sorts the information received from the JSON file into different arrays. The
    main information gathered from the file includes the day of the week forecasted, high temps,
    low temps, rain probability, and the general outlook for each day. 
  */
  function displayWeather(fiveDayForecast, dailyForecast, citynum) {
    // Arrays for information from the JSON file to be sorted into 
    var dayofweek = [];
    var dayofweekwords = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    var highs = [];
    var lows = [];
    var rain = [];
    var outlook_icon_id = [];

    // Gets the current day of the week
    var currentDate = new Date();
    var currentDay = currentDate.getDay();

    // For each day in the five-day forecast...
    fiveDayForecast.forEach((date, index) => {
      // Calculate the day of the week for the forecast
      var forecastDay = (currentDay + index) % 7;
      dayofweek[index] = dayofweekwords[forecastDay];
      
      // Forecast object currently being used
      const forecast = dailyForecast[date];
      /*
       Averages out the rain percentage. Divide by eight as there are eight data entries (every three hours) recorded
       for each day. 
      */
      forecast.rainper = forecast.rainper / 8; 

      /* 
        If the user previously chose for the temperature to be displayed in fahrenheit, the high/low temperature is converted
        from kelvin to fahrenheit. It is then rounded off. If the user chooses for the temperature to be displayed in
        celsius, however, then the high/low temperature is converted from kelvin to celsius. It is then also rounded off.
      */
      if (temp_type == 'F') {   // F = (K - 273.15) * 1.8 + 32, then rounded off
        highs[index] = Math.round((forecast.hightemp - 273.15) * 1.8 + 32);
        lows[index] = Math.round((forecast.lowtemp - 273.15) * 1.8 + 32);
      } else if (temp_type == 'C') {  // C = (K - 273.15), then rounded off
        highs[index] = Math.round((forecast.hightemp - 273.15));
        lows[index] = Math.round((forecast.lowtemp - 273.15));
      }
      // Multiples rain probability by 100 (.50 -> 50%), then rounds it off
      rain[index] = Math.round(forecast.rainper * 100);
      // Icon id is transfered over to the respective array
      outlook_icon_id[index] = forecast.outlook_icon;
    });

    // If we are currently organizing the data for the first city, display it using the displayCity1 function
    if (citynum == 1)
      displayCity1(dayofweek, highs, lows, rain, outlook_icon_id);
    // Otherwise, display it using the displayCity2 function
    else if (citynum == 2)
      displayCity2(dayofweek, highs, lows, rain, outlook_icon_id);
  }

  /*
    This function reads information from the JSON file received in the API call and then assigns the information 
    to forecast objects. 
  */
  function obtainForecast(data, citynum) {
    // Daily forecast object 
    const dailyForecast = {};

    // Anaylzes the data passed through and organizes it by date 
    data.list.forEach(forecast => {
      // Assigns a date using the dt_txt command (provided by openweather)
      const date = forecast.dt_txt.split(' ')[0];

      // Checks to see if there is no forecast data for the given date
      if(!dailyForecast[date]) {
        /* 
          If no forecasted data exists for the date, a new forecast entry is made consiting of the high and low temp,
          rain probability percentage, and outlook icon id.
        */
        dailyForecast[date] = {
          hightemp: forecast.main.temp_max,
          lowtemp: forecast.main.temp_min,
          rainper: forecast.pop,
          outlook_icon: forecast.weather[0].icon
        };
      // If a forecast does exist for the given date, update/add to the information 
      } else { 
        // Update the high/low temperature to be the high or low of the current and previous forecasted temperatures 
        dailyForecast[date].hightemp = Math.max(dailyForecast[date].hightemp, forecast.main.temp_max);
        dailyForecast[date].lowtemp = Math.min(dailyForecast[date].lowtemp, forecast.main.temp_min);
        // Add the rain probability percentage to be averaged out later
        dailyForecast[date].rainper += forecast.pop;
      }
    });

    // Extract the first five days of forecasted data from above
    const fiveDayForecast = Object.keys(dailyForecast).slice(1, 6);

    // Call the displayWeather function to sort the data into arrays
    displayWeather(fiveDayForecast, dailyForecast, citynum);
  }

  /*
    This function makes the API calls to openweather to obtain the JSON files that include weather forecast information for
    the provided locations. If the location does not exist, an error message is presented to the user. Otherwise, the information
    is passed to the above functions to be sorted and displayed. 
  */
  function findWeather() {
    // API links that take the city name, state code, country code, and unique API key as a parameter
    var apiUrl1 = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName1},${stateCode1},${countryCode}&appid=${apiKey}`;
    var apiUrl2 = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName2},${stateCode2},${countryCode}&appid=${apiKey}`;

    // Attempts to access the link for the first API call
    fetch(apiUrl1)
    .then(response => {
    // If there is an error in the response, console.log a network error
    if (!response.ok) {
      throw new Error('Error: Network response was not ok');
    }
      return response.json();
    })
    // Otherwise, pass the data to the above obtainForecast function. data = JSON file with forecast information, 1 = city #1 being analyzed
    .then(data => {
      obtainForecast(data, 1);
    })
    // If an error occurs, it is because the city does not exist. Error is presented to the webpage and console
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      document.getElementById('noCityTxt1').textContent = "Unable to locate " + cityName1 + ", " + stateCode1 + ".";
    });

    // Attempts to access the link for the second API call
    fetch(apiUrl2)
    .then(response => {
    // If there is an error in the response, console.log a network error
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
      return response.json();
    })
    // Otherwise, pass the data to the above obtainForecast function. data = JSON file with forecast information, 2 = city #2 being analyzed
    .then(data => {
      obtainForecast(data, 2);
    })
    // If an error occurs, it is because the city does not exist. Error is presented to the webpage and console
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      document.getElementById('noCityTxt2').textContent = "Unable to locate " + cityName2 + ", " + stateCode2 + ".";
    });

    // Displays the "5 Day Forecast" header after the search is made
    document.getElementById('5dayheader').textContent = "5 Day Forecast";
  }

  /*
    This function gets the information the user entered on the webpage and assigns it to the respective variables previously defined
    above. It also ensures that certain elements of the webpage are hidden when the compare button is hit (which acts as a reset for
    the program).
  */
  function getInformation() {
      // Hides all error messages that may have been previously displayed
      document.getElementById('noCityWarning1').textContent = "";
      document.getElementById('noCityWarning2').textContent = "";
      document.getElementById('noStateWarning1').textContent = "";
      document.getElementById('noStateWarning2').textContent = "";
      document.getElementById('noCityTxt1').textContent = "";
      document.getElementById('noCityTxt2').textContent = "";
      document.getElementById('city1nameheader').textContent = "";
      document.getElementById('city2nameheader').textContent = "";
      // Hides the tables initially while the information is being sorted
      document.getElementById('table1').setAttribute("hidden", "hidden");
      document.getElementById('table2').setAttribute("hidden", "hidden");

      // Gets the information the user entered regarding the 1st and 2nd city and state to be compared
      cityName1 = document.getElementById('City1').value;
      stateCode1 = document.getElementById('State1').value;
      cityName2 = document.getElementById('City2').value; 
      stateCode2 = document.getElementById('State2').value;

      // Boolean variable that tracks if any information is missing (i.e.: a state or city is not entered)
      var missingInfo = false;

      /*
        These conditional statements check to see if all required information was provided by the user. If not,
        an error message is displayed to instruct the user to enter all required information. The above boolean statement
        is set to true, indicating to the program to not make the search until all information has been provided. 
      */
      if (cityName1.length == 0) {
        document.getElementById('noCityWarning1').textContent = "Enter a city";
        missingInfo = true;
      }
      if (cityName2.length == 0) {
        document.getElementById('noCityWarning2').textContent = "Enter a city";
        missingInfo = true;
      }
      if (stateCode1.length == 0) {
        document.getElementById('noStateWarning1').textContent = "Select a state";
        missingInfo = true; 
      }
      if (stateCode2.length == 0) {
        document.getElementById('noStateWarning2').textContent = "Select a state";
        missingInfo = true;
      }

      // Gathers from the webpage whether the user wants temperatures in fahrenheit or celsius
      if (document.getElementById('fahren').checked)
        temp_type = 'F';
      else if (!document.getElementById('fahren').checked)
        temp_type = 'C';

      // If there is not any missing information, call the findWeather() function that makes the API call
      if (!missingInfo) 
        findWeather();
  }

  // When the 'compareButton' is clicked, the getInformation() function is called
  document.getElementById('compareButton').addEventListener('click', function() {
      getInformation();
  });
});
