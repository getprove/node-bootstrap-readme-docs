
// Express & Jade Example

var express = require('express')
  , app = express()
  , readmeDocs = require('../')(app) // you would use `require('readme-docs')`

app.set('view engine', 'jade')

app.use(express.static(__dirname + '/public'))

app.get('/', readmeDocs('getprove', 'node-bootstrap-readme-docs'), function(req, res, next) {
  res.render('docs')
})

app.listen(3000)

console.log('Visit <http://localhost:3000> in your browser to view the example.')

