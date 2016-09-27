# Functional-Light JavaScript
# Chapter 7: List Operations

> If you can do something awesome, keep doing it repeatedly.

We've already seen several brief references earlier in the text to some utilities that we now want to take a very close look at, namely `map(..)`, `filter(..)`, and `reduce(..)`. In JavaScript, these utilities are typically used as methods on the array (aka, "list") prototype, so we would naturally refer to them as array or list operations.

Before we talk about the specific array methods, we want to examine conceptually what these operations are used for. It's equally important in this chapter that you understand *why* list operations are important as it is to understand *how* list operations work. Make sure you approach this chapter with that detail in mind.

The vast majority of common illustrations of these operations, both outside of this book and here in this chapter, depict trivial tasks performed on lists of values (like doubling each number in an array); it's a cheap and easy way to get the point across.

But don't just gloss over these simple examples and miss the deeper point. Some of the most important FP value in understanding list operations comes from being able to model a sequence of tasks -- a series of statements that wouldn't otherwise *look* like a list -- as a list operation instead of performing them individually.

This isn't just a trick to write more terse code. What we're after is to move from imperative to declarative style, to make the code patterns more readily recognizable and thus more readable.

# Map

// TODO

map: perform an operation across multiple values

map: transformation for each value

map: projection from one list to another

map: adapt a function from a single value to a data structure it doesn't know how to handle (map array, map tree, etc)

map: event handler for each value

# Filter

Imagine I bring an empty basket with me to the grocery store, and I visit the fruit section. There's a big display of fruit (apples, oranges, and bananas). I'm really hungry so I want to get as much fruit as they have available, but I really only prefer the round fruits (apples and oranges). So I sift through each fruit one-by-one, and I end up with my basket full of just the apples and oranges.

Let's say we call this process *filtering*. Would you more naturally describe my action as starting with an empty basket and **filtering in** (selecting, including) only the apples and oranges, or starting with the full display of fruits and **filtering out** (skipping, excluding) the bananas as my basket is filled with fruit?

Depending on your perspective, filter is either exclusionary or inclusionary. This conceptual mish-mash is unfortunate.

## Reduce

Reduce is a combination operation. Reduce is the swiss army knife of FP.

### Map As Reduce

// TODO

### Filter As Reduce

// TODO

## Advanced List Operations

Now that we feel comfortable with the foundational list operations `map(..)`, `filter(..)`, and `reduce(..)`, let's look at a few more-sophisticated operations you may find useful in various situations. These are all utilities you'll find in various FP libraries.

### Flatten

From time to time, you may have (or produce through some other operations) an array that's not just a flat list of values, but with nested arrays, such as:

```js
[ [1, 2, 3], 4, 5, [6, [7, 8]] ]
```

What if you'd like to transform it into:

```js
[ 1, 2, 3, 4, 5, 6, 7, 8 ]
```

The operation we're looking for is typically called `flatten(..)`, and it could be implemented like this using our swiss army knife `reduce(..)`:

```js
function flatten(arr) {
	return arr.reduce( function reducer(list,v){
		return list.concat( Array.isArray( v ) ? flatten( v ) : v );
	}, [] );
}

// or the ES6 => form
var flatten =
	arr =>
		arr.reduce(
			(list,v) =>
				list.concat( Array.isArray( v ) ? flatten( v ) : v )
		, [] );
```

To use it with an array of arrays (of any nested depth):

```js
flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]] );
// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
```

// TODO: `merge(..)`, `zip(..)`, etc

## Method vs. Standalone

A common source of frustration for FPers in JavaScript is unifying their strategy for working with utilities when some of them are provided as standalone functions -- think about the various FP utilities we've derived in previous chapters -- and others are methods of the array prototype -- like the ones we've seen in this chapter.

The pain of this problem becomes more evident when you consider combining multiple operations:

```js
[1,2,3,4,5]
.filter( isOdd )
.map( double )
.reduce( sum, 0 );					// 18

// vs.

reduce(
	map(
		filter( [1,2,3,4,5], isOdd ),
		double
	),
	sum,
	0
);									// 18
```

Both API styles accomplish the same task, but they have very different ergonomics. Many FPers will prefer the latter to the former, but the former is unquestionably more common in JavaScript. One thing specifically that's disliked about the latter is the nesting of the calls. The preference for the method chain style -- typically called a fluent API style, as in jQuery and other tools -- is that it's compact/concise and it reads in declarative top-down order.

The visual order for that manual composition of the standalone style is neither strictly left-to-right (top-to-bottom) nor right-to-left (bottom-to-top); it's inner-to-outer, which harms the readability.

Automatic composition normalizes the reading order as right-to-left (bottom-to-top) for both styles. So, to explore the implications of the form differences, let's examine composition specifically; it seems like it should be straightforward, but it's a little awkward in both cases.

### Composing Method Chains

The array methods receive the implicit `this` argument, so despite their appearance, they can't be treated as unary; that makes composition more awkward. To cope, we'll first need a `this`-aware version of `partial(..)`:

```js
function partialThis(fn,...presetArgs) {
	return function partiallyApplied(...laterArgs){
		return fn.apply( this, [...presetArgs, ...laterArgs] );
	};
}

// or the ES6 => form
var partialThis =
	(fn,...presetArgs) =>
		function partiallyApplied(...laterArgs){
			return fn.apply( this, [...presetArgs, ...laterArgs] );
		};
```

We'll also need a version of `compose(..)` that calls each of the partially applied methods in the context of the chain -- the input value it's being "passed" (via implicit `this`) from the previous step:

```js
function composeChainedMethods(...fns) {
	return function composed(result){
		return fns.reduceRight( function reducer(result,fn){
			return fn.call( result );
		}, result );
	};
}

// or the ES6 => form
var composeChainedMethods =
	(...fns) =>
		result =>
			fns.reduceRight(
				(result,fn) =>
					fn.call( result )
				, result
			);
```

And using these two `this`-aware utilities together:

```js
composeChainedMethods(
   partialThis( [].reduce, sum, 0 ),
   partialThis( [].map, double ),
   partialThis( [].filter, isOdd )
)
( [1,2,3,4,5] );					// 18
```

**Note:** The three `[].XYZ`-style references are grabbing references to the generic `Array.prototype.*` methods without repeating `Array.prototype` each time; this is done by creating a throwaway `[]` empty array value to access a method reference. This is just a shorthand cheat for shorter code.

### Composing Standalone Utilities

Standalone `compose(..)`-style composition of these utilities doesn't need all the `this` contortions, which is its most favorable argument.

But standalone style suffers from its own awkwardness; the cascading array context is the first argument rather than the last, so we have to use right-partial application:

```js
compose(
	partialRight( reduce, sum, 0 )
	partialRight( map, double )
	partialRight( filter, isOdd )
)
( [1,2,3,4,5] );					// 18
```

However, if `filter(..)`, `map(..)`, and `reduce(..)` are alternately defined to receive the array last instead of first, and are curried, the composition flows a bit nicer:

```js
compose(
	reduce( sum )( 0 ),
	map( double ),
	filter( isOdd )
)
( [1,2,3,4,5] );					// 18
```

The cleanliness of this approach is in part why FPers prefer the standalone utility style instead of instance methods. But your mileage may vary.

### Adapting Methods To Standalones

If you prefer to work with only standalone utilities, you can straightforwardly define standalone adaptations of the array methods.

```js
function filter(arr,predicateFn) {
	return arr.filter( predicateFn );
}

function map(arr,mapperFn) {
	return arr.map( mapperFn );
}

function reduce(arr,reducerFn,initialValue) {
	return arr.reduce( reducerFn, initialValue );
}
```

You might have spotted the common pattern across these three; can we generate these standalone adaptations with a utility? Yes. While we're at it, let's swap the `arr` argument to the right and `curry(..)` the generated function, to make composition easier:

```js
function unmethodify(methodName,argCount) {
	return curry( function standalone(...args){
		var arr = args.pop();
		return arr[methodName]( ...args );
	}, argCount );
}

// or the ES6 => form
var unmethodify =
	(methodName,argCount) =>
		curry(
			(...args) => {
				var arr = args.pop();
				return arr[methodName]( ...args );
			}
			, argCount
		);
```

And to use this utility:

```js
var filter = unmethodify( "filter" );
var map = unmethodify( "map" );
var reduce = unmethodify( "reduce" );

compose(
	reduce( sum )( 0 ),
	map( double ),
	filter( isOdd )
)
( [1,2,3,4,5] );					// 18
```

### Adapting Standalones To Methods

If you prefer to work with only array methods, you have two choices. You can:

1. Extend the built-in `Array.prototype` with additional methods.
2. Adapt the standalone utility to work as a reducer function and pass it to the `reduce(..)` instance method.

**Don't do (1).** It's never a good idea to extend built-in natives like `Array.prototype` -- unless you define a subclass of `Array`, but that's beyond our discussion scope here. In an effort to discourage bad practices, we won't go any further into this approach.

Let's **focus on (2)** instead. Recall the `flatten(..)` standalone utility we defined earlier:

```js
function flatten(arr) {
	return arr.reduce( function reducer(list,v){
		return list.concat( Array.isArray( v ) ? flatten( v ) : v );
	}, [] );
}
```

Let's pull out the inner `reducer(..)` function as the standalone utility (and adapt it to work without the outer `flatten(..)`):

```js
function flattenReducer(list,v) {
	return list.concat(
		Array.isArray( v ) ? v.reduce( flattenReducer, [] ) : v
	);
}
```

Now, we can use this utility in a method chain via `reduce(..)`:

```js
[ [1, 2, 3], 4, 5, [6, [7, 8]] ]
.reduce( flattenReducer, [] )
// ..
```

## Looking For Lists

So far, most of the examples have been rather trivial, based on simple lists of numbers or strings. Let's now talk about where list operations can start to shine: modeling an imperative series of statements with declarative list operations.

Let's first consider this base example:

```js
var getSessionId = partial( prop, "sessId" );
var getUserId = partial( prop, "uId" );

var session, sessionId, user, userId, orders;

session = getCurrentSession();
if (session != null) sessionId = getSessionId( sessionId );
if (sessionId != null) user = lookupUser( sessionId );
if (user != null) userId = getUserId( user );
if (userId != null) orders = lookupOrders( userId );
if (orders != null) processOrders( orders );
```

First, let's observe that the five variable declarations and the running series of `if` conditionals guarding the function calls are effectively one big composition of these six calls `getCurrentSession()`, `getSessionId(..)`, `lookupUser(..)`, `getUserId(..)`, `lookupOrders(..)`, and `processOrders(..)`. Ideally, we'd like to get rid of all these variable declarations and imperative conditionals.

Unfortunately, the `compose(..)` / `pipe(..)` utilties we explored in Chapter 4 don't by themselves offer a convenient way to express the `!= null` conditionals in the composition. Let's define a utility to help:

```js
var guard =
	fn =>
		arg =>
			arg != null ? fn( arg ) : arg;
```

**Note:** We're going to use ES6 `=>` form for the rest of this refactoring, just to keep things concise.

This `guard(..)` utility lets us map the five conditional-guarded functions:

```js
[ getSessionId, lookupUser, getUserId, lookupOrders, processOrders ]
.map( guard )
```

The result of this mapping is an array of functions that are ready to compose (actually, pipe, in this listed order). We could spread this array to `pipe(..)`, but since we're already doing list operations, let's do it with a `reduce(..)`, using the session value from `getCurrentSession()` as the initial value:

```js
.reduce(
	(result,nextFn) => nextFn( result )
	, getCurrentSession()
)
```

Next, let's observe that `getSessionId(..)` and `getUserId(..)` can be expressed as a mapping from the respective values `"sessId"` and `"uId"`:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
```

But to use these, we'll need to interleave them with the other three functions (`lookupUser(..)`, `lookupOrders(..)`, and `processOrders(..)`) to get the array of five functions to guard / compose as discussed above.

To do the interleaving, let's split the task into two steps. The first step will use `reduce(..)` (our swiss army knife, remember!?) to "insert" `lookupUser(..)` in between the `getSessionId(..)` and `getUserId(..)` functions in an array:

```js
.reduce(
	(list,fn) => list.reverse().concat( fn )
	, [ lookupUser ]
)
```

Then we'll concatenate `lookupOrders(..)` and `processOrders(..)` onto the end of the running functions array:

```js
.concat( lookupOrders, processOrders )
```

To review, the generated list of five functions is expressed as:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
.reduce(
	(list,fn) => list.reverse().concat( fn )
	, [ lookupUser ]
)
.concat( lookupOrders, processOrders )
```

Finally, to put it all together, take this list of functions and tack on the guarding and composition from earlier:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
.reduce(
	(list,fn) => list.reverse().concat( fn )
	, [ lookupUser ]
)
.concat( lookupOrders, processOrders )
.map( guard )
.reduce(
	(result,nextFn) => nextFn( result )
	, getCurrentSession()
);
```

Gone are all the imperative variable declarations and conditionals, and in their place we have clean and declarative list operations chained together.

If this version is harder for you read right now than the original, don't worry. The original is unquestionably the more common imperative form you're familiar with. Part of your evolution to become a functional programmer is to develop a recognition of FP patterns such as list operations. Over time, these will jump out of the code more readily as your sense of code readability shifts to declarative style.

Before we leave this topic, let's take a reality check: the example here is heavily contrived. Not all code segments will be straightforwardly modeled as list operations. The pragmatic take-away is to develop the instinct to look for these opportunities, but not get too hung up on code acrobatics; some improvement is better than none. Always step back and ask if you're **improving or harming** code readability.

## Fusion

Imagine this scenario:

```js
function removeInvalidChars(str) {
	return str.replace( /[^\w]*/g, "" );
}

function upper(str) {
	return str.toUpperCase();
}

function elide(str) {
	if (str.length > 10) return str.substr( 0, 7 ) + "...";
	return str;
}

var words = "Mr. Jones isn't responsible for this disaster!"
	.split( /\s/ );

words;
// [ "Mr.", "Jones", "isn't", "responsible", "for", "this", "disaster!" ]

words
.map( removeInvalidChars )
.map( upper )
.map( elide );
// [ "MR", "JONES", "ISNT", "RESPONS...", "FOR", "THIS", "DISASTER" ]
```

## Summary

Three common and powerful list operations:

* `map(..)`: transforms values as it projects them to a new list.
* `filter(..)`: selects or excludes values as it projects them to a new list.
* `reduce(..)`: combines values in a list to produce some other (usually but not always non-list) value.

Fusion uses function composition techniques to consolidate multiple adjacent `map(..)` calls, `filter(..)` calls, or `reduce(..)` calls. This is mostly a performance optimization, but it also improves the declarative nature of your list operations.
