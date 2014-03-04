require "spec_helper"

describe Airline do
  it "finds correct airline" do
    expect(Airline.find_airline("AA", "").idairlines).to eq(24)
    expect(Airline.find_airline("American", "").idairlines).to eq(24)
  end
end