
//     node-bootstrap-readme-docs
//     Copyright (c) 2013- Prove <support@getprove.com> (https://getprove.com/)
//     MIT Licensed

var GitHubApi = require('github')
  , cheerio = require('cheerio')
  , connect = require('connect')
  , moment = require('moment')
  , marked = require('marked')

module.exports = function(app) {

  return function(user, repo, interval) {

    interval = (typeof interval === 'number') ? interval : 900000

    var req, res, next, obj

    return function(_req, _res, _next) {

      req = _req
      res = _res
      next = _next

      if (typeof user !== 'string' || typeof repo !== 'string')
        return next(new Error('Missing user or repo for generating docs'))

      if (typeof app.get('readmeDocs') !== 'object')
        app.set('readmeDocs', {})

      if (typeof app.settings.readmeDocs[user] !== 'object')
        app.settings.readmeDocs[user] = {}

      if (typeof app.settings.readmeDocs[user][repo] !== 'object')
        app.settings.readmeDocs[user][repo] = {}

      obj = app.settings.readmeDocs[user][repo]

      if (obj.created
          && moment.isMoment(obj.created)
          && moment().diff(obj.created) <= interval)
        return next()

      var github = new GitHubApi({
          version: "3.0.0"
        , timeout: 5000
      })

      github.repos.getReadme({
          user: user
        , repo: repo
      }, getReadme)

    }

    function getReadme(err, body) {
      if (err) return next(err)

      // Set created date, we use this for re-caching the readme docs (see above check)
      obj.created = moment()

      var readme = marked(new Buffer(body.content, body.encoding).toString())
        , $ = cheerio.load(readme)

      // Convert index to navbar
      var $ul = $('h2').first().next('ul')

      // Make the first link active
      $ul.find('li').first().addClass('active')
      obj.nav = $ul.html()
      $ul.remove()
      $('h2').first().remove()

      // Replace all header tags with anchor tags
      $('h2, h3, h4, h5, h6').each(function(i, el) {
        // Remove <sup> from text
        var $sup = $(this).find('sup')
        if ($sup.length !== 0)
          $(this).find('sup').remove()
        var text = $(this).text().trim()
        // Prepare the link
        var link = text.replace(/\s/g, '-').toLowerCase()
        $(this).html('<a href="#' + link + '" name="' + link + '" id="' + link + '">' + text + '</a>' + (($sup.length !== 0) ? ' ' + $.html($sup) : '' ) )
        $(this).before('<hr />')
      })

      // Add prettyprint and linenums all <pre>'s
      $('pre').addClass('prettyprint linenums')

      // Add .table, .table-striped, .table-hover to all <table>'s
      $('table').addClass('table table-striped table-hover')

      obj.body = $.html()

      next()
    }

  }

}
