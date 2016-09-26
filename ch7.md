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

// TODO: `zip(..)`, `flatten(..)`, etc

## Looking For Lists

So far, most of the examples have been rather trivial, based on simple lists of numbers or strings. Let's now talk about where list operations can star to shine: modeling an imperative series of statements with declarative list operations.

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
