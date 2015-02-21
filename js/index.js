(function(){
	//--constantes----------------------------------------------------------------------
	var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5";
	var API_WORLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key="+ API_WORLDTIME_KEY +"&q=";
	var API_WEATHER_KEY = "b2f3a4b7dd23c39f18727eec36a54f4b";
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
	var WEATHER_ICON = "http://openweathermap.org/img/w/";

	//--Variables----------------------------------------------------------------------
	var today = new Date();
	//var timeNow = today.getHours() + ":"+ today.getMinutes();
	var timeNow = today.toLocaleTimeString();
	var day;
	var d = today.getDay();
	var m = today.getMonth();
	var month;
	var date; 
	var time;
	var cities = []; 
	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	//--Cacheado de elementos---------------------------------------------------------
	var $main = $("main");
	//var $body = $("body");
	var $loader = $(".loader");
	var newCity = $("[data-input='cityAdd']");
	var buttonAdd = $("[data-button='add']");
	var buttonView = $("[data-saved-cities]");
	


	day = daysofweek(d);
	month = months(m);
	date = day + "  " +today.getDate()+ "  "+ month + "  " + today.getFullYear();

	$( buttonAdd ).on("click", addNewCity);
	$( newCity ).on("keypress", function(event){
		//console.log(event.wich) //Muestra la tecla que he tecleado
		if(event.which == 13) //Si la tecla es enter
			addNewCity(event);
	})
	$( buttonView ).on("click", showSavedCities);

	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(getCoords, errorFound);
	} else {
		alert("Tu navegador debe ser actualizado");
	}

	function errorFound(error){
		alert("Ocurrió un error: " + error.code);
		//0: Error desconocido
		//1: Permiso denegado
		//2: Posicion no está disponible
		//3: Timeout 
		}

	function getCoords(position){
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		console.log("Tu posicion es: " + lat + "," + lon);
		$.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
	};

	function getCurrentWeather(data){
		//console.log(data);
		cityWeather.zone = data.name;
		cityWeather.icon = WEATHER_ICON + data.weather[0].icon + ".png";
		cityWeather.temp = data.main.temp - 273.15; //Para devolver la temp en ºC le resto 273.15
		cityWeather.temp_max = data.main.temp_max - 273.15;
		cityWeather.temp_min = data.main.temp_min - 273.15;
		cityWeather.main = data.weather[0].main;

		//render
		renderTemplate(cityWeather);
	};
	//Funcion que activa el template
	function activeTemplate(id){
		var t = document.querySelector(id);
		return document.importNode(t.content, true);
	};

	function renderTemplate(cityWeather, localtime){
		var clone = activeTemplate("#template--city");
		var timeToShow;
		var dateToShow;
		if (localtime){ //si localtime es true
			timeToShow = localtime.split(" ")[1];//Convierte la fecha en array
			dateToShow = localtime.split(" ")[0];
		} else{
			timeToShow = timeNow;
			dateToShow = date;
		}
		//Pinta los datos
		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-date]").innerHTML = dateToShow;
		clone.querySelector("[data-ciudad]").innerHTML = cityWeather.zone;
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(2);
		clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(2);
		clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(2);
		$( $loader ).hide();
		$( $main ).append(clone); //Funcion que pega el contenido al html

	}

	function daysofweek(n){
		var d;
		if (n == 0){
			d = "Sun";
		} else if (n == 1){
			d = "Mon";
		} else if (n == 2){
			d = "Tues";
		} else if (n == 3){
			d = "Wed";
		} else if (n == 4){
			d = "Thur";
		} else if (n == 5){
			d = "Fri";
		} else if (n == 6){
			d = "Sat";
		} 
		return d;
	}
	function months(n){
		var m;
		if (n == 0){
			m = "Jan";
		} else if (n == 1){
			m = "Feb";
		} else if (n == 2){
			m = "Mar";
		} else if (n == 3){
			m = "Apr";
		} else if (n == 4){
			m = "May";
		} else if (n == 5){
			m = "Jun";
		} else if (n == 6){
			m = "Jul";
		} else if (n == 7){
			m = "Aug";
		} else if (n == 8){
			m = "Sep";
		} else if (n == 9){
			m = "Oct";
		} else if (n == 10){
			m = "Nov";
		} else if (n == 11){
			m = "Dec";
		} 
		return m;
	};

	function addNewCity(event){
		event.preventDefault(); //Le quita la funcionalidad de tipo submit
		$.getJSON(API_WEATHER_URL + "q=" + $( newCity ).val(), getWeatherNewCity);
	};

	function getWeatherNewCity(data){
			
			$.getJSON(API_WORLDTIME + $( newCity ).val(), function(data2){
			//var t= getTimeNewCity($( newCity ).val());
			//console.log (t);
			$( newCity ).val(" ");
			cityWeather = {};
			cityWeather.zone = data.name;
			cityWeather.icon = WEATHER_ICON + data.weather[0].icon + ".png";
			cityWeather.temp = data.main.temp - 273.15; //Para devolver la temp en ºC le resto 273.15
			cityWeather.temp_max = data.main.temp_max - 273.15;
			cityWeather.temp_min = data.main.temp_min - 273.15;
			cityWeather.main = data.weather[0].main;
			//console.log(data2);
			//render
			var time = data2.data.time_zone[0].localtime;
			renderTemplate(cityWeather, time);
			
			cities.push(cityWeather); //push Permite guardar elementos en un arreglo 
			//Convertimos el objeto en string.
			var obj = JSON.stringify(cities);
			//Almacenamos el elemento en localStorage 
			localStorage.setItem("cities", obj); //Clave: cities
			});
		
	};

	/*function getTimeNewCity(nameCity){

		$.getJSON(API_WORLDTIME + nameCity, function(data2){
		time = data2.data.time_zone[0].localtime;
		});
		return time;
		console.log(time);
	}*/

	function showSavedCities(event){
		event.preventDefault();
		function renderCities(cities){
			cities.forEach(function(city){
				console.log(cities);
				console.log(city.zone);
				var name = city.zone;
				//var t = getTimeNewCity(name);
				console.log(t);
				renderTemplate(city);
			});	
		};
		var cities = JSON.parse(localStorage.getItem("cities")); //Parse convierte el string en array
		renderCities(cities);


	function removeItems() {
      var citiesToDelete = $(".card");
      if(citiesToDelete.length > 1) {
        for(var i=1; i<citiesToDelete.length; i++) {
          citiesToDelete[i].remove();
        }
      }
    };

    removeItems();
    var cities = JSON.parse( localStorage.getItem('cities') );
    renderCities(cities);

    // Detecta eventos de click en cada ciudad
    $(".card").on("click", function(e) {
      var i = $(".card").index(this);
      var result = window.confirm("Do you want to delete the selected city?");

      // Elimina la ciudad de localStorage
      if(result) {
        var cards = $(".card");
        cards[i].remove();
      }
      cities.splice(i, 1);
      console.log(cities);
      localStorage.setItem('cities', JSON.stringify(cities) );
    });



	}





})();

/*
function loadCities(event){
   event.preventDefault();

   var cities = JSON.parse(localStorage.getItem("cities"));
    cities.forEach(function (city){
     renderTemplate(city);
    });

  }*/

  /*
  var citiesSaved= JSON.parse(localStorage.getItem("cities"));
  if(citiesSaved){
   citiesSaved.forEach(function(city){
    renderTemplate(city);
   });
  }

  */



 