require 'pp'
class MapController < ApplicationController
  def index
    @airlines = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').order(:name).limit(50)
	@cities = Airport.group(:longitude, :latitude).limit(50)
  end
  
  def find_airline(airline, id)
    toReturn = nil
	index = nil
	if airline == "All (Default)"
	  airline = ""
	end
	return Airline.find(id) if id > ''
	return toReturn unless airline > ''
	if index = airline.index(/\s\(.+?\)/)
	  toReturn = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').where("iata REGEXP :airline", {:airline => airline[index..-1]}).limit(1)
	else
	  toReturn = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').where((airline.size > 2 ? "name REGEXP :airline" : "iata REGEXP :airline"), {:airline => airline}).limit(1)
	end
	if toReturn.nil? || toReturn.empty?
	  toReturn = nil
	else
      toReturn = toReturn.first
	end
	toReturn
  end
  
  def find_city(city, id)
    toReturn = nil
    index = nil
	return Airport.find(id) if id > ''
	return nil unless city > ''
	if index = city.index(/\s\(.+?\)/)
	  toReturn = Airport.where("name REGEXP :city", {:city => city[0...index]}).limit(1)
	else
	  toReturn = Airport.where((city.size > 3 ? "name REGEXP :city" : "iata_faa REGEXP :city"), {:city => city}).limit(1)
	end
	if toReturn.nil? || toReturn.empty?
	  toReturn = nil
	else
      toReturn = toReturn.first
	end
	toReturn
  end
  
  def populate_map
    puts "Airline: #{params[:airline]}"
	puts "City: #{params[:city]}"
	@airline = find_airline(params[:airline], params[:idairlines])
	@city = find_city(params[:city], params[:idairports])
	@flights = []
	@cities = []
	if @airline.nil?
		if @city.nil?
			@cities = Airport.group(:longitude, :latitude)
			@flights = Route.group(:source_id, :destination_id)
		else
			@flights = Route.where("source_id = :city_id OR destination_id = :city_id", {:city_id=>@city.idairports})
			@cities = Airport.where(:idairports=>@flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq)
		end
	else
		if @city.nil?
			@flights = Route.where(:airline_id=>@airline.idairlines)
		else
			@flights = Route.where("source_id = :city_id OR destination_id = :city_id", {:city_id=>@city.idairports}).where(:airline_id=>@airline.idairlines)
		end
		@cities = Airport.where(:idairports=>@flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq)
	end
	render :json => {:airline => @airline, :city => @city, :airports => @cities, :flights => @flights}
  end
  
  def list
    if params[:field] == "airline"
	  if params[:input] != ""
	    render :json => {:results => Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').where("name REGEXP :airline OR iata REGEXP :airline", {:airline => params[:input]})}
	  else
	    render :json => {:results => Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').order(:name)}
	  end
	end
	if params[:field] == "city"
	  if params[:input] != ""
	    render :json => {:results => Airport.where("name REGEXP :airport OR iata_faa REGEXP :airport OR city REGEXP :airport", {:airport => params[:input]})}
	  else
	    render :json => {:results => []}
	  end
	end
  end
  
  def popup
    puts params[:airline]
	puts params[:city]
	puts params[:feature]
	puts params[:type]
	results = nil
	if params[:type] == "city"
	  results = populate_city_results(params[:airline], params[:idairlines], params[:city], params[:idairports], params[:feature])
	else
	  results = populate_route_results(params[:airline], params[:idairlines], params[:city], params[:idairports], params[:feature])
	end
	render :json => {:airline => params[:airline], :city => params[:city], :feature => params[:feature], :results => results}
  end
  
  def populate_city_results(airline, idairlines, city, idairports, feature)
    @airline = find_airline(airline, idairlines)
	@city = find_city(city, idairports)
	@flights = []
	@cities = []
    if @city.nil?
	  @city = Airport.where(:iata_faa=>feature[:iata]).where(:name=>feature[:name]).limit(1)
	  @city = @city.first unless @city.nil? || @city.empty?
	end
    if @airline.nil?
	  @flights = Route.select("group_concat(airline SEPARATOR \",\") as airline, source, source_id, destination, destination_id").where("source_id = :city_id OR destination_id = :city_id", {:city_id=>@city.idairports}).where.not(:airline=>[nil,'']).group(:source, :destination)
	  pp @flights
	  @cities = Airport.where(:idairports=>@flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq)
	else
	  @flights = Route.where("source_id = :city_id OR destination_id = :city_id", {:city_id=>@city.idairports}).where(:airline_id=>@airline.idairlines)
	  pp @flights
	  @cities = Airport.where(:idairports=>@flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq)
	end
	@flights
  end

  def populate_route_results(airline, idairlines, city, idairports, feature)
    @airline = find_airline(airline, idairlines)
	@city = find_city(city, idairports)
	@flights = []
	@cities = []
	@route = Route.find(feature[:id])
    if @airline.nil?
	  @flights = Route.select("group_concat(airline SEPARATOR \",\") as airline, source, source_id, destination, destination_id").where(:source_id=>[@route.source_id, @route.destination_id], :destination_id=>[@route.source_id, @route.destination_id]).where.not(:airline=>[nil,'']).group(:source, :destination)
	  pp @flights
	else
	  @flights = Route.where(:source_id=>[@route.source_id, @route.destination_id], :destination_id=>[@route.source_id, @route.destination_id]).where(:airline_id=>@airline.idairlines)
	  pp @flights
	end
	@flights
  end
end
