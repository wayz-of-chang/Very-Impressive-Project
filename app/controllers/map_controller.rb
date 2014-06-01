class MapController < ApplicationController
  def index
    @airlines = Airline.default_list(50)
	@cities = Airport.default_list(50)
  end
  
  def populate_map
	@airline = Airline.find_airline(params[:airline], params[:idairlines])
	@city = Airport.find_city(params[:city], params[:idairports])
	@flights = []
	@cities = []
	if @city.nil?
	  if @airline.nil?
	    @flights = Route.group(:source_id, :destination_id)
	    @cities = Airport.default_list(nil)
	  else
	    @flights = Route.where(:airline_id=>@airline.idairlines)
	    @cities = Airport.find_from_flights(@flights, @airline.idairlines)
	  end
	else
	  @flights = Route.find_routes(@city.idairports, :or, @airline)
	  @cities = Airport.find_from_flights(@flights, ( @airline ? @airline.idairlines : nil))
	end
	render :json => {:airline => @airline, :city => @city, :airports => @cities, :flights => @flights}
  end
  
  def list
    if params[:field] == "airline"
	  if params[:input] > ""
	    render :json => {:results => Airline.match(params[:input])}
	  else
	    render :json => {:results => Airline.default_list(50)}
	  end
	end
	if params[:field] == "city"
	  if params[:input] > ""
	    render :json => {:results => Airport.match(params[:input])}
	  else
	    render :json => {:results => []}
	  end
	end
  end
  
  def popup
	results = nil
    airline = Airline.find_airline(params[:airline], params[:idairlines])
	city = Airport.find_city(params[:city], params[:idairports])
	if params[:type].eql?("city")
	  results = populate_city_results(airline, city, params[:feature])
	else
	  results = populate_route_results(airline, city, params[:feature])
	end
	render :json => {:airline => params[:airline], :city => params[:city], :feature => params[:feature], :results => results}
  end
  
  def populate_city_results(airline, city, feature)
    if city.nil?
	  city = Airport.where(:iata_faa=>feature[:iata], :name=>feature[:name]).limit(1)
	  city = city.first unless city.nil? || city.empty?
	end
	populate_results(city.idairports, :or, airline)
  end

  def populate_route_results(airline, city, feature)
	@route = Route.find(feature[:id])
	populate_results([@route.source_id, @route.destination_id], :and, airline)
  end
  
  def populate_results(cities, type, airline)
	@flights = []
    if airline.nil?
	  @flights = Route.find_routes(cities, type)
	else
	  @flights = Route.find_airline_routes(cities, type, airline.idairlines)
	end
    @flights
  end
end
