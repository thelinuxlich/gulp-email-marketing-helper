### Instructions

* Install Node.js
* Install Growl(if Windows)
* Install Python 2.7: https://www.python.org/downloads/
* Install Visual C++ 2010 Express(if Windows): http://go.microsoft.com/?linkid=9709949
* npm install -g gulp
* go the project root
* npm install
* change assets path where needed in gulpfile.js
* gulp build --file confirm (or any file on src/html/emails)
* gulp dev --file confirm (for watching changes)
* You can pass a --external parameter to rewrite all CSS URL and image sources to reference an external link, provided on the parameter paths.url_css on the top of the gulpfile.js
* The routine for using this project would be to point your web server to the dist folder, open dist/email_debug.html(which has LiveReload script), edit less and html files and see the changes occurring instantly, then use dist/email.html in production
