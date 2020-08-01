new TWTR.Widget({
  version: 2,
  type: 'search',
  search: 'thisiscrap',
  interval: 1000,
  title: 'What they say about our product',
  subject: '',
  width: 200,
  height: 300,
  theme: {
    shell: {
      background: '#8ec1da',
      color: '#ffffff'
    },
    tweets: {
      background: '#ffffff',
      color: '#444444',
      links: '#1985b5'
    }
  },
  features: {
    scrollbar: false,
    loop: true,
    live: true,
    behavior: 'default'
  }
}).render().start();