describe('Tags', function() {
  var Tags,tags

  beforeEach(inject(function(_Tags_){
    Tags = _Tags_
    tags = new Tags()
  }))
  

  it('adds a tag', function() {
    tags.add('tag1')
    expect( tags.get() ).toEqual(['tag1'])
  })

  it('limits the tags length to 20 characters', function() {
    expect( tags.add(new Array(20).join('a')) ).toEqual(1)    
    expect( tags.add(new Array(21).join('a')) ).toBeUndefined()    
  })

  it('adds maximally 5 tags', function() {
    tags.add('tag1')
    tags.add('tag2')
    tags.add('tag3')
    tags.add('tag4')
    tags.add('tag5')
    expect( tags.add('tag6') ).toBeUndefined()
    expect( tags.get() ).toEqual(['tag1','tag2','tag3','tag4','tag5'])
  })

  it('refuses to add duplicate tags', function() {
    tags.add('tag1')
    expect( tags.add('tag1') ).toBeUndefined()
    expect( tags.get() ).toEqual(['tag1'])
  })

  it('removes a tag by its name', function() {
    tags.add('tag1')
    tags.add('tag2')
    expect( tags.remove('tag1') ).toEqual( ['tag1'] )
    expect( tags.get() ).toEqual(['tag2'])
  })

  it('returns true if tag exists', function() {
    tags.add('tag1')
    expect( tags.has('tag1') ).toBeTruthy()
  })

  it('returns an Array when passed JSON.stringify', function() {
    tags.add('tag1')
    tags.add('tag2')
    expect( JSON.stringify(tags) ).toEqual( '["tag1","tag2"]' )
  })

  it('restores tags passed', function() {
    tags = new Tags(['tag1','tag2'])
    expect( tags.get() ).toEqual(["tag1","tag2"])
  })

})