module.exports = {
  bower: {
    options: {
      file: 'bower.json',
      commitMessage: 'update bower authors',
      filter: function(contributors) {
        contributors.unshift({name: 'Jimdo GmbH'});
        return contributors;
      },
      as: 'authors'
    }
  },
  contributors: {
    options: {
      commit: false,
      filter: function(contributors) {
        return contributors.filter(function(contributor) {
          return contributor.commitCount < 70;
        });
      }
    }
  },
  maintainers: {
    options: {
      filter: function(contributors) {
        return contributors.filter(function(contributor) {
          return contributor.commitCount >= 70;
        });
      },
      as: 'maintainers'
    }
  }
};
