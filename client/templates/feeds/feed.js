Template.feed.helpers({
  sourceBadgeUrl: function () {
    if (this.source === 'nomadstory' || this.source === 'nomadforum') {
      return 'images/nomadlist-badge.png'
    } else if (this.source === 'reddit') {
      return 'images/reddit-badge.png'
    } else if (this.source === 'blog') {
      return 'images/blog-badge.png'
    }
  },

  hostUrl: function () {
    var fullUrl = document.createElement('a');
    fullUrl.href = this.url;

    return fullUrl.hostname
  }
});
