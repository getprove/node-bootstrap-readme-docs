
var express = require('express')
  , app = express()
  , readmeDocs = require('../')(app) // you would use `require('readme-docs')`

app.set('view engine', 'jade')

app.use(express.static(__dirname + '/public'))

app.get('/', readmeDocs.middleware('getprove', 'node-bootstrap-readme-docs'), function(req, res, next) {
  res.render('docs', {
      title: 'Node Bootstrap Readme Docs'
    , github: 'https://github.com/getprove/node-bootstrap-readme-docs'
  })
})

app.listen(3000)

console.log('Visit <http://localhost:3000> in your browser to view the example.')
