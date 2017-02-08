# Functional-Light JavaScript
# Appendix B: The Humble Monad

Let me just start off this appendix by admitting: I did not know much about what a monad was before starting to write the following. I am including the topic of monads in the book because it's part of the journey that every developer will encounter while learning FP, just as I have in this writing.

But we're basically ending this book with a brief glimpse at monads, whereas most other FP literature kinda almost starts with monads! I do not encounter in my "functional light" programming much of a need to think explicitly in terms of monads, so that's why this material is more bonus than main core. But that's not to say monads aren't useful or prevalent -- they very much are.

There's a bit of a joke around the JavaScript FP world that pretty much everybody has to write their own tutorial or blog post on what a monad is, like the writing of it alone is some rite-of-passage. Over the years, monads have variously been depicted as burritos, onions, and all sorts of other wacky conceptual abstractions. I hope there's none of that silly business going on here!

> A monad is just a monoid in the category of endofunctors.

We started the preface with this quote, so it seems fitting we come back to it here. But no, we won't be talking about monoids, endofunctors, or category theory. So, that quote is not only condescending, but totally unhelpful.

My only hope for what you get out of this discussion is to not be scared of the term monad or the concept anymore -- I have been, for years! -- and to be able to recognize them when you see them. You might, just maybe, even use them on occassion.

## Type

There's a huge area of interest in FP that we've basically stayed entirely away from throughout this book: type theory. I'm not going to get very deep into type theory, because quite frankly I'm not qualified to do so. And you wouldn't appreciate it even if I did.

But what I will say is that a monad is basically a value type.

The number `42` has a value type (number!) that brings with it certain characteristics and capabilities that we rely on. The string `"42"` may look very similar, but it has a different purpose in our program.

In object oriented programming, when you have a set of data (even a single discrete value) and you have some behavior you want to bundle with it, you create an object/class to represent that "type". Instances are then members of that type. This practice generally goes by the name "Data Structures".

I'm going to use the notion of data structures very loosely here, and assert that we may find it useful in a program to define a set of behaviors and constraints for a certain value, and bundle them together with that value into a single abstraction. That way, as we work with one or more of those kinds of values in our program, their behaviors come along for free and will make working with them more convenient. And by convenient, I mean more declarative and approachable for the reader of your code!

A monad is a data structure. It's a type. It's a set of behaviors that are specifically designed to make working with a value predictable.

Recall in Chapter 8 that we talked about functors: a value along with a map-like utility to perform an operation on all its constitute data members. A monad is a functor that includes some additional behavior.

## Loose Interface

Actually, a monad isn't a single data type, it's really more like a related collection of data types. It's kind of an interface that's implemented differently depending on the needs of different values. Each implementation is a different type of monad.

For example, you may read about the "Identity Monad", the "IO Monad", the "Maybe Monad", or a variety of others. Each of these has the basic monad behavior defined, but it extends or overrides the interactions according to the use cases for each different type of monad.

It's a little more than an interface though, because it's not just the presence of certain API methods that makes an object a monad. There's a certain set of guarantees about the interactions of these methods that is necessary to be monadic. These well-known invariants are critical to usage of monads improving readability by familiarity; otherwise, it's just an ad hoc data structure that must be fully understood by the reader.

As a matter of fact, there's not even just one single unified agreement on the names of these methods, the way a true interface would mandate; a monad more like a loose interface. Some people call a certain method `bind(..)`, some call it `chain(..)`, some call it `flatMap(..)`, etc.

So a monad is an object data structure with sufficient methods (of practically any name or sort) that at a minimum satisfy the main behavioral requirements of the monad definition. Each kind of monad has a different kind of extension above the minimum. But, because they all have an overlap in behavior, using two different kinds of monads together is still straightforward.

It's in that sense that monads are sort of like an interface.

## Humble

Lots of other material talks about common monads like Maybe; I'm going to skip that discussion.

However, I thought it might be fun to illustrate a monad by making up an entirely artificial one: `Humble`.

First off, a monad is a type, so you might think of defining it with a class to be instantiated. That's a valid way of doing it, but it introduces `this` issues that I don't like, so I'm instead going to stick with just a simple function / object. I'll present the whole implementation, then we'll go back and play with it a little bit.

```js
function Humble(...args) { return Humble.of( ...args ); }

// aka: unit, pure
Humble.of = function of(ego) {
	var publicAPI = { join, map, chain, ap };
	return publicAPI;

	// ************************

	function join() { return ego; }

	function map(fn) {
		if (Number( ego ) < 42) {
			return Humble.of( fn( ego ) );
		}
		return publicAPI;
	}

	// aka: bind, flatMap
	function chain(fn) {
		return map( fn ).join();
	}

	function ap(monad) {
		return monad.map( ego );
	}
};
```

## Summary

What is a monad, anyway?

A monad is a value type, an interface, an object data structure with encapsulated behaviors.

But none of those definitions are particularly useful. Here's an attempt at something better: a monad is how you organize behavior with a value in a more declarative way.

As with everything else in this book, use monads where they are helpful but don't use them just because everyone else talks about them in FP. Monads aren't a universal silver bullet, but they do offer some utility when used conservatively.
