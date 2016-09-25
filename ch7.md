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
