# Functional-Light JavaScript
# Chapter 7: Closure vs Object

A number of years ago, Guy Steele crafted what has become a rather famous and oft-cited [koan](https://www.merriam-webster.com/dictionary/koan) to illustrate and provoke an important tension between closure and objects:

> The venerable master Qc Na was walking with his student, Anton. Hoping to
prompt the master into a discussion, Anton said "Master, I have heard that
objects are a very good thing - is this true?" Qc Na looked pityingly at
his student and replied, "Foolish pupil - objects are merely a poor man's
closures."
>
> Chastised, Anton took his leave from his master and returned to his cell,
intent on studying closures. He carefully read the entire "Lambda: The
Ultimate..." series of papers and its cousins, and implemented a small
Scheme interpreter with a closure-based object system. He learned much, and
looked forward to informing his master of his progress.
>
> On his next walk with Qc Na, Anton attempted to impress his master by
saying "Master, I have diligently studied the matter, and now understand
that objects are truly a poor man's closures." Qc Na responded by hitting
Anton with his stick, saying "When will you learn? Closures are a poor man's
object." At that moment, Anton became enlightened.
>
> Guy Steele 6/4/2003
>
> http://people.csail.mit.edu/gregs/ll1-discuss-archive-html/msg03277.html

The original posting, while brief, has more context to the origin and motivations, and I strongly suggest you read that post to properly set your mindset for approaching this chapter.

Many people I've observed read this koan smirk at its clever wit but then move on without it changing much about their thinking. However, the purpose of a koan (from the Bhuddist Zen perspective) is to prod the reader into wrestling with the contradictory truths therein. So, go back and read it again. Now read it again.

Which is it? Is a closure a poor man's object, or is an object a poor man's closure? Or neither? Or both? Is merely the take-away that closures and objects are in some way equivalent?

And what does any of this have to do with functional programming? Pull up a chair and ponder for awhile. This chapter will be an interesting detour, an excursion if you will.

## The Same Page

First, let's make sure we're all on the same page when we refer to closures and objects. We're obviously in the context of how JavaScript deals with these two mechanisms, and specifically talking about simple function closure (see "Keeping Scope" in Chapter 2) and simple objects (collections of key-value pairs).

A simple function closure:

```js
function outer() {
	var one = 1;
	var two = 2;

	return function inner(){
		return one + two;
	};
}

var three = outer();

three();			// 3
```

A simple object:

```js
var obj = {
	one: 1,
	two: 2
};

function three(outer) {
	return outer.one + outer.two;
}

three( obj );		// 3
```

Many people conjur lots of extra things when you mention "closure", such as the asynchronous callbacks or even the module pattern with encapsulation and information hiding. Similarly, "object" brings to mind classes, `this`, prototypes, and a whole slew of other utilities and patterns.

As we go along, we'll carefully address the parts of this external context that matter, but for now, try to just stick to the simplest interpretations of "closure" and "object" -- it'll make this journey less confusing.

## Look Alike

It may not be obvious how closures and objects are related. So let's explore their similarities first.

To frame this discussion, let me just briefly assert two observations:

1. A language without closures can simulate them with objects instead.
2. A language without objects can simulate them with closures instead.

In other words, we can think of closures and objects as two different representations of a thing.

### State

Consider this code from above:

```js
function outer() {
	var one = 1;
	var two = 2;

	return function inner(){
		return one + two;
	};
}

var obj = {
	one: 1,
	two: 2
};
```

Both the scope closed over by `inner()` and the object `obj` contain two elements of state: `one` with value `1` and `two` with value `2`. Syntactically and mechanically, these representations of state are different. But conceptually, they're actually quite similar.

As a matter of fact, it's fairly straightforward to represent an object as a closure, or a closure as an object. Go ahead, try it yourself:

```js
var point = {
	x: 10,
	y: 12,
	z: 14
};
```

Did you come up with something like?

```js
function outer() {
	var x = 10;
	var y = 12;
	var z = 14;

	return function inner(){
		return [x,y,z];
	}
};

var point = outer();
```

What if we have nested objects?

```js
var person = {
	name: "Kyle Simpson",
	address: {
		street: "123 Easy St",
		city: "JS'ville",
		state: "ES"
	}
};
```

We could represent that same kind of state with nested closures:

```js
function outer() {
	var name = "Kyle Simpson";
	return middle();

	// ********************

	function middle() {
		var street = "123 Easy St";
		var city = "JS'ville";
		var state = "ES";

		return function inner(){
			return [name,street,city,state];
		};
	}
}

var person = outer();
```

Let's practice going the other direction, from closure to object:

```js
function point(x1,y1) {
	return function distFromPoint(x2,y2){
		return Math.sqrt(
			Math.pow( x2 - x1, 2 ) +
			Math.pow( y2 - y1, 2 )
		);
	};
}

var pointDistance = point( 1, 1 );

pointDistance( 4, 5 );		// 5
```

`distFromPoint(..)` is closed over `x1` and `y1`, but we could instead explicitly pass those values as an object:

```js
function pointDistance(point,x2,y2) {
	return Math.sqrt(
		Math.pow( x2 - point.x1, 2 ) +
		Math.pow( y2 - point.y1, 2 )
	);
};

pointDistance(
	{ x1: 1, y1: 1 },
	4,	// x2
	5	// y2
);
// 5
```

The `point` object replaces the closure. In fact, any state represented with a closure could be represented with an object. In this respect, closures and objects are isomorphic representations of state.

## Two Roads Diverged In A Wood...

// TODO

## Summary

The truth of this chapter cannot be written out. One must read this chapter to find its truth.
