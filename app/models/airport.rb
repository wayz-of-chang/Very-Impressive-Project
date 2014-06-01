class Airport < ActiveRecord::Base
  self.primary_key = "idairports"
  has_many :routes_out, :class_name => :Route,
                        :foreign_key => :source_id
  has_many :routes_in,  :class_name => :Route,
                        :foreign_key => :destination_id

  def self.find_city(city, id)
    toReturn = nil
    index = nil
	return Airport.find(id.to_i) if id > ''
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
  
  def self.default_list(limit)
    Airport.group(:longitude, :latitude).limit(limit)
  end  
  
  def self.find_from_flights(flights, airline_id)
    if(airline_id)
      Airport.select("#{Airport.table_name}.*, count(#{Airport.table_name}.idairports) as airport_size").joins(:routes_out, :routes_in).where(:idairports=>flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq, :routes => {:airline_id => airline_id}, :routes_ins_airports => {:airline_id => airline_id}).group(:idairports)
	else
      Airport.select("#{Airport.table_name}.*, count(#{Airport.table_name}.idairports) as airport_size").joins(:routes_out, :routes_in).where(:idairports=>flights.collect{ |flight| [flight.source_id, flight.destination_id] }.flatten.uniq).group(:idairports)
	end
  end
  
  def self.match(input)
    Airport.where("name REGEXP :airport OR iata_faa REGEXP :airport OR city REGEXP :airport", {:airport => input})
  end
end
