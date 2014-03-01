class Route < ActiveRecord::Base
  self.primary_key = "idroutes"

  def self.find_routes(cities, type, airline=nil)
    if airline.nil?
      Route.select("group_concat(airline SEPARATOR \",\") as airline, source, source_id, destination, destination_id, idroutes").where("source_id IN (:cities) #{type} destination_id IN (:cities)", {:cities=>cities}).where.not(:airline=>[nil,'']).group(:source, :destination)
	else
	  find_airline_routes(cities, type, airline)
	end
  end
  
  def self.find_airline_routes(cities, type, airline)
    Route.where("source_id IN (:cities) #{type} destination_id IN (:cities)", {:cities=>cities}).where(:airline_id=>airline)
  end
end
