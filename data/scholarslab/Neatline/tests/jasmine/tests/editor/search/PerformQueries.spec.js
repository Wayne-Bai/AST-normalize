
/**
 * @package     omeka
 * @subpackage  neatline
 * @copyright   2014 Rector and Board of Visitors, University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

describe('Search | Perform Queries', function() {


  var perPage, fixtures = {
    records: read('EditorSearchPerformQueries.json')
  };


  beforeEach(function() {
    NL.loadEditor();
    perPage = Neatline.g.neatline.per_page;
  });


  it('should bold the input when a tags query is entered', function() {

    // ------------------------------------------------------------------------
    // When a query that starts with `tags:` is entered, the input should be
    // bolded to indicate that the tags string is being parsed.
    // ------------------------------------------------------------------------

    // Keyup with tag string in the box.
    NL.v.search.__ui.search.val('tags: tag1, tag2').trigger('keyup');

    // Input should be bold.
    expect(NL.v.search.__ui.search).toHaveClass('bold');

  });


  it('should bold the input when map mirroring is enabled', function() {

    // ------------------------------------------------------------------------
    // When `map:` is entered, the input should be bolded to indicate that the
    // map mirroring has been activated.
    // ------------------------------------------------------------------------

    // Keyup with `map:` in the box.
    NL.v.search.__ui.search.val('map:').trigger('keyup');

    // Input should be bold.
    expect(NL.v.search.__ui.search).toHaveClass('bold');

  });


  it('should unbold the input for keyword or empty query', function() {

    // ------------------------------------------------------------------------
    // When the input has been bolded in response to a structured query (tags
    // or map mirroring) and then the recognized pattern is broken, the input
    // should be un-bolded.
    // ------------------------------------------------------------------------

    // Structured query -> keyword query.
    NL.v.search.__ui.search.val('tags:').trigger('keyup');
    NL.v.search.__ui.search.val('').trigger('keyup');

    // Input should not be bold.
    expect(NL.v.search.__ui.search).not.toHaveClass('bold');

    // Structured query -> empty query.
    NL.v.search.__ui.search.val('tags:').trigger('keyup');
    NL.v.search.__ui.search.val('').trigger('keyup');

    // Input should not be bold.
    expect(NL.v.search.__ui.search).not.toHaveClass('bold');

  });


  it('should execute keyword search on keyup', function() {

    // ------------------------------------------------------------------------
    // When a character is typed in the search box and the query value is a
    // regular keyword query, a GET request should be generated and the record
    // list should updated with the results.
    // ------------------------------------------------------------------------

    // Keyup with 'keyword' in the box.
    NL.v.search.__ui.search.val('word1 word2').trigger('keyup');

    // Should produce GET request to /records.
    NL.assertLastRequestRoute(Neatline.g.neatline.record_api);
    NL.assertLastRequestMethod('GET');

    // `query`=word, default `limit` and `start`.
    NL.assertLastRequestHasGetParameter('query', 'word1 word2');
    NL.assertLastRequestHasGetParameter('limit', perPage);
    NL.assertLastRequestHasGetParameter('start', '0');

    // Inject a new records collection.
    NL.respondLast200(fixtures.records);
    var rows = NL.getRecordListRows();

    // Record list should be updated.
    expect($(rows[0]).find('.title')).toHaveText('result1');
    expect($(rows[1]).find('.title')).toHaveText('result2');
    expect($(rows[2]).find('.title')).toHaveText('result3');

  });


  it('should execute tags search on keyup', function() {

    // ------------------------------------------------------------------------
    // When a character is typed in the search box and the query value is a
    // tag string, a GET request should be issued and the record list should
    // update with the results.
    // ------------------------------------------------------------------------

    // Keyup with tag string in the box.
    NL.v.search.__ui.search.val('tags: tag1, tag2').trigger('keyup');

    // Should produce GET request to /records.
    NL.assertLastRequestRoute(Neatline.g.neatline.record_api);
    NL.assertLastRequestMethod('GET');

    // `tags[]`=tag1, `tags[]`=tag2.
    var request = NL.getLastRequest();
    expect(request.url).toContain($.param({tags: ['tag1', 'tag2']}));

    // Default `limit` and `start`.
    NL.assertLastRequestHasGetParameter('limit', perPage);
    NL.assertLastRequestHasGetParameter('start', '0');

    // Inject a new records collection.
    NL.respondLast200(fixtures.records);
    var rows = NL.getRecordListRows();

    // Record list should be updated.
    expect($(rows[0]).find('.title')).toHaveText('result1');
    expect($(rows[1]).find('.title')).toHaveText('result2');
    expect($(rows[2]).find('.title')).toHaveText('result3');

  });


  describe('should update the route on keystroke', function() {

    // ------------------------------------------------------------------------
    // When the search query is changed, the route should be updated in real-
    // time to match the current query value.
    // ------------------------------------------------------------------------

    it('one word', function() {
      NL.v.search.__ui.search.val('word1').trigger('keyup');
      NL.assertRoute('browse/query=word1');
    });

    it('multiple words', function() {

      NL.v.search.__ui.search.val('word1 word2 word3').trigger('keyup');

      // Spaces replaced with `+`.
      NL.assertRoute('browse/query=word1+word2+word3');

    });

    it('empty query', function() {

      NL.v.search.__ui.search.val('').trigger('keyup');

      // Search parameters stripped away.
      NL.assertRoute('browse');

    });

  });


});
