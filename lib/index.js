// mongoose-text-search

module.exports = exports = function textSearch (schema, options) {
  schema.statics.textSearch = function (search, o, cb) {
    if ('function' == typeof o) cb = o, o = {};

    if ('function' != typeof cb) {
      throw new TypeError('textSearch: callback is required');
    }

    var model = this;
    var lean = !! o.lean;

    // mongodb commands require property order :(
    // text must be first
    var cmd = {};
    cmd.text = o.text || this.collection.name;

    cmd.search = search;

    var keys = Object.keys(o);
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      switch (key) {
        case 'text':
          // fall through
        case 'lean':
          continue;
        case 'filter':
          cmd.filter = model.find(o.filter).cast(model);
          break;
        case 'project':
          // cast and apply default schema field selection
          var query = model.find().select(o.project);
          query._applyPaths();
          var fields = query._castFields(query._fields);
          if (fields instanceof Error) return cb(fields);
          cmd.project = fields;
          break;
        default:
          cmd[key] = o[key];
      }
    }

    this.db.db.command(cmd, function (err, res) {
      if (err) return cb(err, res);
      if (res.errmsg) return cb(new Error(res.errmsg));
      if (!lean && Array.isArray(res.results)) {
        // convert results to documents
        res.results.forEach(function (doc) {
          if (!doc.obj) return;
          var d = new model(undefined, undefined, true);
          d.init(doc.obj);
          doc.obj = d;
        })
      }
      cb(err, res);
    });
  }
}

exports.version = require('../package').version;
