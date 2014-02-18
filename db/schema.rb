# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 0) do

  create_table "airlines", primary_key: "idairlines", force: true do |t|
    t.string "name",     limit: 100
    t.string "alias",    limit: 45
    t.string "iata",     limit: 2
    t.string "icao",     limit: 3
    t.string "callsign", limit: 100
    t.string "country",  limit: 45
    t.string "active",   limit: 1
  end

  create_table "airports", primary_key: "idairports", force: true do |t|
    t.string  "name",      limit: 100
    t.string  "city",      limit: 45
    t.string  "country",   limit: 45
    t.string  "iata_faa",  limit: 3
    t.string  "icao",      limit: 4
    t.float   "latitude"
    t.float   "longitude"
    t.decimal "altitude",              precision: 6, scale: 0
    t.decimal "timezone",              precision: 5, scale: 2
    t.string  "dst",       limit: 1
  end

  create_table "routes", primary_key: "idroutes", force: true do |t|
    t.string  "airline",        limit: 3
    t.integer "airline_id"
    t.string  "source",         limit: 4
    t.integer "source_id"
    t.string  "destination",    limit: 4
    t.integer "destination_id"
    t.string  "codeshare",      limit: 1
    t.integer "stops"
    t.string  "equipment",      limit: 43
  end

end
