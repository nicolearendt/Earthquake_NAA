var USACoords = [39.8283,-98.5795];
var mapZoomLevel = 5;

// Create the createMap function
function createMap(earthq){

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the earthq layer
  var overlayMaps = {
    "Earthquakes": earthq
  };

  // Create the map object with options
  var myMap = L.map("map-id", {
    center: USACoords,
    zoom: mapZoomLevel,
    layers:[lightmap,earthq]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);  

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5, 100],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);

};

function getRadius(mag){
  if(mag > 5){
    return 25;
  }
  else if(mag > 4){
    return 20;
  }
  else if(mag > 3){
    return 15
  }
  else if(mag > 2){
    return 10;
  }
  else if(mag > 1){
    return 7;
  }
  else{
    return 3;
  };
};

function getColor(d) {
  return d > 5 ? 'darkred' :
         d > 4  ? 'red' :
         d > 3  ? 'orange' :
         d > 2  ? 'yellow' :
         d > 1   ? 'yellowgreen' :
                    'green';
};

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng){
      var geojsonMarkerOptions = {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      };
      return L.circleMarker(latlng,geojsonMarkerOptions)
        .bindPopup("<h3>" + feature.properties.title +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Perform an API call to the Earthquake data. Call createFeatures when complete

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url, function(response){
  console.log(response.features);
  createFeatures(response.features);
});
