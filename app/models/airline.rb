class Airline < ActiveRecord::Base
  self.primary_key = "idairlines"
  has_many :routes, :foreign_key => :airline_id

  def self.find_airline(airline, id)
    toReturn = nil
	index = nil
	if airline.eql?("All (Default)")
	  airline = ""
	end
	return Airline.find(id.to_i) if id > ''
	return toReturn unless airline > ''
	if index = airline.index(/\s\(.+?\)/)
	  toReturn = Airline.where(:active=>'Y').where.not(:iata=>['','-']).where("iata REGEXP :airline", {:airline => airline[index..-1]}).limit(1)
	else
	  toReturn = Airline.where(:active=>'Y').where.not(:iata=>['','-']).where((airline.size > 2 ? "name REGEXP :airline" : "iata REGEXP :airline"), {:airline => airline}).limit(1)
	end
	if toReturn.nil? || toReturn.empty?
	  toReturn = nil
	else
      toReturn = toReturn.first
	end
	toReturn
  end
  
  def self.default_list(limit)
    Airline.where(:active=>'Y').where.not(:iata=>['','-']).order(:name).limit(limit)
  end
  
  def self.match(input)
    Airline.where(:active=>'Y').where.not(:iata=>['','-']).where("name REGEXP :airline OR iata REGEXP :airline", {:airline => input})
  end
end
