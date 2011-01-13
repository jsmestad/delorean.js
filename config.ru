require 'sinatra'
require File.join(File.dirname(__FILE__), 'web', 'facelift')

run Sinatra::Application
