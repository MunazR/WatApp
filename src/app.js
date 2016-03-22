var UI = require('ui');
var AJAX = require('ajax');
var Vector2 = require('vector2');
var config = require('config');

var menu = new UI.Menu({
  sections: [{
    title: "WatApp",
    items: [{
      title: 'Weather',
      subtitle: 'Local weather'
    }, {
      title: 'Food Services',
      subtitle: 'Outlet details'
    }, {
      title: 'Food Services',
      subtitle: 'Outlet menus'
    }, {
      title: 'Employers',
      subtitle: 'Information sessions'
    }, {
      title: 'Holidays',
      subtitle: 'Upcoming holidays'
    }, {
      title: 'Parking',
      subtitle: 'Lot availability'
    }]
  }]
});

menu.on('select', function(e) {
  var loadingWindow = new UI.Window();
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: 'Loading ' + e.item.title,
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });

  loadingWindow.add(text);
  loadingWindow.show();

  var errorHandler = function(err) {
    if (err) {
      console.log(err);
      loadingWindow.hide();
      var errorCard = new UI.Card({
        title: "Error",
        subtitle: "Service unavailable",
        body: "Please try again later"
      });
      console.log("Error occured: " + err.message);
      errorCard.show();
    }
  };

  var options;
  if (e.itemIndex === 0) {
    options = {
      url: config.baseUri + "/weather/current.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options,
      function(response) {
        loadingWindow.hide();
        var data = response.data;
        var weatherCard = new UI.Card({
          title: "Weather",
          subtitle: (new Date(data.observation_time)).toDateString(),
          body: "Temp: " + data.temperature_current_c + " °C\n" + "Windchill: " + data.windchill_c + " °C\n" + "High: " + data.temperature_24hr_max_c + " °C\n" + "Low: " + data.temperature_24hr_min_c + " °C\n" + "Precipation: " + data.precipitation_24hr_mm + " mm",
          scrollable: true
        });
        weatherCard.show();
      },
      errorHandler);
  } else if (e.itemIndex === 1) {
    options = {
      url: config.baseUri + "/foodservices/locations.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options,
      function(response) {
        loadingWindow.hide();
        var data = response.data;
        var foodLocationItems = [];
        var foodServicesObject = {};
        var i;

        for (i = 0; i < data.length; i++) {
          foodServicesObject = {
            title: data[i].outlet_name,
            subtitle: data[i].is_open_now ? "Open" : "Closed",
            body: "Building: " + data[i].building
          };

          if (data[i].description) {
            foodServicesObject.body += "\nDescription: " + data[i].description;
          }

          if (data[i].notice) {
            foodServicesObject.body += "\nNotice: " + data[i].notice;
          }

          data[i].body += "\nHours of operation: ";

          if (data[i].opening_hours.sunday.is_closed === true) {
            foodServicesObject.body += "\nSunday: Closed";
          } else {
            foodServicesObject.body += "\nSunday: " + data[i].opening_hours.sunday.opening_hour + " to " + data[i].opening_hours.sunday.closing_hour;
          }

          if (data[i].opening_hours.monday.is_closed === true) {
            foodServicesObject.body += "\nMonday: Closed";
          } else {
            foodServicesObject.body += "\nMonday: " + data[i].opening_hours.monday.opening_hour + " to " + data[i].opening_hours.monday.closing_hour;
          }

          if (data[i].opening_hours.tuesday.is_closed === true) {
            foodServicesObject.body += "\nTuesday: Closed";
          } else {
            foodServicesObject.body += "\nTuesday: " + data[i].opening_hours.tuesday.opening_hour + " to " + data[i].opening_hours.tuesday.closing_hour;
          }

          if (data[i].opening_hours.wednesday.is_closed === true) {
            foodServicesObject.body += "\nWednesday: Closed";
          } else {
            foodServicesObject.body += "\nWednesday: " + data[i].opening_hours.wednesday.opening_hour + " to " + data[i].opening_hours.wednesday.closing_hour;
          }

          if (data[i].opening_hours.thursday.is_closed === true) {
            foodServicesObject.body += "\nThursday: Closed";
          } else {
            foodServicesObject.body += "\nThursday: " + data[i].opening_hours.thursday.opening_hour + " to " + data[i].opening_hours.thursday.closing_hour;
          }

          if (data[i].opening_hours.friday.is_closed === true) {
            foodServicesObject.body += "\nFriday: Closed";
          } else {
            foodServicesObject.body += "\nFriday: " + data[i].opening_hours.friday.opening_hour + " to " + data[i].opening_hours.friday.closing_hour;
          }

          if (data[i].opening_hours.saturday.is_closed === true) {
            foodServicesObject.body += "\nSaturday: Closed";
          } else {
            foodServicesObject.body += "\nSaturday: " + data[i].opening_hours.saturday.opening_hour + " to " + data[i].opening_hours.saturday.closing_hour;
          }

          foodLocationItems.push(foodServicesObject);
        }

        var foodLocationMenu = new UI.Menu({
          sections: [{
            title: "Locations",
            items: foodLocationItems
          }]
        });

        foodLocationMenu.on('select', function(e) {
          var foodLcoationCard = new UI.Card({
            title: e.item.title,
            subtitle: e.item.subtitle,
            body: e.item.body,
            scrollable: true
          });
          foodLcoationCard.show();
        });
        foodLocationMenu.show();
      },
      errorHandler);
  } else if (e.itemIndex === 2) {
    options = {
      url: config.baseUri + "/foodservices/menu.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options,
      function(response) {
        loadingWindow.hide();
        var data = response.data.outlets;
        var foodMenuItems = [];
        var i;

        for (i = 0; i < data.length && i < 25; i++) {
          foodMenuItems.push({
            title: data[i].outlet_name,
            body: data[i].menu,
          });
        }

        var foodMenu = new UI.Menu({
          sections: [{
            title: "Menu",
            items: foodMenuItems
          }]
        });

        foodMenu.on('select', function(e) {
          var foodOutletItems = [];
          for (i = 0; i < e.item.body.length; i++) {
            foodOutletItems.push({
              title: e.item.body[i].day,
              body: e.item.body[i]
            });
          }
          var foodOutletMenu = new UI.Menu({
            sections: [{
              title: e.item.title,
              items: foodOutletItems
            }]
          });

          foodOutletMenu.on('select', function(e) {
            var foodOutletInfo = {
              subtitle: e.item.title,
              body: "",
              scrollable: true
            };

            if (e.item.body.meals.lunch.length > 0) {
              foodOutletInfo.body += "\nLunch";
            }
            for (i = 0; i < e.item.body.meals.lunch.length; i++) {
              foodOutletInfo.body += "\n" + e.item.body.meals.lunch[i].product_name;
              if (e.item.body.meals.lunch[i].diet_type) {
                foodOutletInfo.body += " (" + e.item.body.meals.lunch[i].diet_type + ")";
              }
            }

            if (e.item.body.meals.dinner.length > 0) {
              foodOutletInfo.body += "\n\nDinner";
            }
            for (i = 0; i < e.item.body.meals.dinner.length; i++) {
              foodOutletInfo.body += "\n" + e.item.body.meals.dinner[i].product_name;
              if (e.item.body.meals.dinner[i].diet_type) {
                if (e.item.body.meals.dinner[i].diet_type) {
                  foodOutletInfo.body += " (" + e.item.body.meals.dinner[i].diet_type + ")";
                }
              }
            }

            if (e.item.body.notes) {
              foodOutletInfo.body += "\n\nNotes: " + e.item.body.notes;
            }

            var foodOutletCard = new UI.Card(foodOutletInfo);
            foodOutletCard.show();
          });

          foodOutletMenu.show();
        });
        foodMenu.show();
      },
      errorHandler);
  } else if (e.itemIndex === 3) {
    options = {
      url: config.baseUri + "/resources/infosessions.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options,
      function(response) {
        loadingWindow.hide();
        var data = response.data;
        var i;
        var today = new Date();
        data = data.filter(function(item) {
          var date = new Date(item.date + " " + item.end_time);
          return date >= today;
        });

        var infoSessionSections = [];
        var infoSessionItems = [];
        for (i = 0; i < data.length; i++) {
          if (i !== 0 && data[i].date !== data[i - 1].date) {
            infoSessionSections.push({
              title: data[i - 1].date,
              items: infoSessionItems
            });

            infoSessionItems = [];
          }

          infoSessionItems.push({
            title: data[i].employer,
            subtitle: data[i].start_time + " to " + data[i].end_time,
            body: data[i].date + "\n" + data[i].start_time + " to " + data[i].end_time + "\n" + data[i].location + "\n\n" + data[i].programs
          });
        }

        var infoSessionMenu = new UI.Menu({
          sections: infoSessionSections
        });

        infoSessionMenu.on('select', function(e) {
          var infoSessionCard = new UI.Card({
            title: e.item.title,
            body: e.item.body,
            scrollable: true
          });
          infoSessionCard.show();
        });
        infoSessionMenu.show();
      },
      errorHandler);
  } else if (e.itemIndex === 4) {
    options = {
      url: config.baseUri + "/events/holidays.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options,
      function(response) {
        loadingWindow.hide();
        var data = response.data;
        var holidayItems = [];
        var currentDate = new Date();
        var holidayDate;
        var i;
        for (i = 0; i < data.length; i++) {
          holidayDate = new Date(data[i].date);
          holidayDate.setDate(holidayDate.getDate() + 1);
          if (holidayDate >= currentDate) {
            holidayItems.push({
              title: data[i].name,
              subtitle: holidayDate.toDateString()
            });
          }
        }

        var holidayMenu = new UI.Menu({
          sections: [{
            title: "Holidays",
            items: holidayItems
          }]
        });

        holidayMenu.show();
      },
      errorHandler);
  } else if (e.itemIndex === 5) {
    options = {
      url: config.baseUri + "/parking/watpark.json?key=" + config.apiKey,
      type: "json"
    };
    AJAX(options, function(response) {
      loadingWindow.hide();
      var data = response.data;
      var parkingItems = [];

      for (var i = 0; i < data.length; i++) {
        parkingItems.push({
          title: "Lot " + data[i].lot_name + " - " + data[i].percent_filled + "% full",
          subtitle: data[i].current_count + "/" + data[i].capacity
        });
      }

      var parkingMenu = new UI.Menu({
        sections: [{
          title: "Parking Lots",
          items: parkingItems
        }]
      });

      parkingMenu.show();

    }, errorHandler);
  }
});

menu.show();