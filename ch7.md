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

The `point` object state explicitly passed in replaces the closure that implicitly held that state.

### State And Behavior

It's not just that objects and closures represent ways to encapsulate collections of state, but also that they can include behavior via functions/methods.

Consider:

```js
function person(name,age) {
	return happyBirthday(){
		age++;
		console.log(
			"Happy " + age + "th Birthday, " + name + "!"
		);
	}
}

var birthdayBoy = person( "Kyle", 36 );

birthdayBoy();			// Happy 37th Birthday, Kyle!
```

The inner function `happyBirthday()` has closure over `name` and `age` so that the functionality therein is kept with the state.

We can achieve that same capability with a `this` binding to an object:

```js
var birthdayBoy = {
	name: "Kyle",
	age: 36,
	happyBirthday() {
		this.age++;
		console.log(
			"Happy " + this.age + "th Birthday, " + this.name + "!"
		);
	}
};

birthdayBoy.happyBirthday();
// Happy 37th Birthday, Kyle!
```

We're still expressing the encapsulation of state data with the `happyBirthday()` function, but with an object instead of a closure. And we don't have to explicitly pass in an object to a function (as with earlier examples); JavaScript's `this` binding easily creates an implicit binding.

Another way to analyze this relationship: a closure associates a single function with a set of state, whereas an object holidng the same state can have any number of functions to operate on that state.

#### Isomorphic

The term "isomorphic" gets thrown around a lot in JavaScript these days, and it's usually used to refer to code that can be used/shared in both the server and the browser. I wrote a blog post awhile back that calls bogus on that usage of this word "isomorphic", which actually has an explicit and important meaning that's being clouded.

Here's some selections from a part of that post:

> What does isomorphic mean? Well, we could talk about it in mathematic terms, or sociology, or biology. The general notion of isomorphism is that you have two things which are similar in structure but not the same.
>
> In all those usages, isomorphism is differentiated from equality in this way: two values are equal if they’re exactly identical in all ways, but they are isomorphic if they are represented differently but still have a 1-to-1, bi-directional mapping relationship.
>
> In other words, two things A and B would be isomorphic if you could map (convert) from A to B and then go back to A with the inverse mapping.

Recall in "Brief Math Review" in Chapter 2, we discussed the mathematical definition of a function as being a mapping between inputs and outputs. We pointed out this is technically called a morphism. An isomorphism is a special case of bijective morphism that requires not only that the mapping must be able to go in either direction, but also that the behavior is identical in either form.

But instead of thinking about numbers, let's relate isomorphism to code. Again quoting my blog post:

> [W]hat would isomorphic JS be if there were such a thing? Well, it could be that you have one set of JS code that is converted to another set of JS code, and that (importantly) you could convert from the latter back to the former if you wanted.

As we asserted earlier with our examples of closures-as-objects and objects-as-closures, these representative alternations go either way. In this respect, they are isomorphisms of each other.

Put simply, closures and objects are isomorphic representations of state (and its associated functionality).

The next time you hear someone say "X is isomorphic with Y", what they mean is, "X and Y can be converted from either one to the other, and maintain the same behavior regardless."

#### Under The Hood

So, we can think of objects as an isomorphic representation of closures from the perspective of code we could write. But we can also observe that a closure system could actually be implemented -- and likely is -- with objects!

Think about it this way: in the following code, how is JS keeping track of the `x` variable for `inner()` to keep referencing, long after `outer()` has already run?

```js
function outer() {
	var x = 1;

	return function inner(){
		return x;
	};
}
```

We could imagine that the scope -- the set of all variables defined -- of `outer()` is implemented as an object with properties. So, conceptually, somewhere in memory, there's something like:

```js
scopeOfOuter = {
	x: 1
}
```

And then for the `inner()` function, when created, it gets an (empty) scope object called `scopeOfInner`, which is linked via its `[[Prototype]]` to the `scopeOfOuter` object, sorta like this:

```js
scopeOfInner = {};
Object.setPrototypeOf( scopeOfInner, scopeOfOuter );
```

Then, inside `inner()`, when it makes reference to the lexical variable `x`, it's actually more like:

```js
return scopeOfInner.x;
```

Now, `scopeOfInner` doesn't have an `x` property, but it's `[[Prototype]]`-linked to `scopeOfOuter`, which does have an `x` property. Accessing `scopeOfOuter.x` via prototype delegation results in the `1` value being returned.

In this way, we can sorta see why the scope of `outer()` is preserved (via closure) even after it finishes: because the `scopeOfInner` object is linked to the `scopeOfOuter` object, thereby keeping that object and its properties alive and well.

Now, this is all conceptual. I'm not literally saying the JS engine uses objects and prototypes. But it's entirely possible that it *could* work in this way. Many languages do in fact implement closures via objects.

And other languages implement objects in terms of closures. But we'll let the reader use their imagination on how that would work.

## Two Roads Diverged In A Wood...

// TODO

## Summary

The truth of this chapter cannot be written out. One must read this chapter to find its truth.
