class MapController < ApplicationController
  def index
    @airlines = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').order(:name)
  end
  
  def populate_map
    puts "Airline: #{params[:airline]}"
	puts "City: #{params[:city]}"
	index = [nil, nil]
	if params[:airline] == "All (Default)"
	  params[:airline] = ""
	end
	if index[0] = params[:airline].index(/\s\(.+?\)/)
	  @airline = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').where("name REGEXP :airline", {:airline => params[:airline][0...(index[0])]}).limit(1) if params[:airline] > ''
	else
	  @airline = Airline.where(:active=>'Y').where.not(:iata=>'').where.not(:iata=>'-').where((params[:airline].size > 2 ? "name REGEXP :airline" : "iata REGEXP :airline"), {:airline => params[:airline]}).limit(1) if params[:airline] > ''
	end
	if index[1] = params[:city].index(/\s\(.+?\)/)
	  @city  = Airport.where("name REGEXP :city", {:city => params[:city][0...(index[1])]}).limit(1) if params[:city] > ''
	else
	  @city  = Airport.where((params[:city].size > 3 ? "name REGEXP :city" : "iata_faa REGEXP :city"), {:city => params[:city]}).limit(1) if params[:city] > ''
	end
	@flights = []
	@cities = []
	if @airline.nil? || @airline.empty?
		if @city.nil? || @city.empty?
			@cities = Airport.group(:longitude, :latitude)
			@flights = Route.group(:source_id, :destination_id)
		else
			@city = @city.first
			@flights = Route.where("source_id = :city_id OR destination_id = :city_id", {:city_id=>@city.idairports})
			@cities = Airport.where(:idairports=>@flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq)
		end
	else
		@airline = @airline.first
		if @city.nil? || @city.empty?
			@flights = Route.where(:airline_id=>@airline.idairlines)
		else
			@city = @city.first
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
end
