// ########################################
// some constants
// ########################################

//var earth_radius = 3958.75;           // in miles
var earth_radius = 6371.11;           // in km

// ########################################
// calculate route
// ########################################

var routeNo = 0;
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
    /*if(map.projection != "EPSG:4326")
    {
        var fromProjection = new OpenLayers.Projection(map.projection);
        var toProjection   = new OpenLayers.Projection("EPSG:4326");

        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y).transform(fromProjection, toProjection);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y).transform(fromProjection, toProjection);
    }
    else
    {
        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y);
    }*/

    var pOrigin = new geo.Point(pt1.x, pt1.y);
    var pDest = new geo.Point(pt2.x, pt2.y);

    var ls = GreatCircleLine(pOrigin, pDest);

    //addLayer(serverObj["server"][0]);

    var vectors = flights; //map.layers[map.layers.length-1];
    //vectors.name = "Route " + ++routeNo;
    //ctrlLyr.redraw();

    //var myStyle = OpenLayers.Util.extend({}, vectors.styleMap.styles["default"].defaultStyle);

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

    //var drad = pOrigin.geoDistanceTo(pDest);

    //document.getElementById("distance").innerHTML = "Distance : " + parseInt(drad*earth_radius*100)/100 + " km";
}

// ########################################
// manuelle Eingabe der Punktkoordinaten
// ########################################

/*function setPointCoordinates(pt1, pt2)
{
    if(map.projection != "EPSG:4326")
    {
        var fromProjection = new OpenLayers.Projection(map.projection);
        var toProjection   = new OpenLayers.Projection("EPSG:4326");

        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y).transform(fromProjection, toProjection);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y).transform(fromProjection, toProjection);
    }
    else
    {
        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y);
    }

    var Stellen = 4;
    var fktr = Math.pow(10,Stellen);
    var Msg = Math.round(pt1.x*fktr)/fktr + "," + Math.round(pt1.y*fktr)/fktr + "," + Math.round(pt2.x*fktr)/fktr + "," + Math.round(pt2.y*fktr)/fktr;
    var Coordinates = window.prompt("new coordinates in grad", Msg);

    if(Coordinates != Msg && Coordinates!=null)
    {
        var tmp = Coordinates.split(",");

        if(map.projection != "EPSG:4326")
        {
            var toProjection = new OpenLayers.Projection(map.projection);
            var fromProjection   = new OpenLayers.Projection("EPSG:4326");

            var pt1 = new OpenLayers.Geometry.Point(parseFloat(tmp[0]), parseFloat(tmp[1])).transform(fromProjection, toProjection);
            var pt2 = new OpenLayers.Geometry.Point(parseFloat(tmp[2]), parseFloat(tmp[3])).transform(fromProjection, toProjection);
        }
        else
        {
            var pt1 = new OpenLayers.Geometry.Point(parseFloat(tmp[0]), parseFloat(tmp[1]));
            var pt2 = new OpenLayers.Geometry.Point(parseFloat(tmp[2]), parseFloat(tmp[3]));
        }

        lyrDistancePoints.features[0].geometry.x = pt1.x;
        lyrDistancePoints.features[0].geometry.y = pt1.y;
        lyrDistancePoints.features[1].geometry.x = pt2.x;
        lyrDistancePoints.features[1].geometry.y = pt2.y;
    }
    lyrDistancePoints.drawFeature(lyrDistancePoints.features[0]);
    lyrDistancePoints.drawFeature(lyrDistancePoints.features[1]);
}*/

// ########################################
// layer declarations
// ########################################

/*var serverObj = { server:
[
  {
    title: "Vector Layer",
    url: "",
    mapfile: "",
    params : {
      layers        : "Vectors",
      format        : "",
      version       : "",
      transparent   : true
    },
    options : {
      isBaseLayer : false,
      isVisible   : true,
      gutter      : 0,
      buffer      : 1,
      opacity     : 1
    },
    vendor : {
      sid          : "V10100",
      service      : "VECTOR",
      aktlayers    : "Vectors",
      aktqlayers   : "Vectors",
      lyrNames     : ["Vectors"],
      lyrTitles    : ["Vectors"],
      lyrVisible   : [1],
      lyrQueryable : [0],
      lyrQChecked  : [0]
    }
  },
  {
    title: "Fake BaseLayer",
    url: "",
    mapfile: "",
    params : {
      layers        : "BASELAYER",
      format        : "image/png",
      version       : "1.1.1",
      transparent   : true
      },
    options : {
      isBaseLayer : true,
      isVisible   : true,
      gutter      : 0,
      buffer      : 1,
      opacity     : 1
    },
    vendor : {
      sid          : "BASELAYER",
      service      : "BASELAYER",
      maxscale     : 6144000,
      center       : [2583607.439,5680146.272],
      aktlayers    : "FAKE BASELAYER",
      aktqlayers   : "",
      lyrNames     : ["FAKE BASELAYER"],
      lyrTitles    : ["FAKE BASELAYER"],
      lyrVisible   : [1],
      lyrQueryable : [0],
      lyrQChecked  : [0]
    }
  },
  {
    title: "Google Maps",
    url: "",
    mapfile: "",
    params:{
      transparent:false
    },
    options : {
      isBaseLayer       : true,
      isVisible         : true,
      type              : G_SATELLITE_MAP,
      maxZoomLevel      : 22,
      sphericalMercator : true,
      buffer            : 1,
      opacity           : 1
    },
    vendor : {
      sid           : "GOOGLE_900913",
      service       : "GOOGLE",
      aktlayers     : "SATELLITE",
      aktqlayers    : "",
      lyrNames      : ["SATELLITE", "NORMAL", "HYBRID", "TERRAIN"],
      lyrTitles     : ["Satellite", "Streets", "Hybrid", "Terrain"],
      lyrVisible    : [1, 0, 0, 0],
      lyrQueryable  : [0, 0, 0, 0],
      lyrQChecked   : [0, 0, 0, 0]
    }
  },
  {
   title : "DEMIS World Map",
   url : "http://www2.demis.nl/wms/wms.asp?wms=WorldMap&",
   mapfile : "",
   params : {
     format       : "image/png",
     version      : "1.1.1",
     transparent  : true,
     layers       : "Bathymetry,Topography,Hillshading"
   },
   options : {
     isVisible    : true
   },
   vendor : {
     sid          : "10700",
     lyrNames     : ["Bathymetry", "Countries", "Topography", "Hillshading", "Builtup areas", "Coastlines", "Waterbodies", "Inundated", "Rivers", "Streams", "Railroads", "Highways", "Roads", "Trails", "Borders", "Cities", "Settlements", "Spot elevations", "Airports", "Ocean features"],
     maxscale     : 1000,
     center       : [-2,0],
     service      : "WMS",
     lyrVisible   : [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
     lyrQueryable : [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
     lyrQChecked  : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
     lyrTitles    : ["Bathymetry", "Countries", "Topography", "Hillshading", "Builtup areas", "Coastlines", "Waterbodies", "Inundated", "Rivers", "Streams", "Railroads", "Highways", "Roads", "Trails", "Borders", "Cities", "Settlements", "Spot elevations", "Airports", "Ocean features"]
   }
  },
  {
     title: "World gis",
     url: "http://gis.ibbeck.de/include/mapserver/mapserv.exe?map=/daten/mapfiles/world/World.map",
     mapfile: "",
     params : {
       layers        : "GRID10,GRID30",
       format        : "image/png",
       version       : "1.1.1",
       transparent   : true,
       exceptions    : "application/vnd.ogc.se_inimage"
     },
     options : {
       isBaseLayer : false,
       isVisible   : true,
       gutter      : 10,
       buffer      : 1,
       opacity     : 1
     },
     vendor : {
       sid          : "lyrWMS_1367",
       service      : "WMS",
       lyrNames     : ["GRID5","GRID10","GRID30"],
       lyrTitles    : ["Grid5min","Grid10min","Grid30min"],
       lyrVisible   : [0,1,1],
       lyrQueryable : [0,0,0],
       lyrQChecked  : [0,0,0]
     }
  }
]};*/

// ########################################
// add layer function
// ########################################

/*function addLayer(obj)
{
    obj["options"].displayOutsideMaxExtent=true;

    if(obj.vendor.service == "GOOGLE")
    {   var lyr = new OpenLayers.Layer.Google(obj["title"], obj["options"]);
        //lyr.service = obj.service;
        lyr.vendor  = obj["vendor"];
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "BASELAYER")
    {
        var lyr = new OpenLayers.Layer(obj["title"], obj["url"], obj["params"], obj["options"] );
        lyr.vendor  = obj["vendor"];
        lyr.setVisibility(lyr.options.isVisible);
        lyr.isBaseLayer=true;
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "VECTOR")
    {
        var lyr = new OpenLayers.Layer.Vector("Editable Vectors");
        var randomColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]));
        var selectColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["select"]));

        try{
            lyr.styleMap = new OpenLayers.StyleMap({'default':{fillOpacity: 0.5, fillColor: randomColor(128,128,128, 127,127,127), strokeWidth: 3, strokeColor: randomColor(128,128,128, 127,127,127, true), pointRadius: 3}, 'select':{fillOpacity: 0.5, fillColor: 'yellow', strokeWidth: 2, strokeColor: 'yellow', pointRadius: 5}});
        }catch(err){};

        lyr.options = obj["options"];
        lyr.vendor  = obj["vendor"];
        lyr.setVisibility(lyr.options.isVisible);
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "WMS")
    {   var lyr = new OpenLayers.Layer.WMS(obj["title"], obj["url"], obj["params"], obj["options"] );
        //lyr.service = obj.service;
        lyr.vendor  = obj["vendor"];
        lyr.vendor.info_format = "text/html";
        lyr.vendor.feature_count = 1;
        lyr.setVisibility(lyr.options.isVisible);
        map.addLayer(lyr);
    }
}*/

// ########################################
// delete active layer
// ########################################

/*function removeAktLayer()
{
    map.removeLayer(map.layers[map.aktLayer]);
    map.aktLayer=0;
}*/

// ########################################
// utils for random coloring vectors layers
// ########################################

function randomColor(r,g,b, ri,gi,bi, flag)
{
    if(flag==true)
        var randomIdx = parseInt(parseInt((3*15+1)*Math.random()-0.0001) % 3);
    else
        randomIdx=-1;

    var red  = (randomIdx==0) ? parseInt(r - ri*Math.random()) : parseInt(r + ri*Math.random());
    var green= (randomIdx==1) ? parseInt(g - gi*Math.random()) : parseInt(g + gi*Math.random());
    var blue = (randomIdx==2) ? parseInt(b - bi*Math.random()) : parseInt(b + bi*Math.random());

    return("#" + DecToHex(red) + DecToHex(green) + DecToHex(blue));
}

function DecToHex(dec)
{
    var hexStr = "0123456789ABCDEF";
    var low = dec % 16;
    var high = (dec - low)/16;
    hex = "" + hexStr.charAt(high) + hexStr.charAt(low);
    return hex;
}
