var map;
var scaleW = document.documentElement.clientWidth;
var scaleH = document.documentElement.clientHeight;
var cities;
var flights;
var timezones;

var xhr_list = {};

function init() {
	var extent = new OpenLayers.Bounds(-180, -90, 180, 90);

    map = new OpenLayers.Map({
      div: "map",
	  layers: [new OpenLayers.Layer.OSM("MapQuest", "http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg", {
		resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891],
		serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891], transitionEffect: 'resize' }), 
			   new OpenLayers.Layer.OSM("OpenStreetMaps", null, {
		resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891],
		serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891], transitionEffect: 'resize' }) 
			  ],
	  controls: [
		new OpenLayers.Control.Navigation({
          dragPanOptions: {
              enableKinetic: true
          }
        }),
		new OpenLayers.Control.TouchNavigation({
          dragPanOptions: {
              enableKinetic: true
          }
        }),
        new OpenLayers.Control.PanZoomBar(), 
		new OpenLayers.Control.ScaleLine(), 
		new OpenLayers.Control.LayerSwitcher() 
	  ],
	  center: [0, 0],
	  zoom: 3
    });

    //map.zoomToMaxExtent();

	/*var lonlat = new OpenLayers.LonLat(-1.788, 53.571).transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator
          );
	
	var location = new OpenLayers.Geometry.Point(-1.788, 53.571).transform("EPSG:4326", "EPSG:900913");*/

    cities = new OpenLayers.Layer.Vector( "Cities", {
		styleMap: new OpenLayers.StyleMap({
		  //externalGraphic: '/img/marker.png',
		  //graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
		  label: "\uf072",
		  fontFamily: "FontAwesome",
		  fontSize: 24,
		  fontColor: "red",
		  strokeColor: "blue",
		  pointRadius: 10,
		  fillOpacity: 0,
		  strokeOpacity: 0,
		  cursor: "pointer",
		  title: '${tooltip}'})});
    //cities.addFeatures([new OpenLayers.Feature.Vector(location, {tooltip: 'marker'})]);
	flights = new OpenLayers.Layer.Vector("Flights");
        var randomColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]));
        var selectColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["select"]));

        try{
            flights.styleMap = new OpenLayers.StyleMap({'default':{fillOpacity: 0.5, fillColor: "blue", strokeWidth: 3, strokeColor: "blue", pointRadius: 3}, 'select':{fillOpacity: 0.5, fillColor: 'yellow', strokeWidth: 2, strokeColor: 'yellow', pointRadius: 5}});
        }catch(err){console.log(err)};

    flights.setVisibility(true);
	timezones = new OpenLayers.Layer.Vector("Time Zones", {
	    strategies: [new OpenLayers.Strategy.Fixed()], 
		protocol: new OpenLayers.Protocol.HTTP({
		  url: "kml/ne_10m_time_zones.kml",
		  format: new OpenLayers.Format.KML({
		    extractStyles: true,
			extractAttributes: true,
			maxDepth: 2
		  })
		})
	  });
	
	map.addLayer(timezones);
    map.addLayer(flights);
	map.addLayer(cities);
	
	var selectControl = new OpenLayers.Control.SelectFeature(
		  [cities, flights]/*, 
		  {
		    hover: true, 
			eventListeners: {
			  beforefeaturehighlighted: function(evt){var popup = new OpenLayers.Popup(null, evt.feature.geometry.bounds.getCenterLonLat(), new OpenLayers.Size(200, 200), evt.feature.data.name, false); map.addPopup(popup, true); popup.updateSize();},
			  featurehighlighted: function(evt){},
			  featureunhighlighted: function(evt){}
			}
		  }*/);
		  
	map.addControl(selectControl);
	selectControl.activate();
	
	cities.events.on({featureselected: showCityPopup});
	flights.events.on({featureselected: showFlightPopup});
	
	$("#airline").keyup(function (evt) {
	  if(evt.which < 32 && evt.which != 8) 
	    return false;
	  $("#airline_dropdown").addClass("open");
      $('#loading').addClass('in');
	  if(xhr_list['airline_list'] && xhr_list['airline_list'].readyState != 4)
	    xhr_list['airline_list'].abort();
	  xhr_list['airline_list'] = $.ajax({url: '/map/list', 
	    type: "POST",
		dataType: "json",
		data: { input: $("#airline").val(), 
		  field: "airline"
		}
	  }).done(function(data, status, xhr) {
	    updateAirlineDropdown(data, status, xhr);
        $('#loading').removeClass('in');
	  }).fail(function(data, status, xhr) {
	    console.log("Error Encountered When Retrieving Airline List");
	  });
	});

	$("#city").keyup(function (evt) {
	  if(evt.which < 32 && evt.which != 8) 
	    return false;
	  $("#city_dropdown").addClass("open");
      $('#loading').addClass('in');
	  if(xhr_list['city_list'] && xhr_list['city_list'].readyState != 4)
	    xhr_list['city_list'].abort();
	  xhr_list['city_list'] = $.ajax({url: '/map/list', 
	    type: "POST",
		dataType: "json",
		data: { input: $("#city").val(), 
		  field: "city"
		}
	  }).done(function(data, status, xhr) {
	    updateCityDropdown(data, status, xhr);
        $('#loading').removeClass('in');
	  }).fail(function(data, status, xhr) {
	    console.log("Error Encountered When Retrieving Airport List");
	  });
	});
	
	$("#airline").click(function(evt) {
		$("#airline_dropdown").addClass("open");
		evt.stopPropagation();
	});
	
	$("#city").click(function(evt) {
		$("#city_dropdown").addClass("open");
		evt.stopPropagation();
	});
	
}

function retrieveMap() {
  $('#loading').addClass('in');
  if(xhr_list['route_map'] && xhr_list['route_map'].readyState != 4)
    xhr_list['route_map'].abort();
  xhr_list['route_map'] = $.ajax({url: '/map/populate_map', 
    type: "POST",
	dataType: "json",
	data: { airline: $("#airline").val(), 
	  city: $("#city").val()
	}
  }).done(function(data, status, xhr) {
	updateMap(data, status, xhr);
    $('#loading').removeClass('in');
  }).fail(function(data, status, xhr) {
	console.log('Error Encountered When Retrieving Data');
  });
}

function updateMap(data, status, xhr) {
  cities.removeAllFeatures();
  flights.removeAllFeatures();
  var features = [];
  var city_long_lats = {};
  $.each(data.airports, function(index, value) {
    var longitude = parseFloat(value.longitude);
	var latitude = parseFloat(value.latitude);
	features.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(longitude, latitude).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), {tooltip: value.name + ' (' + value.iata_faa + ')', city: value.city, country: value.country, iata: value.iata_faa, name: value.name, timezone: value.timezone, idairports: value.idairports}));
	city_long_lats[value.iata_faa] = {point: new OpenLayers.Geometry.Point(longitude, latitude), "longitude": longitude, "latitude": latitude};
	console.log(longitude + " " + latitude);
  });
  cities.addFeatures(features);
  $.each(data.flights, function(index, value) {
    var source = city_long_lats[value.source];
	var destination = city_long_lats[value.destination];
	if(source != null && destination != null)	
	  show_orthodrome(source.point, destination.point, flights);
	else
	  console.log("Route from " + value.source + " to " + value.destination + " is invalid");
  });
  console.log(data);
}

function updateAirlineDropdown(data, status, xhr) {
  console.log(data);
  $("#airline_options").empty();
  if($('#airline').val() == "")
    $("#airline_options").append("<li><a href=\"\" onclick=\"$('#airline').val(this.innerHTML); return false;\">All (Default)</a></li>");
  $.each(data.results, function(index, value) {
    $("#airline_options").append("<li><a href=\"\" onclick=\"$('#airline').val(this.innerHTML); return false;\">" + value.name + " (" + value.iata + ")" + "</a></li>");
  });
  if(data.results.length == 0) {
    $("#airline_options").append("<li><a href=\"\" onclick=\"return false;\"><i>None Listed</i></a></li>");
  };  
}

function updateCityDropdown(data, status, xhr) {
  console.log(data);
  $("#city_options").empty();
  $.each(data.results, function(index, value) {
    $("#city_options").append("<li><a href=\"\" onclick=\"$('#city').val(this.innerHTML); return false;\">" + value.name + " (" + value.iata_faa + ")" + "</a></li>");
  });
  if(data.results.length == 0) {
    $("#city_options").append("<li><a href=\"\" onclick=\"return false;\"><i>None Listed</i></a></li>");
  };  
}

function showCityPopup(evt) {
  var feature = evt.feature;
  console.log(feature);
  $.ajax({url: '/map/popup', 
    type: "POST",
	dataType: "json",
	data: { airline: $("#airline").val(), 
	  city: $("#city").val(), 
	  "feature": feature.data,
	  type: "city"
	}
  }).done(function(data, status, xhr) {
    console.log(data);
	var contents = "<h4>" + data.feature.name + " (" + data.feature.iata + ")</h4>" + data.feature.city + ", " + data.feature.country + " (Timezone: " + data.feature.timezone + ")<br/><table class=\"table table-striped table-bordered table-condensed table-responsive\"><tr>" + (data.airline > '' ? "" : "<th>Airlines</th>") + "<th>To</th><th>From</th></tr>";
    $.each(data.results, function(index, value) {
	  contents = contents + "<tr>" + (data.airline > '' ? "" : "<td>" + value.airline + "</td>") + "<td>" + (data.feature.idairports == (value.source_id + "") ? "" : value.source) + "</td><td>" + (data.feature.idairports == (value.destination_id + "") ? "" : value.destination) + "</td></tr>";
	});
	contents = contents + "</table>";
	var popup = new OpenLayers.Popup.Anchored("cityPopup", feature.geometry.getBounds().getCenterLonLat(), null, contents, null, true);
	popup.autoSize = true;
	popup.maxSize = new OpenLayers.Size(400, 400);
    map.addPopup(popup);
    $('#loading').removeClass('in');
  }).fail(function(data, status, xhr) {
	console.log('Error Encountered When Retrieving Data');
  });
}

function showFlightPopup(evt) {
  var feature = evt.feature;
  console.log(feature);
}

var earth_radius = 6371.11;           // in km

var orthodromeFlag = false;

function GreatCircleLine(pOrigin, pDest)
{
    var gc = new geo.GreatCircle(pOrigin, pDest);
    var x0 = pOrigin.x;
    var x1 = pDest.x;

    var ls = [];
    if (orthodromeFlag==true)
    	ls[ls.length] = gc.toLineString(-180, 180);

  	if (x0 < x1 && (x1-x0)< 180) //modifiziert
  		ls[ls.length] = gc.toLineString(x0, x1);
  	else
  	{   //### part modifiziert #################
  		if (Math.abs(x0-x1) < 180)
  			ls[ls.length] = gc.toLineString(x1, x0);
  		else if(x0>x1){
  			ls[ls.length] = gc.toLineString(x0, 180);
  			ls[ls.length] = gc.toLineString(-180, x1);
        }
  		else{
  			ls[ls.length] = gc.toLineString(x1, 180);
  			ls[ls.length] = gc.toLineString(-180, x0);
        }
        //######################################
	}
    return(ls);
}

function show_orthodrome(pt1, pt2, flights)
{
    var pOrigin = new geo.Point(pt1.x, pt1.y);
    var pDest = new geo.Point(pt2.x, pt2.y);

    var ls = GreatCircleLine(pOrigin, pDest);

    var vectors = flights; 

    var theStyle = [];
    if (orthodromeFlag==true)
        theStyle[theStyle.length] = null;

    theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:2};
    theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:2};

    // Create a feature from the waypoints LineString and display on map
    var route = [];
    for (var i=0; i<ls.length; i++)
     	route[i] = new OpenLayers.Feature.Vector (ls[i], null, theStyle[i]);
    vectors.addFeatures(route);
}
