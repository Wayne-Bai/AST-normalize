var parser = require('../../src/parser'),
	tokenizer = require('../../src/tokenizer'),
	a = require('../parser-mocks'),
	util = require("../../src/util"),
	slice = require('std/slice')

test('text literal')
	.code('"hello world"')
	.expect(a.literal("hello world"))

test('number literal')
	.code('1')
	.expect(a.literal(1))

test('declaration')
	.code('greeting = "hello"')
	.expect(a.declaration('greeting', a.literal("hello")))

test('alias single namespace')
	.code('greeting')
	.expect(a.reference('greeting'))

test('alias double namespace')
	.code('user.name')
	.expect(a.dereference(a.reference('user'), 'name'))

test('parenthesized expression')
	.code('(1)')
	.expect(a.literal(1))

test('double parenthesized expression')
	.code('(("hello"))')
	.expect(a.literal("hello"))

test('addition')
	.code('1+1')
	.expect(a.binaryOp(a.literal(1), '+', a.literal(1)))

test('parenthesized subtraction')
	.code('(((1-1)))')
	.expect(a.binaryOp(a.literal(1), '-', a.literal(1)))

test('simple if statement')
	.code('if 1 is < 2 { 1 }')
	.expect(a.ifElse(a.binaryOp(a.literal(1), '<', a.literal(2)), a.literal(1)))

test('has no null statements or expressions')
	.code('foo="bar"\n1')
	.expect(a.declaration("foo",a.literal("bar")), a.literal(1))

test('variable declaration')
	.code('foo = "bar"')
	.expect(a.declaration('foo', a.literal('bar')))

test('parses empty program')
	.code('')
	.expect()

test('* operator precedence 1')
	.code('1 + 2 * 3')
	.expect(a.binaryOp(a.literal(1), '+', a.binaryOp(a.literal(2), '*', a.literal(3))))

test('* operator precedence 2')
	.code('1 * 2 + 3')
	.expect(a.binaryOp(a.binaryOp(a.literal(1), '*', a.literal(2)), '+', a.literal(3)))

test('triple nested operators')
	.code('1 + 2 + 3 + 4')
	.expect(a.binaryOp(a.literal(1), '+', a.binaryOp(a.literal(2), '+', a.binaryOp(a.literal(3), '+', a.literal(4)))))

test('list literal')
	.code('["foo", 1, null]')
	.expect(a.literal(['foo', 1, null]))

test('empty for loop over list literal')
	.code('for iterator in [1,2,3] {}')
	.expect(a.forLoop('iterator', a.literal([1,2,3]), []))

test('self-closing xml')
	.code('<div />')
	.expect(a.xml('div'))

test('inline javascript')
	.code('foo = 1\n <script fooVariable=foo> var i = 1; function a() { alert(i++) }; setInterval(a); </script>')
	.expect(
		a.declaration('foo', a.literal(1)),
		a.inlineScript({ fooVariable:a.reference('foo') }, ' var i = 1; function a() { alert(i++) }; setInterval(a);')
	)

test('nested declaration')
	.code(
		'foo = { nested: { cat:"yay" } }',
		'foo bar foo.nested'
	)
	.expect(
		a.declaration('foo', a.literal({ nested:{ cat:'yay' } })),
		a.reference('foo'), a.reference('bar'), a.dereference(a.reference('foo'), 'nested')
	)

test('deep nested declaration')
	.code('asd = {a:{b:{c:{d:{e:{f:{}}}}}}}')
	.expect(a.declaration('asd', a.literal({a:{b:{c:{d:{e:{f:{}}}}}}})))

test('just a declaration')
	.code('foo = { bar:1 }')
	.expect(a.declaration('foo', a.literal({ bar:1 })))

test('a handler')
	.code(
		'aHandler = handler(){}'
	)
	.expect(
		a.declaration('aHandler', a.handler())
	)

test('a button which mutates state')
	.code(
		'foo="bar"',
		'<button></button onclick=handler(){ foo set: "cat" }>'
	)
	.expect(
		a.declaration('foo', a.literal("bar")),
		a.xml('button', { 'onclick':a.handler([],[
			a.mutation(a.reference('foo'), 'set', [a.literal("cat")])
		])})
	)

test('handler with logic')
	.code(
		'cat = "hi"',
		'foo = handler() {',
		'	if cat is == "hi" { cat set: "bye" }',
		'	else { cat set: foo }',
		'}'
	)
	.expect(
		a.declaration('cat', a.literal('hi')),
		a.declaration('foo', a.handler([], [
			a.ifElse(a.binaryOp(a.reference('cat'), '==', a.literal('hi')),[
				a.mutation(a.reference('cat'), 'set', [a.literal('bye')])
			], [
				a.mutation(a.reference('cat'), 'set', [a.reference('foo')])
			])
		]))
	)

test('parse emits then declarations')
	.code(
		'foo="foo"',
		'<div></div>',
		'cat="cat"'
	)
	.expect(
		a.declaration('foo', a.literal('foo')),
		a.xml('div'),
		a.declaration('cat', a.literal('cat'))
	)

test('variable declaration inside div')
	.code('<div>cat="cat"</div>')
	.expect(a.xml('div', null, [a.declaration('cat', a.literal('cat'))]))

test('null value')
	.code('null')
	.expect(a.null())

test('function arguments')
	.code('fun = function(arg1, arg2) { return arg1 + arg2 }', 'fun(1, 2)')
	.expect(
		a.declaration('fun', a.function([a.argument('arg1'), a.argument('arg2')], [
			a.return(
				a.binaryOp(a.reference('arg1'), '+', a.reference('arg2'))
			)
		])),
		a.invocation(a.reference('fun'), a.literal(1), a.literal(2))
	)

test('if/else in a div')
	.code(
		'<div> if Mouse.x is >= 100 { "mouse.x is >= 100" }',
		'else { "mouse.x is < 100" }</div>')
	.expect(
		a.xml('div', null, [
			a.ifElse(a.binaryOp(a.dereference(a.reference('Mouse'), 'x'), '>=', a.literal(100)), [
				a.literal('mouse.x is >= 100')
			], [
				a.literal('mouse.x is < 100')
			])
		])
	)

test('script tag in function parses')
	.code(
		'foo = function(qwe) {',
		'	<script missing=missing>',
		'	</script>',
		'	return 1',
		'}')
	.expect(
		a.declaration('foo', a.function(['qwe'], [
			a.inlineScript({ missing:'missing' }),
			a.return(a.literal(1))
		]))
	)

test('for loop over object literal')
	.code('for foo in { bar:"bar", cat:"cat" } {}')
	.expect(
		a.forLoop('foo', a.literal({ bar:'bar', cat:'cat' }), [])
	)

test('double declaration')
	.code(
		'foo = 1',
		'bar = 2'
	).expect(a.declaration('foo', a.literal(1)), a.declaration('bar', a.literal(2)))

test('if, else if, else')
	.code(
		'if (false) { "qwe" }',
		'else if (true) { "foo" }',
		'else { "cat" }'
	).expect(
		a.ifElse(a.literal(false), a.literal("qwe"), a.ifElse(a.literal(true), a.literal("foo"), a.literal("cat")))
	)

test('literals and xml with and without semicolons')
	.code(
		'[1 2 3, 4, "qwe"]',
		'{ foo:"bar" cat:2, qwe:"qwe" }',
		'foo(1 2, 3 "qwe")',
		'<div foo="bar" cat=1, qwe="qwe" />'
	).expect(
		a.literal([1, 2, 3, 4, 'qwe']),
		a.literal({ foo:'bar', cat:2, qwe:'qwe' }),
		a.invocation(a.reference('foo'), a.literal(1), a.literal(2), a.literal(3), a.literal('qwe')),
		a.xml('div', { foo:a.literal("bar"), cat:a.literal(1), qwe:a.literal('qwe') })
	)

test('dictionary literals and xml can use both = and : for key/value pairs')
	.code(
		'{ foo:1 bar=2, cat:3 }',
		'<div foo:1 bar=2 />'
	).expect(
		a.literal({ foo:1, bar:2, cat:3 }),
		a.xml('div', { foo:a.literal(1), bar:a.literal(2) })
	)

test('discern between invocation and parenthesized expression')
	.code('foo(1) foo (1)')
	.expect(a.invocation(a.reference('foo'), a.literal(1)), a.reference('foo'), a.literal(1))

test('xml hash-expand attribute')
	.code('<div #{ class:"cool" } />')
	.expect(a.xml('div', [{ expand:a.literal({ 'class':'cool' }) }]))

test('simple import')
	.code('import foo')
	.expect(a.import('foo'))

test('path import')
	.code('import foo/bar/cat')
	.expect(a.import('foo/bar/cat'))

test('climb dir')
	.code('import ../../foo')
	.expect(a.import('../../foo'))

test('absolute import')
	.code('import /foo/bar')
	.expect(a.import('/foo/bar'))

test('double dereference')
	.code('foo.bar.cat')
	.expect(a.reference('foo.bar.cat'))

test('dynamic dereference with static value')
	.code('foo["bar"] foo.bar')
	.expect(a.reference('foo.bar'), a.reference('foo.bar'))

test('dynamic dereference')
	.code('foo[bar] cat[qwe.tag()]')
	.expect(a.dereference(a.reference('foo'), a.reference('bar')), a.dereference(a.reference('cat'), a.invocation(a.dereference(a.reference('qwe'), 'tag'))))

test('foo = (1) + (1)')
	.code('foo = (1) + (1)')
	.expect(a.declaration('foo', a.binaryOp(a.literal(1), '+', a.literal(1))))

/* Util
 ******/
function test(name) {
	util.resetUniqueID()
	var input
	return {
		code: function() {
			util.resetUniqueID()
			input = slice(arguments).join('\n')
			return this
		},
		expect: function() {
			var expected = slice(arguments),
				tokens = tokenizer.tokenize(input)
			module.exports['parse\t\t"'+name+'"'] = function(assert) {
				util.resetUniqueID()
				try { var output = parser.parse(tokens) }
				catch(e) { console.log("Parser threw"); throw e; }
				assert.deepEqual(expected, output)
				assert.done()
			}
			return this
		}
	}
}

/* Old, typed tests
 ******************/
// test('interface declarations')
// 	.code(
// 		'Thing = { foo:Text, bar:Number }',
// 		'ListOfThings=[ Thing ]',
// 		'ListOfNumbers = [Number]',
// 		'NumberInterface = Number'
// 	)
// 	.expect(
// 		a.declaration('Thing', a.interface({ foo:a.Text, bar:a.Number })),
// 		a.declaration('ListOfThings', a.interface([a.alias('Thing')])),
// 		a.declaration('ListOfNumbers', a.interface([a.Number])),
// 		a.declaration('NumberInterface', a.Number)
// 	)
// 
// test('typed value declarations')
// 	.code(
// 		'Response = { error:Text, result:Text }',
// 		'Response response = { error:"foo", result:"bar" }',
// 		'response'
// 	)
// 	.expect(
// 		a.declaration('Response', a.interface({ error:a.Text, result:a.Text })),
// 		a.declaration('response', a.object({ error:a.literal('foo'), result:a.literal('bar') }), a.alias('Response')),
// 		a.alias('response')
// 	)
// 
// test('typed function declaration and invocation')
// 	.code(
// 		'Response = { error:Text, result:Text }',
// 		'Response post = function(Text path, Anything params) {',
// 		'	return { error:"foo", response:"bar" }',
// 		'}',
// 		'response = post("/test", { foo:"bar" })'
// 	)
// 	.expect(
// 		a.declaration('Response', a.interface({ error:a.Text, result:a.Text })),
// 		a.declaration('post', a.function([a.argument('path', a.Text), a.argument('params', a.Anything)], [
// 			a.return(a.object({ error:a.literal('foo'), response:a.literal('bar') }))
// 		]), a.alias('Response')),
// 		a.declaration('response', a.invocation(a.alias('post'), a.literal('/test'), a.object({ foo:a.literal('bar')})))
// 	)
// 
// test('explicit interface declarations')
// 	.code(
// 		'Thing = { foo:Text, bar:Number }',
// 		'Thing thing = null',
// 		'thing'
// 	)
// 	.expect(
// 		a.declaration('Thing', a.interface({ foo:a.Text, bar:a.Number })),
// 		a.declaration('thing', a.null, a.alias('Thing')),
// 		a.alias('thing')
// 	)
// 
// test('type-inferred function invocation')
// 	.code(
// 		'Response = { error:Text, result:Text }',
// 		'post = function(Text path, Anything params) {',
// 		'	return { error:"foo", response:"bar" }',
// 		'}',
// 		'response = post("/test", { foo:"bar" })'
// 	)
// 	.expect(
// 		a.declaration('Response', a.interface({ error:a.Text, result:a.Text })),
// 		a.declaration('post', a.function([a.argument('path', a.Text), a.argument('params', a.Anything)], [
// 			a.return(a.object({ error:a.literal('foo'), response:a.literal('bar') }))
// 		])),
// 		a.declaration('response', a.invocation(a.alias('post'), a.literal('/test'), a.object({ foo:a.literal('bar')})))
// 	)
// 
// Thing = { num:Number, foo:{ bar:[Text] }}
// Number five = 5
// Thing thing = { num:five, foo:{ bar:"cat" }}
// { num:Number, foo:{ bar:Text } } thing = { num:five, foo:{ bar:"cat" }}
// fun = function(Thing thing, { num:Number, foo:Text } alt) { ... }
// Response post = function(path, params) { return XHR.post(path, params) }
// response = post('/path', { foo:'bar' })
// assert response.type == Response
// tar = XHR.post("/test", { foo:'bar' })
// Response tar = XHR.post("/test", { foo:'bar' })
// { error:String, result:String } tar = XHR.post("/test", { foo:'bar' })
