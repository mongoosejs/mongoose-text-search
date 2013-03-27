#mongoose-text-search
======================

Provides MongoDB 2.4 text search support for mongoose.

[![Build Status](https://travis-ci.org/aheckmann/mongoose-text-search.png?branch=master)](https://travis-ci.org/aheckmann/mongoose-text-search)

## Example:

```js
// modules
var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');

// create our schema
var gameSchema = mongoose.Schema({
    name: String
  , tags: [String]
  , likes: Number
  , created: Date
});

// give our schema text search capabilities
gameSchema.plugin(textSearch);

// add a text index to the tags array
gameSchema.index({ tags: 'text' });

// test it out
var Game = mongoose.model('Game', gameSchema);

Game.create({ name: 'Super Mario 64', tags: ['nintendo', 'mario', '3d'] }, function (err) {
  if (err) return handleError(err);

  Game.textSearch('3d', function (err, output) {
    if (err) return handleError(err);

    var inspect = require('util').inspect;
    console.log(inspect(output, { depth: null }));

    // { queryDebugString: '3d||||||',
    //   language: 'english',
    //   results:
    //    [ { score: 1,
    //        obj:
    //         { name: 'Super Mario 64',
    //           _id: 5150993001900a0000000001,
    //           __v: 0,
    //           tags: [ 'nintendo', 'mario', '3d' ] } } ],
    //   stats:
    //    { nscanned: 1,
    //      nscannedObjects: 0,
    //      n: 1,
    //      nfound: 1,
    //      timeMicros: 77 },
    //   ok: 1 }
  });
});
```

### Output:

The output is not limited to the found documents themselves but also the complete details of the executed command.

The `results` property of the output is an array of objects containing the found document and its corresponding search ranking. `score` is the ranking, `obj` is the [mongoose document](http://mongoosejs.com/docs/documents.html).

For more information about these properties, read the [MongoDB documentation](http://docs.mongodb.org/manual/reference/text-search/#text-search-output).

## Options

`mongoose-text-search` supports passing an options object as the second argument.

- `project`: select which [fields](http://docs.mongodb.org/manual/reference/command/text/) to return (mongoose [field selection](http://mongoosejs.com/docs/api.html#query_Query-select) syntax supported)
- `filter`: declare an additional [query matcher](http://docs.mongodb.org/manual/reference/command/text/) using `find` syntax (arguments are cast according to the schema).
- `limit`: [maximum number](http://docs.mongodb.org/manual/reference/command/text/) of documents (mongodb default is 100)
- `language`: change the [search language](http://docs.mongodb.org/manual/reference/command/text/)
- `lean`: Boolean: if true, documents are not cast to [mongoose documents](http://mongoosejs.com/docs/documents.html) (default false)

Example:

```js
var options = {
    project: '-created'                // do not include the `created` property
  , filter: { likes: { $gt: 1000000 }} // casts queries based on schema
  , limit: 10
  , language: 'spanish'
  , lean: true
}

Game.textSearch('game -mario', options, callback);
```

## Notes:

As of mongoose 3.6.0, text indexes must be added using the [Schema.index()](http://mongoosejs.com/docs/api.html#schema_Schema-index) method.

As of MongoDB 2.4.0, [text search](http://docs.mongodb.org/manual/applications/text-search/) is experimental/beta. As such, this functionality is not in mongoose core.
