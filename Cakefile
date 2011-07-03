fs     = require 'fs'
{exec, spawn} = require 'child_process'
{print} = require 'sys'

appFiles  = [
  # omit src/ and .coffee to make the below lines a little shorter
  'strftime'
  'delorean'
]

task 'build', 'Build single application file from source files', ->
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile './delorean.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile ./delorean.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        fs.unlink './delorean.coffee', (err) ->
          throw err if err
          console.log 'Compiled delorean.js into project root.'

task 'minify', 'Minify the resulting application file after build', ->
  exec 'java -jar "./lib/compiler.jar" --js ./delorean.js --js_output_file ./delorean.min.js', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'docs', 'Generate annotated source code with Docco', ->
  fs.readdir 'src', (err, contents) ->
    files = ("src/#{file}" for file in contents when /\.coffee$/.test file)
    docco = spawn 'docco', files
    docco.stdout.on 'data', (data) -> print data.toString()
    docco.stderr.on 'data', (data) -> print data.toString()
    docco.on 'exit', (status) -> callback?() if status is 0
