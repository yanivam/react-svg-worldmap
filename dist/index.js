
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-svg-worldmap.cjs.production.min.js')
} else {
  module.exports = require('./react-svg-worldmap.cjs.development.js')
}
