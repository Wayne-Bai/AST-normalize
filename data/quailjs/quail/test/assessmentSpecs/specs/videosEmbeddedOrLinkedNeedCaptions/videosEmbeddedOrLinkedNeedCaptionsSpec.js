describe('assessment: videosEmbeddedOrLinkedNeedCaptions', function () {
  var client, assessments, quailResults, cases;

  // Evaluate the test page with Quail.
  before('load webdrivers and run evaluations with Quail', function () {
    return quailTestRunner.setup({
        url: 'http://localhost:9999/videosEmbeddedOrLinkedNeedCaptions/videosEmbeddedOrLinkedNeedCaptions.html',
        assessments: [
          'videosEmbeddedOrLinkedNeedCaptions'
        ]
      })
      .spread(function (_client_, _assessments_, _quailResults_) {
        client = _client_;
        assessments = _assessments_;
        quailResults = _quailResults_;
      });
  });

  after('end the webdriver session', function () {
    return quailTestRunner.teardown(client);
  });

  it('should return the correct number of tests', function () {
    expect(quailResults.stats.tests).to.equal(1);
  });
  it('should return the correct number of cases', function () {
    expect(quailResults.stats.cases).to.equal(0);
  });

  it('should have correct key under the test results', function () {
    expect(quailResults.tests).to.include.keys('videosEmbeddedOrLinkedNeedCaptions');
  });

  it('should return the proper assessment for assert-1', function () {
    cases = quailResults.tests.videosEmbeddedOrLinkedNeedCaptions.cases;
    expect(cases).quailGetById('assert-1').to.have.quailStatus('passed');
  });
});
