require 'compass'
require 'sinatra'
require File.join(File.dirname(__FILE__), 'lib', 'render_partial')
require 'haml'
require 'json'

require 'i18n'
require 'active_support/all'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, File.join(File.dirname(__FILE__), 'views')
set :public, File.join(File.dirname(__FILE__), 'public')

configure do
  Compass.add_project_configuration(File.join(Sinatra::Application.root, 'config.rb'))
end

# At a minimum the main sass file must reside within the views directory
# We create /views/stylesheets where all our sass files can safely reside
get '/stylesheets/:file.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass(:"stylesheets/#{params[:file]}", Compass.sass_engine_options)
end

get '/javascripts/:file.js' do
  content_type 'text/javascript', :charset => 'utf-8'
  File.read(File.join(File.dirname(__FILE__), '..', "#{params[:file]}.js"))
end

get '/stats' do
  content_type :json

  sequence_length = params[:sequence_length].present? ? params[:sequence_length].to_i : 180

  stats = {}
  random = Random.new
  sequence_length.downto(0) do |i|
    stats[i.days.ago.utc.strftime("%Y-%m-%dT%H:%M:%SZ")] ||= random.rand(1...1000000)
  end

  stats.to_json
end

get '/' do
  haml :index
end
