var FeedParser = Npm.require('feedparser');
var Url = Npm.require('url');
var Readable = Npm.require('stream').Readable;

var feedUrls = [
  'http://reddit.com/r/digitalnomad/hot.rss',
  'https://www.kimonolabs.com/api/rss/3f5jp576?apikey=9es3t0vNc6vORrj0s4C6skHz6m4tYfIN',
  'https://nomadlist.com/stories/feed',
  'http://www.hoboceo.com/feed/',
  'https://levels.io/feed/',
  'http://joel.is/',
  'http://www.tropicalmba.com/feed/'
];

var streamGetter = {
  call: function (content) {
    var stream = new Readable();
    stream._read = function() {}; // Set it to no-op in order to push to stream.

    stream.push(content);
    return stream;
  }
};

var feedHandler = {
  call: function (rawContent) {
    var feedParser = new FeedParser(),
        stream = streamGetter.call(rawContent);

    stream.pipe(feedParser);

    feedParser.on('error', function (error) {
      console.log(error);
    });

    feedParser.on('readable', Meteor.bindEnvironment(function () {
      var stream = this,
          meta = this.meta,
          today = moment().format('YYYYMMDD'),
          dateDoc = Flights.find({date: today}),
          item;

      // If date doc does not exist, make one.
      if (dateDoc.count() === 0) {
        Meteor.call('addFlight', {date: today, feeds: []});
      }

      while(item = stream.read()) {
        var newItem = {
          title: item.title,
          url: item.link,
          guid: item.guid,
          author: item.author,
          description: item.description,
          source: feedHandler.getSourceFromLink(item.link),
          hidden: false
        };

        if (!!Flights.findOne({'feeds.guid': item.guid})) {
          console.log('Already exists.');
          continue;
        }

        try {
          Flights.update({date: today}, {$addToSet: {items: newItem}});
        } catch (error) {
          console.log(error);
        }
      }


    }, function (error) {
      console.log('Could not bind environment. ERROR: ' + error);
    }, feedParser));
  },

  getSourceFromLink: function (link) {
    var parsedUrl = Url.parse(link);
    return parsedUrl.host;
  }
};

fetchItems = function () {
  feedUrls.forEach(function (feedUrl) {
    var rssContent = HTTP.get(feedUrl).content;
    feedHandler.call(rssContent);
  });
  PostTweetForFlight.post(Flights.findOne());
};

Meteor.methods({
  allWeNeedIsFetch: function () {
    fetchItems();
  }
});
