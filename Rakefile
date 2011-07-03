task :default => [:compile, :docs]

desc "recompile"
task :compile do
  system "coffee -co compiled src/delorean.coffee"
  system "closure --compilation_level SIMPLE_OPTIMIZATIONS < compiled/delorean.js > compiled/delorean.min.js"
end

desc "relint"
task :lint do
  system "coffee -l src/delorean.coffee"
end

desc "generate documentation"
task :docs do
  system "bash -c \"cake docs\""
end

desc "update github pages"
task :update_gh_pages => :docs do
  system "cp -r docs __updates__"
  system "git co gh-pages"
  system "cp __updates__/* ."
  system "mv delorean.html index.html"
  system "rm -rf __updates__"
end

