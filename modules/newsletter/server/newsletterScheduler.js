newsletterScheduler = {
  schedule: function (campaign) {
    var mailchimpCampaign = this.createCampaign(campaign);

    var scheduleOptions = {
      cid: mailchimpCampaign.id,
      schedule_time: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
    };

    console.log('Scheduling campaign...');
    var schedule = this.mailchimpAPI().call('campaigns', 'schedule', scheduleOptions, function (err, res) {
      if (err) {
        console.log('Error while scheduling campaign : ' + err);
      } else {
        console.log('Successfully scheduled the campaign: ' + res);
      }
    });
  },

  createCampaign: function (campaign) {
    var campaignOptions = {
      type: 'regular',
      options: {
        list_id: Meteor.settings.mailchimpListId,
        subject: campaign.subject,
        from_email: 'hello@airstrip.io',
        from_name: 'airstrip.io'
      },
      content: {
        html: campaign.html,
        text: campaign.text
      }
    };

    console.log('Creating campaign...');
    var newCampaign = this.mailchimpAPI().call('campaigns', 'create', campaignOptions, function (err, res) {
      if (err) {
        console.error('Error while scheduling campaign : ' + err);
      } else {
        console.log('Created the campaign');
        console.log(res);
      }
    });

    return newCampaign;
  },

  mailchimpAPI: function () {
    return new MailChimp(Meteor.settings.mailchimpAPIKey);
  }
};

Meteor.methods({
  scheduleDailyDigest: function () {
    var latestFlight = Flights.findOne({}, {sort: {date: -1}, limit: 1});

    var campaign = campaignFactory.build(latestFlight);
    newsletterScheduler.schedule(campaign);
  }
});
