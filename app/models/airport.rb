class Airport < ActiveRecord::Base
  self.primary_key = "idairports"
  has_many :routes_out, :class_name => :Route,
                        :foreign_key => :source_id
  has_many :routes_in,  :class_name => :Route,
                        :foreign_key => :destination_id
end
