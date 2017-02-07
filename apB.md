# Functional-Light JavaScript
# Appendix B: The Humble Monad

Let me just start off this appendix by admitting: I did not know much about what a monad was before starting to write the following. I am including the topic of monads in the book because it's part of the journey that every developer will encounter while learning FP, just as I have in this writing.

But we're basically ending this book with a brief glimpse at monads, whereas most other FP literature kinda almost starts with monads! I do not encounter in my "functional light" programming much of a need to think explicitly in terms of monads, so that's why this material is more bonus than main core. But that's not to say monads aren't useful or prevalent -- they very much are.

There's a bit of a joke around the JavaScript FP world that pretty much everybody has to write their own tutorial or blog post on what a monad is, like the writing of it alone is some rite-of-passage. Over the years, monads have variously been depicted as burritos and all sorts of other wacky conceptual abstractions.

I hope there's none of that silly business going on here. My only hope for what you get out of this discussion is to not be scared of the term or the concept anymore -- I have been, for years! -- and to be able to recognize them when you see them. You might, just maybe, even use them on occassion.

## Type

There's a huge area of interest in FP that we've basically stayed entirely away from throughout this book: type theory. I'm not going to get very deep into type theory, because quite frankly I'm not qualified to do so. And you wouldn't appreciate it even if I did.

But what I will say is that a monad is basically a value type.

The number `42` has a value type (number!) that brings with it certain characteristics and capabilities that we rely on. The string `"42"` may look very similar, but it has a different purpose in our program.

In object oriented programming, when you have a set of data (even a single discrete value) and you have some behavior you want to bundle with it, you create an object/class to represent that "type". Instances are then members of that type. This practice generally goes by the name "Data Structures".

I'm going to use the notion of data structures very loosely here, and assert that we may find it useful in a program to define a set of behaviors and constraints for a certain value, and bundle them together with that value into a single abstraction. That way, as we work with one or more of those kinds of values in our program, their behaviors come along for free and will make working with them more convenient. And by convenient, I mean more declarative and approachable for the reader of your code!

A monad is a data structure. It's a type. It's a set of behaviors that are specifically designed to make working with a value predictable.

Recall in Chapter 8 that we talked about functors: a value along with a map-like utility to perform an operation on all its constitute data members. A monad is a functor that includes some additional behavior.

## Interface

// TODO

## Summary

What is a monad, anyway?
