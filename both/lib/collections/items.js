Items = new Mongo.Collection('items');

var ItemSchema = new SimpleSchema({
  title: {
    type: String
  },
  url: {
    type: String
  },
  guid: {
    type: String
  },
  sourceName: {
    type: String
  },
  sourceUrl: {
    type: String
  },
  sourceType: {
    type: String,
    optional: true
  },
  authorName: {
    type: String,
    optional: true
  },
  authorTwitter: {
    type: String,
    optional: true
  },
  publishedDate: {
    type: Date,
    optional: true
  },
  flightId: {
    type: String,
    optional: true
  },
  hidden: {
    type: Boolean,
    defaultValue: false
  },
  tweeted: {
    type: Boolean,
    defaultValue: false
  },
  shortLink: {
    type: String
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
    defaultValue: new Date()
  }
});

Items.attachSchema(ItemSchema);

// Factory to generate test fixture
Factory.define('item', Items, {
  title: 'example title',
  url: 'http://example.com/example_post',
  guid: 'http://example.com/example_post',
  sourceName: 'Example',
  sourceUrl: 'http://www.example.com',
  sourceType: 'blog',
  authorName: 'jon',
  authorTwitter: 'jonjonjon',
  publishedDate: new Date(2015, 6, 28),
  flightId: 'a1',
  shortLink: Math.random().toString(36).substring(12),
  createdAt: new Date(2015, 6, 30)
});

Meteor.methods({
  'createItem': function (item, date) {
    if (!Meteor.isServer && !Meteor.user().isAdmin) return null;
    if (Items.find({'guid': item.guid}).count() > 0) return null;

    var flight = Flights.findOne({date: date});
    var shortLink = shortLinkFactory.build();
    var newItemId = Items.insert(_.extend(item, {flightId: flight._id, shortLink: shortLink}));

    // Add the id of new item to itemIds
    Flights.update({date: date}, {$addToSet: {itemIds: newItemId}});

    // Create viewStat for the item
    ViewStats.insert({itemId: newItemId});

    console.log('created ' + item.title);
  },

  'toggleHidden': function (itemId) {
    if (!Meteor.isServer && !Meteor.user().isAdmin) return null;

    var item = Items.findOne(itemId);
    Items.update(itemId, {$set: {hidden: !item.hidden}});
  },

  'removeItem': function (itemId) {
    if (!Meteor.isServer && !Meteor.user().isAdmin) return null;

    Items.remove(itemId);
    Flights.update({'itemIds': itemId}, {$pull: {'itemIds': itemId}});
  }
});
