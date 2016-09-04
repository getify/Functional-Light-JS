# Functional-Light JavaScript
# Chapter 5: Reducing Side Effects

In Chapter 2, we discussed how a function can have outputs besides its `return` value. By now you should be very comfortable with the FP definition of a function, so the idea of such side outputs -- side effects! -- should smell.

We're going to examine the various different forms of side effects and see why they are harmful to our code's quality and readability.

But let me not bury the lede here. The punchline to this chapter: it's impossible to write a program with no side effects. Well, not impossible; you certainly can. But that program won't do anything useful or observable. If you wrote a program with zero side effects, you wouldn't be able to tell the difference between it and a deleted or empty program.

The FPer doesn't eliminate all side effects. Rather, the goal is to limit them as much as possible. To do that, we first need to fully understand them.

## Effects On The Side, Please

Cause and effect: one of the most fundamental, intuitive observations we humans can make about the world around us. Push a book off the edge of a table, it falls to the ground. You don't need a physics degree to know the cause was you pushing the book and the effect was gravity pulling it to the ground. There's a clear and direct relationship.

In programming, we also deal entirely in cause and effect. If you call a function (cause), it displays a message on the screen (effect).

When reading a program, it's supremely important that the reader be able to clearly identify each cause and each effect. To any extent where a direct relationship between cause and effect cannot be seen readily upon a read-through of the program, that program's readability is degraded.

Consider:

```js
function foo(x) {
	return x * 2;
}

var y = foo( 3 );
```

In this trivial program, it is immediately clear that calling foo (the cause) with value `3` will have the effect of returning the value `6` that is then assigned to `y` (the effect). There's no ambiguity here.

But now:

```js
function foo(x) {
	y = x * 2;
}

var y;

foo( 3 );
```

This program has the exact same outcome. But there's a very big difference. The cause and the effect are disjoint. The effect is indirect. The setting of `y` in this way is what we call a side effect.

What if I gave you a reference to call a function `bar(..)` that you cannot see the code for, but I told you that it had no such indirect side effects, only an explicit `return` value effect?

```js
bar( 4 );	// 42
```

Because you know that the internals of `bar(..)` do not create any side effects, you can now reason about any `bar(..)` call like this one in a much more straightforward way. But if you didn't know that `bar(..)` had no side effects, to understand the outcome of calling it, you'd have to go read and dissect all of its logic. This is extra mental tax burden for the reader.

**The readability of a side effecting function is less** because it requires more reading to understand the program.

But the problem goes deeper than that. Consider:

```js
var x = 1;

foo();

console.log( x );

bar();

console.log( x );

baz();

console.log( x );
```

How sure are you what values are going to be printed at each `console.log(x)`?

The correct answer is: not at all. If you're not sure whether `foo()`, `bar()`, and `baz()` are side-effecting or not, you cannot guarantee what `x` will be at each step unless you inspect the implementations of each, **and** then trace the program from line one forward, keeping track of all the changes in state as you go.

In other words, the final `console.log(x)` is impossible to analyze or predict unless you've mentally executed the whole program up to that point.

Guess who's good at running your program? The JS engine. Guess who's not as good at running your program? The reader of your code. And yet, your choice to write code with (potentially) side effects in one or more of those function calls means that you've burdened the reader with having to mentally execute your program in its entirety up to a certain line, for them to understand to understand that line.

If `foo()`, `bar()`, and `baz()` were all free of side effects, they could not affect `x`, which means we do not need to execute them to mentally trace what happens with `x`. This is less mental tax, and makes the code more readable.

### Hidden Causes

Outputs, changes in state, are the most commonly cited manifestation of side effects. But another readability-endangering practice is what some refer to as side causes. Consider:

```js
function foo(x) {
	return x + y;
}

var y = 3;

foo( 1 );			// 4
```

`y` is not changed by `foo(..)`, so it's not the same kind of side effect as we saw before. But now, the calling of `foo(..)` actually depends on the presence and current state of a `y`. If later, we do:

```js
y = 5;

// ..

foo( 1 );			// 6
```

Might we be surprised that the call to `foo(1)` returned different results from call to call?

`foo(..)` has an indirection of cause that is harmful to readability. The reader cannot see, without inspecting `foo(..)`'s implementation carefully, what causes are contributing to the output effect. It *looks* like the argument `1` is the only cause, but it turns out it's not.

To aid readability, all of the causes that will contribute to determining the effect output of `foo(..)` should be made as direct and obvious inputs to `foo(..)`. The reader of the code will clearly see the cause(s) and effect.

#### Fixed State

Does that mean the `foo(..)` function cannot reference any lexical identifier from outside itself?

Consider this code:

```js
function foo(x) {
	return x + bar( x );
}

function bar(x) {
	return x * 2;
}

foo( 3 );			// 9
```

It's clear that for both `foo(..)` and `bar(..)`, the only direct cause is the `x` parameter. But what about the `bar(x)` call? `bar` is just an identifier, and in JS it's not even a constant by default. The `foo(..)` function is relying on the value of `bar` -- here it's a reference to the `bar(..)` function -- as one of its causes.

So is this program relying on side causes?

I say no. Even though it is *possible* to overwrite the `bar` identifier's value with some other function, I am not doing so in this code, nor is it a common practice or precedent to do so. For all intents and purposes, my functions are constants (never reassigned).

Consider:

```js
const PI = 3.141592;

function foo(x) {
	return x * PI;
}

foo( 3 );			// 9.424776000000001
```

How about now? Is `PI` a side cause of `foo(..)`?

Two observations will help us answer that question in a reasonable way:

1. Think about every call you might ever make to `foo(3)`. Will it always return that `9.424..` value? **Yes.** Every single time. If you give it the same input (`x`), it will always return the same output.

2. Could you replace every usage of `PI` with its immediate value, and could the program run **exactly** the same as it did before? **Yes.**

My conclusion: `PI` here is not a violation of the spirit of minimizing/avoiding side effects (causes). Nor is the `bar(x)` call in the previous snippet.

In both cases, `PI` and `bar` are not part of the state of the program. They're fixed, non-reassignable ("constant") references. If they don't change throughout the program, we don't have to worry about tracking them as changing state. As such, they don't harm our readability.

### Idempotence

Mathematical:

* `abs(..)`
* type conversions

Programming:

* `obj.x = 2`

## Pure

No side effects!

A pure function is idempotent in the programming sense, but not necessarily idempotent in the mathematical sense.

### There Or Not

Referential Transparency.

## Summary

Side effects are bad because they make your code much harder to understand. Pure functions are how we avoid side effects.

Prefer pure functions in as many places as that's practical. Collect impure functions side effects together as much as possible, so that it's easier to identify and audit the most likely culprits of bugs when the arise.
