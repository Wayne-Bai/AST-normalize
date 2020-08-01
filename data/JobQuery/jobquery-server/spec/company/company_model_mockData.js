module.exports = exports = data = {};

data.valid = {
  name:             'Upstart',
  tagline: 'Crowdfunded loans',
  description:  'You are more than your credit score. Upstart ' +
    'considers your education and experience to give you the rate ' +
    'you deserve.',
  address:          'P.O. Box 61203',
  city:             'Palo Alto',
  state:            'CA',
  country:          'US',
  media:
    [
      {
        caption: 'browse loans',
        url: 'https://www.upstart.com/assets/invest/browse_loans-ff2a8b457e3bd8118d804f5874ba29e4.png'
      },
      {
        caption: 'borrow money',
        url: 'https://www.upstart.com/assets/borrow_loan/education_jobs_form-6d5db9c3853fd19198d67785d2d145dd.png'
      }
    ],
  links:
    [
      {
        title: 'generalist developer',
        url: 'https://www.upstart.com/jobs#career-listing-1'
      },
      {
        title: 'jobs',
        url: 'https://www.upstart.com/jobs'
      }
    ]
};

data.minimum = {
  name:           'Upstart'
};

data.minimum2 = {
  name:           'Google'
};

data.missing = {};

data.missing.name = {
  tagline: 'Crowdfunded loans',
  description:  'You are more than your credit score. Upstart ' +
    'considers your education and experience to give you the rate ' +
    'you deserve.',
  address:          'P.O. Box 61203',
  city:             'Palo Alto',
  state:            'CA',
  country:          'US'
};

data.invalid = {};

data.invalid.mediaCaption = {
  name:           'Upstart',
  media:
    [
      {
        title: 'browse loans',
        url: 'https://www.upstart.com/assets/invest/browse_loans-ff2a8b457e3bd8118d804f5874ba29e4.png'
      },
      {
        caption: 'borrow money',
        url: 'https://www.upstart.com/assets/borrow_loan/education_jobs_form-6d5db9c3853fd19198d67785d2d145dd.png'
      }
    ]
};

data.invalid.mediaUrl = {
  name:           'Upstart',
  media:
    [
      {
        caption: 'browse loans',
        url: 'https://www.upstart.com/assets/invest/browse_loans-ff2a8b457e3bd8118d804f5874ba29e4.png'
      },
      {
        caption: 'borrow money',
        uri: 'https://www.upstart.com/assets/borrow_loan/education_jobs_form-6d5db9c3853fd19198d67785d2d145dd.png'
      }
    ]
};

data.invalid.mediaUrl = {
  name:           'Upstart',
  media:
    [
      {
        caption: 'browse loans',
        url: 'https://www.upstart.com/assets/invest/browse_loans-ff2a8b457e3bd8118d804f5874ba29e4.png'
      },
      {
        caption: 'borrow money',
        uri: 'https://www.upstart.com/assets/borrow_loan/education_jobs_form-6d5db9c3853fd19198d67785d2d145dd.png'
      }
    ]
};

data.invalid.linksTitle = {
  name:           'Upstart',
  links:
    [
      {
        link: 'generalist developer',
        url: 'https://www.upstart.com/jobs#career-listing-1'
      },
      {
        title: 'jobs',
        url: 'https://www.upstart.com/jobs'
      }
    ]
};

data.invalid.linksUrl = {
  name:           'Upstart',
  links:
    [
      {
        title: 'generalist developer',
        url: 'https://www.upstart.com/jobs#career-listing-1'
      },
      {
        title: 'jobs',
        website: 'https://www.upstart.com/jobs'
      }
    ]
};
