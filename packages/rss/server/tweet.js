var Twit = Npm.require('twit');

PostTweetForFlight = {
  post: function (flight) {
    var tweetMessage = "✈✈✈ Flight #" + flight.number + " on @airstripio - http://airstrip.io/f/" + flight.date + " #digitalnomad";

    this.twitterAPI.post('statuses/update', {status: tweetMessage}, function (err, data, response) {
     console.log(data);
     if (err)
       console.log(err);
    });
  },

  twitterAPI: new Twit({
    consumer_key: 'kqAQtrale59wg7ymyppxnNQYY',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: '3244714110-yatEahozepvmYNPIp7ODzjzS2MCYeG57D0QC6q1',
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })
};
