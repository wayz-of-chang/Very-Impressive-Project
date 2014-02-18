class Airline < ActiveRecord::Base
  self.primary_key = "idairlines"
  has_many :routes, :foreign_key => :airline_id
end
