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

Does avoiding side causes mean the `foo(..)` function cannot reference any lexical identifier from outside itself?

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

So is this program relying on a side cause?

I say no. Even though it is *possible* to overwrite the `bar` variable's value with some other function, I am not doing so in this code, nor is it a common practice or precedent to do so. For all intents and purposes, my functions are constants (never reassigned).

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

2. Could you replace every usage of `PI` with its immediate value, and could the program run **exactly** the same as it did before? **Yes.** There's no part of this program that relies on being able to change the value of `PI` -- indeed since it's a `const`, it cannot be reassigned -- so the `PI` variable here is only for readability/maintenance sake. Its value can be inlined without any change in program behavior.

My conclusion: `PI` here is not a violation of the spirit of minimizing/avoiding side effects (or causes). Nor is the `bar(x)` call in the previous snippet.

In both cases, `PI` and `bar` are not part of the state of the program. They're fixed, non-reassignable ("constant") references. If they don't change throughout the program, we don't have to worry about tracking them as changing state. As such, they don't harm our readability. And they cannot be the source of bugs related to variables changing in unexpected ways.

**Note:** The use of `const` above does not, in my opinion, make the case that `PI` is absolved as a side cause; `var PI` would lead to the same conclusion. The lack of reassigning `PI` is what matters, not the inability to do so. We'll discuss `const` in a later chapter.

### Side Bugs

The scenarios where side causes and side effects can lead to bugs are as varied as the programs in existence. But let's examine a scenario to illustrate these hazards, in hopes that they help us recognize similar mistakes in our own programs.

Consider:

```js
var users = {};
var userOrders = {};

function fetchUserData(userId) {
	ajax( "http://some.api/user/" + userId, function onUserData(userData){
		users[userId] = userData;
	} );
}

function fetchOrders(userId) {
	ajax( "http://some.api/orders/" + userId, function onOrders(orders){
		for (let i = 0; i < orders.length; i++) {
			// keep a reference to latest order for each user
			users[userId].latestOrder = orders[i];
			orders[orders[i].orderId] = orders[i];
		}
	} );
}

function deleteOrder(orderId) {
	var user = users[ orders[orderId].userId ];
	var isLatestOrder = (orders[orderId] == user.latestOrder);

	// deleting the latest order for a user?
	if (isLatestOrder) {
		hideLatestOrderDisplay();
	}

	ajax( "http://some.api/delete/order/" + orderId, function onDelete(success){
		if (success) {
			// deleted the latest order for a user?
			if (isLatestOrder) {
				user.latestOrder = null;
			}

			orders[orderId] = null;
		}
		else if (isLatestOrder) {
			showLatestOrderDisplay();
		}
	} );
}
```

I bet for some of you readers one of the potential bugs here is fairly obvious. If the callback `onOrders(..)` runs before the `onUserData(..)` callback, it will attempt to add a `latestOrder` property to a value (the `userData` object at `users[userId]`) that's not yet been set.

So one form of "bug" that can occur with logic that relies on side causes/effects is the race condition of two different operations (async or not!) that we expect to run in a certain order but under some cases may run in a different order. There are strategies for ensuring the order of operations, and it's fairly obvious that order is critical in that case.

Another more subtle bug can bite us here. Did you spot it?

Consider this order of calls:

```js
fetchUserData( 123 );
onUserData(..);
fetchOrders( 123 );
onOrders(..);

// later

fetchOrders( 123 );
deleteOrder( 456 );
onOrders(..);
onDelete(..);
```

There's a delay in time between when we set `isLatestOrder` and when we use it to decide if we should empty the `latestOrder` property of the user data object in `users`. During that delay, the `onOrders(..)` callback fires, which can potentially change which order value that user's `latestOrder` reference points to. When `onDelete(..)` subsequently fires, it will assume it still needs to unset the `latestOrder` reference.

Now the data (state) might be out of sync. `latestOrder` will be unset, when potentially it should have stayed pointing at a newer order that came in to `onOrders(..)`.

The worst part of this kind of bug is that you don't get an error like we did with the other bug. We just simply have state that is incorrect, and our application's behavior is "gracefully" broken.

The sequencing dependency between `fetchUserData(..)` and `fetchOrders(..)` is fairly obvious, and straightforwardly addressed. But it's far less clear that there's a potential sequencing dependency between `fetchOrders(..)` and `deleteOrder(..)`. These two seem to be more independent. And ensuring that their order is preserved is more tricky, because you don't know in advance (before the results from `fetchOrders(..)`) whether that sequencing really must be enforced.

Yes, you can recompute an `isLatestOrder` once `deleteOrder(..)` fires. But now you have a different problem: your UI state can be out of sync.

If you had called the `hideLatestOrderDisplay()` previously, you'll now need to call `showLatestOrderDisplay()`, but only if the new `latestOrder` has in fact been set. So you'll need to track at least two states: was the deleted order the "latest" originally, and is the "latest" set, and are those two orders different? These are solvable problems, of course. But they're not obvious by any means.

All of these hassles are because we decided to structure our code with side causes/effects on a shared set of state.

Functional programmers detest these sorts of side cause/effect bugs because of how much it hurts our ability read, reason about, validate, and trust the code. That's why they take the advice to avoid side causes/effects so seriously.

There are multiple different strategies for avoiding/fixing these kinds of problems. We'll talk about some later in this chapter, and others in later chapters. I'll say one thing for certain: **writing with side causes/effects is often of our normal default** so avoiding them is going to require careful and intentional effort.

### Idempotence

Mathematical:

* `abs(..)`
* type conversions

Programming:

* `obj.x = 2`

## Pure Bliss

No side effects!

A pure function is idempotent in the programming sense, but not necessarily idempotent in the mathematical sense.

### There Or Not

Referential Transparency.

## Purifying

What can you do if you have an impure function that you cannot refactor to be pure?

## Summary

Side effects are harmful to code readability and quality because they make your code much harder to understand. Side effects are also one of the most common *causes* of bugs in programs, because juggling them is hard.

Pure functions are how we avoid side effects. A pure function is one that always returns the same output given the same input, and has no side causes or side effects.

No program can be entirely free of side effects. But prefer pure functions in as many places as that's practical. Collect impure functions side effects together as much as possible, so that it's easier to identify and audit the most likely culprits of bugs when they arise.
