var map;
var scaleW = document.documentElement.clientWidth;
var scaleH = document.documentElement.clientHeight;
var cities;
var flights;
var timezones;
var selectControl;
var timeZonePopup;

var xhr_list = {};
var city_long_lats = {};

function init() {
	var extent = new OpenLayers.Bounds(-180, -90, 180, 90);
	var resolutions = [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891];
	var serverResolutions = [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891];

    map = new OpenLayers.Map({
      div: "map",
	  layers: [
	  new OpenLayers.Layer.OSM("Map Quest", "/tiles/${z}/${x}/${y}.png", {
		'resolutions': resolutions,
		'serverResolutions': serverResolutions, 
		transitionEffect: 'resize' }), 
	  new OpenLayers.Layer.Google("Google", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 9}),
	  new OpenLayers.Layer.OSM("OpenStreetMaps", null, {
		'resolutions': resolutions,
		'serverResolutions': serverResolutions, 
		transitionEffect: 'resize' }) 
			  ],
	  controls: [
        new OpenLayers.Control.PanZoomBar(), 
		new OpenLayers.Control.ScaleLine(), 
		new OpenLayers.Control.LayerSwitcher() 
	  ],
	  restrictedExtent: [-20037508.34 * 2, -20037508.34, 20037508.34 * 2, 20037508.34],
	  center: [0, 0],
	  zoom: 3
    });

    cities = new OpenLayers.Layer.Vector( "Cities", {
		styleMap: new OpenLayers.StyleMap({'default': new OpenLayers.Style({
		  //externalGraphic: '/img/marker.png',
		  //graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
		  label: "\uf072",
		  fontFamily: "FontAwesome",
		  fontSize: "${airport_size}",
		  fontColor: "#535454",
		  strokeColor: "blue",
		  pointRadius: "${radius_size}",
		  fillOpacity: 0,
		  strokeOpacity: 0,
		  cursor: "pointer",
		  title: '${tooltip}'}), 
		  'select': new OpenLayers.Style({
		  //externalGraphic: '/img/marker.png',
		  //graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
		  label: "\uf072",
		  fontFamily: "FontAwesome",
		  fontSize: "${airport_size}",
		  fontColor: "#989899",
		  strokeColor: "blue",
		  pointRadius: "${radius_size}",
		  fillOpacity: 0,
		  strokeOpacity: 0,
		  cursor: "pointer",
		  title: '${tooltip}'})})});

	flights = new OpenLayers.Layer.Vector("Flights");
        var randomColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]));
        var selectColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["select"]));

        try{
            flights.styleMap = new OpenLayers.StyleMap({
				'default':new OpenLayers.Style({
					fillOpacity: 0.5, 
					fillColor: "lavender", 
					//strokeColor: "limegreen", 
					pointRadius: 3, 
					cursor: "pointer"
				}, 
				{rules: [
					new OpenLayers.Rule({
						filter: new OpenLayers.Filter.Comparison({
							type: OpenLayers.Filter.Comparison.EQUAL_TO,
							property: "codeshare",
							value: "Y"}),
						symbolizer: {
							strokeDashstyle: 'dot',
							strokeWidth: 1.5, 
							strokeColor: "#0D6A71"}
					}),
					new OpenLayers.Rule({
						elseFilter: true,
						symbolizer: {
							strokeWidth: 2, 
							strokeColor: "#06A2AB"}
					})
				]}
				), 
				'select':new OpenLayers.Style({
					fillOpacity: 0.5, 
					fillColor: 'yellow', 
					strokeWidth: 3, 
					strokeColor: '#FFFFFF', 
					pointRadius: 3, 
					cursor: "pointer"
				})
			});
        }catch(err){console.log(err)};

    flights.setVisibility(true);
	timezones = new OpenLayers.Layer.Vector("Time Zones", {
		styleMap: new OpenLayers.StyleMap({'default': new OpenLayers.Style({
		  fontColor: "dimgray",
		  strokeColor: "#DFB31B",
		  strokeWidth: 1,
		  fillOpacity: 0,
		  strokeOpacity: 0.2}), 
		  'select': new OpenLayers.Style({
		  fontColor: "red",
		  strokeColor: "blue",
		  fillColor: "blue",
		  pointRadius: 2,
		  fillOpacity: 0.3,
		  strokeOpacity: 0.5})}),
	    strategies: [new OpenLayers.Strategy.Fixed()], 
		protocol: new OpenLayers.Protocol.HTTP({
		  url: "kml/ne_10m_time_zones.kml",
		  //url: "kml/timezones.kml",
		  format: new OpenLayers.Format.KML({
		    extractStyles: false,
			extractAttributes: true,
			maxDepth: 4
		  })
		})
	  });
	
	map.addLayer(timezones);
    map.addLayer(flights);
	map.addLayer(cities);
	
	hoverControl = new OpenLayers.Control.SelectFeature(
	      [timezones],
		  {
		    hover: true,
			highlightOnly: true,
			renderIntent: "temporary",
			eventListeners: {
			  featurehighlighted: function(evt){var mapExtent = map.getExtent(); timeZonePopup.lonlat = new OpenLayers.LonLat(evt.feature.geometry.bounds.getCenterLonLat().lon, (mapExtent.getCenterLonLat().lat > 0 ? mapExtent.top - (mapExtent.getHeight() * 0.1) : mapExtent.bottom + (mapExtent.getHeight() * 0.1)));timeZonePopup.updatePosition(); timeZonePopup.setContentHTML(evt.feature.data.description.replace(/<td>time_zone:<\/td>/,'').replace(/<tr><td>places:<\/td><td>.+?<\/td><\/tr>/,"")); timeZonePopup.show();}
			}
		  }
	);
	
	timeZonePopup = new OpenLayers.Popup(null, new OpenLayers.LonLat(0,0), new OpenLayers.Size(100, 40), '', false); 
	map.addPopup(timeZonePopup); 
	timeZonePopup.hide();
		  
	selectControl = new OpenLayers.Control.SelectFeature(
		  [cities, flights, timezones], 
		  {});
	
	map.addControl(hoverControl);
	map.addControl(selectControl);
	
	hoverControl.activate();
	selectControl.activate();
	
	map.addControls([new OpenLayers.Control.Navigation({
          dragPanOptions: {
              enableKinetic: true
          }
        }),
		new OpenLayers.Control.TouchNavigation({
          dragPanOptions: {
              enableKinetic: true
          }
        })]);
	
	cities.events.on({featureselected: showCityPopup});
	flights.events.on({featureselected: showFlightPopup});
	timezones.events.on({featureselected: function(evt) {selectControl.unselect(evt.feature);hoverControl.highlight(evt.feature);}});
	
	$("#airline").keyup(function (evt) {
	  if(evt.which < 32 && evt.which != 8) 
	    return false;
	  $("#idairlines").val('');
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
        $('#loading').removeClass('in');
	    console.log("Error Encountered When Retrieving Airline List");
	  });
	});

	$("#city").keyup(function (evt) {
	  if(evt.which < 32 && evt.which != 8) 
	    return false;
	  $("#idairports").val('');
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
        $('#loading').removeClass('in');
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
	
	if(document.documentElement.className.indexOf("no-cssanimations") !== -1 || document.documentElement.className.indexOf("no-csstransforms") !== -1 || document.documentElement.className.indexOf("no-csstransitions") !== -1)
	  $("#browser-support").html("<i class=\"icon-warning-sign\" style=\"color:orange;\" title=\"this browser does not support one or more required features\"></i>");
	else
	  $("#browser-support").html("<i class=\"icon-ok\" style=\"color:green;\"></i>");
}

function retrieveMap() {
  $('#loading').addClass('in');
  if(xhr_list['route_map'] && xhr_list['route_map'].readyState != 4)
    xhr_list['route_map'].abort();
  xhr_list['route_map'] = $.ajax({url: '/map/populate_map', 
    type: "POST",
	dataType: "json",
	data: { airline: $("#airline").val(), 
	  city: $("#city").val(),
	  idairlines: $("#idairlines").val(),
	  idairports: $("#idairports").val()
	}
  }).done(function(data, status, xhr) {
	updateMap(data, status, xhr);
    $('#loading').removeClass('in');
  }).fail(function(data, status, xhr) {
    $('#loading').removeClass('in');
	console.log('Error Encountered When Retrieving Data');
  });
}

function updateMap(data, status, xhr) {
  while( map.popups.length )
    map.removePopup(map.popups[0]);
  map.addPopup(timeZonePopup);
  cities.removeAllFeatures();
  flights.removeAllFeatures();
  var features = [];
  $.each(data.airports, function(index, value) {
    var longitude = parseFloat(value.longitude);
	var latitude = parseFloat(value.latitude);
	var pointSize = Math.ceil(Math.log(value.airport_size) + 5);
	features.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(longitude, latitude).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), {tooltip: value.name + ' (' + value.iata_faa + ')', city: value.city, country: value.country, iata: value.iata_faa, name: value.name, timezone: value.timezone, idairports: value.idairports, airport_size: pointSize * 1.5, radius_size: pointSize}));
	city_long_lats[value.iata_faa] = {point: new OpenLayers.Geometry.Point(longitude, latitude), "longitude": longitude, "latitude": latitude};
  });
  cities.addFeatures(features);
  $.each(data.flights, function(index, value) {
    var source = city_long_lats[value.source];
	var destination = city_long_lats[value.destination];
	if(source != null && destination != null)	
	  show_orthodrome(source.point, destination.point, flights, {'source': value.source, 'source_lat': source.latitude, 'destination': value.destination, 'destination_lat': destination.latitude, 'id': value.idroutes, 'codeshare': value.codeshare});
	else
	  console.log("Route from " + value.source + " to " + value.destination + " is invalid");
  });
}

function updateAirlineDropdown(data, status, xhr) {
  $("#airline_options").empty();
  if($('#airline').val() == "")
    $("#airline_options").append("<li><a href=\"\" onclick=\"$('#airline').val(this.innerHTML); $('#idairlines').val(''); return false;\"><i>All (Default)</i></a></li>");
  else
  if(data.results.length == 0) 
    $("#airline_options").append("<li><a href=\"\" onclick=\"return false;\"><i>None Listed</i></a></li>");
  $.each(data.results, function(index, value) {
    $("#airline_options").append("<li><a href=\"\" onclick=\"$('#airline').val(this.innerHTML); $('#idairlines').val('" + value.idairlines + "'); return false;\">" + value.name + " (" + value.iata + ")" + "</a></li>");
  });
}

function updateCityDropdown(data, status, xhr) {
  $("#city_options").empty();
  if($('#city').val() == "")
    $("#city_options").append("<li><a href=\"\" onclick=\"$('#city').val(this.innerHTML); $('#idairports').val(''); return false;\"><i>All (Default)</i></a></li>");
  else
  if(data.results.length == 0) 
    $("#city_options").append("<li><a href=\"\" onclick=\"return false;\"><i>None Listed</i></a></li>");
  $.each(data.results, function(index, value) {
    $("#city_options").append("<li><a href=\"\" onclick=\"$('#city').val(this.innerHTML); $('#idairports').val('" + value.idairports + "'); return false;\">" + value.name + " (" + value.iata_faa + ")" + "</a></li>");
  });
}

function showCityPopup(evt) {
  $('#loading').addClass('in');
  var feature = evt.feature;
  $.ajax({url: '/map/popup', 
    type: "POST",
	dataType: "json",
	data: { airline: $("#airline").val(), 
	  city: $("#city").val(), 
	  idairlines: $("#idairlines").val(),
	  idairports: $("#idairports").val(),
	  "feature": feature.data,
	  type: "city"
	}
  }).done(function(data, status, xhr) {
	var contents = "<h4>" + data.feature.name + " (" + data.feature.iata + ")</h4>" + data.feature.city + ", " + data.feature.country + " (Timezone: " + data.feature.timezone + ")<br/><table class=\"table table-striped table-bordered table-condensed table-responsive\" style=\"margin-bottom:0px;\"><tr>" + (data.airline > '' ? "" : "<th>Airlines</th>") + "<th>To</th><th>From</th></tr>";
    $.each(data.results, function(index, value) {
	  contents = contents + "<tr>" + (data.airline > '' ? "" : "<td>" + value.airline + "</td>") + "<td>" + (data.feature.idairports == (value.source_id + "") ? "" : "<a href=\"\" onclick=\"map.panTo(new OpenLayers.LonLat(city_long_lats['" + value.source + "'].longitude, city_long_lats['" + value.source + "'].latitude).transform(new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()));return false;\">" + value.source + "</a>") + "</td><td>" + (data.feature.idairports == (value.destination_id + "") ? "" : "<a href=\"\" onclick=\"map.panTo(new OpenLayers.LonLat(city_long_lats['" + value.destination + "'].longitude, city_long_lats['" + value.destination + "'].latitude).transform(new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()));return false;\">" + value.destination + "</a>") + "</td></tr>";
	});
	contents = contents + "</table>";
	var popup = new OpenLayers.Popup.Anchored("cityPopup", feature.geometry.getBounds().getCenterLonLat(), null, contents, null, true, function(evt) {selectControl.unselect(feature);this.hide()});
	popup.autoSize = true;
	popup.maxSize = new OpenLayers.Size(400, 400);
    map.addPopup(popup);
    $('#loading').removeClass('in');
  }).fail(function(data, status, xhr) {
    $('#loading').removeClass('in');
	console.log('Error Encountered When Retrieving Data');
  });
}

function showFlightPopup(evt) {
  $('#loading').addClass('in');
  var feature = evt.feature;
  $.ajax({url: '/map/popup', 
    type: "POST",
	dataType: "json",
	data: { airline: $("#airline").val(), 
	  city: $("#city").val(), 
	  idairlines: $("#idairlines").val(),
	  idairports: $("#idairports").val(),
	  "feature": feature.data,
	  type: "route"
	}
  }).done(function(data, status, xhr) {
	var contents = "<table class=\"table table-striped table-bordered table-condensed table-responsive\" style=\"margin-bottom:0px;\"><tr>" + (data.airline > '' ? "" : "<th>Airlines</th>") + "<th>From</th><th>To</th></tr>";
    $.each(data.results, function(index, value) {
	  contents = contents + "<tr>" + (data.airline > '' ? "" : "<td>" + value.airline + "</td>") + "<td>" + "<a href=\"\" onclick=\"map.panTo(new OpenLayers.LonLat(city_long_lats['" + value.source + "'].longitude, city_long_lats['" + value.source + "'].latitude).transform(new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()));return false;\">" + value.source + "</a></td><td>" + "<a href=\"\" onclick=\"map.panTo(new OpenLayers.LonLat(city_long_lats['" + value.destination + "'].longitude, city_long_lats['" + value.destination + "'].latitude).transform(new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()));return false;\">" + value.destination + "</a></td></tr>";
	});
	contents = contents + "</table>";
	var featureCenter = feature.geometry.getBounds().getCenterLonLat();
	var featureLat = featureCenter.lat;
	if(feature.data.source_lat > 0 && feature.data.destination_lat > 0)
	  featureLat = feature.geometry.getBounds().top;
	if(feature.data.source_lat < 0 && feature.data.destination_lat < 0)
	  featureLat = feature.geometry.getBounds().bottom;
	var popup = new OpenLayers.Popup.Anchored("routePopup", new OpenLayers.LonLat(featureCenter.lon, featureLat), null, contents, null, true, function(evt) {selectControl.unselect(feature);this.hide()});
	popup.autoSize = true;
	popup.maxSize = new OpenLayers.Size(400, 400);
    map.addPopup(popup);
    $('#loading').removeClass('in');
  }).fail(function(data, status, xhr) {
    $('#loading').removeClass('in');
	console.log('Error Encountered When Retrieving Data');
  });
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

function show_orthodrome(pt1, pt2, flights, properties)
{
    var pOrigin = new geo.Point(pt1.x, pt1.y);
    var pDest = new geo.Point(pt2.x, pt2.y);

    var ls = GreatCircleLine(pOrigin, pDest);

    var vectors = flights; 

    var theStyle = [];
    if (orthodromeFlag==true)
        theStyle[theStyle.length] = null;

    //theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:2};
    //theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:2};

    // Create a feature from the waypoints LineString and display on map
    var route = [];
    for (var i=0; i<ls.length; i++)
     	route[i] = new OpenLayers.Feature.Vector(ls[i], properties);
    vectors.addFeatures(route);
	return route;
}
