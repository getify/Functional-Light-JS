# Functional-Light JavaScript
# Chapter 2: Managing Function Inputs

In Chapter 1 "Function Inputs", we talked about the basics of function parameters and arguments. We even looked at some syntactic tricks for easing their use such as the `...` operator and destructuring.

I recommended in that first chapter that you try to design functions with a single parameter if at all possible. The fact is, this won't always be possible, and you won't always be in control of function signatures that you need to work with.

We now want to turn our attention to more sophisticated and powerful patterns for wrangling function inputs in these scenarios.

## Some Now, Some Later

If a function takes multiple arguments, you may want to specify some of those upfront and leave the rest to be specified later.

Consider this function:

```js
function ajax(url,data,callback) {
	// ..
}
```

Let's imagine you'd like to set up several API calls where the URLs are known upfront, but the data and the callback to handle the response won't be known until later.

Of course, you can just defer making the `ajax(..)` call until all the bits are known, and refer to some global constant for the URL at that time. But another way is to create a function reference that already has the `url` argument preset.

What we're going to do is make a new function that still calls `ajax(..)` under the covers, and it manually sets the first argument to the API URL you care about, while waiting to accept the other two arguments later.

```js
function getPerson(data,cb) {
	ajax( "http://some.api/person", data, cb );
}

function getOrder(data,cb) {
	ajax( "http://some.api/order", data, cb );
}
```

Manually specifying these function call wrappers is certainly possible, but it may get quite tedious, especially if there will also be variations with different arguments preset, like:

```js
function getCurrentUser(cb) {
	getPerson( { user: CURRENT_USER_ID }, cb );
}
```

One practice an FPer gets very used to is looking for patterns where we do the same sorts of things repeatedly, and trying to turn those actions into generic reusable utilities. As a matter of fact, I'm sure that's already the instinct for many of you readers, so that's not uniquely an FP thing. But it's unquestionably important for FP.

To conceive such a utility for argument presetting, let's examine conceptually what's going on, not just looking at the manual implementations above.

One way to articulate what's going on is that the `getOrder(data,cb)` function is a *partial application* of the `ajax(url,data,cb)` function. This terminology comes from the notion that arguments are *applied* to parameters at the function call-site. And as you can see, we're only applying some of the arguments upfront -- specifically the argument for the `url` parameter -- while leaving the rest to be applied later.

To be a tiny bit more formal about this pattern, partial application is strictly a reduction in a function's arity; remember, that's the number of expected parameter inputs. We reduced the original `ajax(..)` function's arity from 3 to 2 for the `getOrder(..)` function.

Let's invent a `partial(..)` utility:

```js
function partial(fn,...presetArgs) {
	return function partiallyApplied(...laterArgs) {
		return fn( ...presetArgs, ...laterArgs );
	};
}
```

**Tip:** Don't just take this snippet at face value. Take a few moments to digest what's going on with this utility. Make sure you really *get it*. The pattern here is actually going to come up over and over again throughout the rest of the text, so it's a really good idea to get comfortable with it now.

The `partial(..)` function takes an `fn` for which function we are partially applying. Then, any subsequent arguments passed in are gathered into the `presetArgs` array and saved for later.

A new inner function (called `partiallyApplied(..)` just for clarity) is created and `return`ed, whose own arguments are gathered into an array called `laterArgs`.

Notice the references to `fn` and `presetArgs` inside this inner function? How does that work? After `partial(..)` finishes running, how does the inner function keep being able to access `fn` and `presetArgs`? If you answered **closure**, you're right on track! The inner function `partiallyApplied(..)` closes over both the `fn` and `presetArgs` variable so it can keep accessing them later, no matter where the function runs. See how important understanding closure is?

When the `partiallyApplied(..)` function is later executed somewhere else in your program, it uses the closed over `fn` to execute the original function, first providing any of the (closed over) `presetArgs` partial application arguments, then any further `laterArgs` arguments.

If any of that was confusing, stop and go re-read it. Trust me, you'll be glad you did as we get further into the text.

As a side note, the FPer will often prefer the shorter `=>` arrow function syntax for such code (see Chapter 1 "Syntax"), such as:

```js
var partial =
	(fn,...presetArgs) =>
		(...laterArgs) =>
			fn( ...presetArgs, ...laterArgs );
```

No question this is more terse, sparse even. But I personally feel that whatever it may gain in symmetry with the mathematical notation, it loses more in overall readability with the functions all being anonymous, and by obscuring the scope boundaries making deciphering closure a little more cryptic.

Whichever syntax approach tickles your fancy, let's now use the `partial(..)` utility to make those earlier partially-applied functions:

```js
var getPerson = partial( ajax, "http://some.api/person" );

var getOrder = partial( ajax, "http://some.api/order" );
```

Stop and think about the shape/internals of `getPerson(..)`. It will look sorta like this:

```js
var getPerson = function partiallyApplied(...laterArgs) {
	return ajax( "http://some.api/person", ...laterArgs );
};
```

The same will be true of `getOrder(..)`. But what about `getCurrentUser(..)`?

```js
// version 1
var getCurrentUser = partial(
	ajax,
	"http://some.api/person",
	{ user: CURRENT_USER_ID }
);

// version 2
var getCurrentUser = partial( getPerson, { user: CURRENT_USER_ID } );
```

We can either (version 1) define `getCurrentUser(..)` with both the `url` and `data` arguments specified directly, or (version 2) we can define `getCurrentUser(..)` as a partial application of the `getPerson(..)` partial application, specifying only the additional `data` argument.

Version 2 is a little cleaner to express because it reuses something already defined. As such, I think it fits a little closer to the spirit of FP.

Just to make sure we understand how these two versions will work under the covers, they look respectively kinda like:

```js
// version 1
var getCurrentUser = function partiallyApplied(...laterArgs) {
	return ajax(
		"http://some.api/person",
		{ user: CURRENT_USER_ID },
		...laterArgs
	);
};

// version 2
var getCurrentUser = function outerPartiallyApplied(...outerLaterArgs) {
	var getPerson = function innerPartiallyApplied(...innerLaterArgs) {
		return ajax( "http://some.api/person", ...innerLaterArgs );
	};

	return getPerson( { user: CURRENT_USER_ID }, ...outerLaterArgs );
}
```

Again, stop and re-read those code snippets to make sure you understand what's going on there.

**Note:** The second version has an extra layer of function wrapping involved. That may smell strange and unnecessary, but this is just one of those things in FP that you'll want to get really comfortable with. We'll be wrapping many layers of functions onto each other as we progress through the text. Remember, this is *function*al programming!

## One At A Time

There's a special form of partial application where a function that expects multiple arguments is broken down into successive functions that each take a single argument (arity: 1) and return another function to accept the next argument.

This technique is called currying.

To illustrate, let's imagine we had a curried version of `ajax(..)` already created. This is how we'd use it:

```js
var curriedGetPerson = curriedAjax( "http://some.api/person" );

var curriedGetCurrentUser = curriedGetPerson( { user: CURRENT_USER_ID } );

curriedGetCurrentUser( function foundUser(user){ /* .. */ } );
```

Actually, that doesn't look too terribly different from what we saw earlier in the partial application discussion. That's what I meant by saying that currying is a special case of partial application.

The main difference is that `curriedAjax(..)` will explicitly return a function (we call `curriedGetPerson(..)`) that expects **only the next argument** `data`, not one that (like the earlier `getPerson(..)`) can receive all the rest of the arguments.

If an original function expected 5 arguments, the curried form of that function would take just the first argument, and return a function to accept the second. That one would take just the second argument, and return a function for to accept the third. And so on.

So currying unwinds a higher-arity function into a series of chained unary functions.

How might we define a utility to do this currying? We're going to use some tricks from Chapter 1.

```js
function curry(fn,arity = fn.length) {
	var args = [];

	return function curried(nextArg) {
		args.push( nextArg );

		if (args.length >= arity) {
			return fn( ...args );
		}
		else {
			return curried;
		}
	};
}
```

The strategy here is to keep the collected arguments received, one at a time from successive function calls to the returned inner `curried(..)` function, in the `args` array. While `args.length` is less than `arity` (the number of declared/expected parameters of the original `fn(..)` function), just keep returning the `curried(..)` function to collect one more `nextArg` argument. Once we have the correct number of `args`, execute the original `fn(..)` function with them.

By default, this approach relies on being able to inspect the `length` property of the to-be-curried function to know how many iterations of currying we'll need before we've collected all its expected arguments. If you use it against a function that doesn't have an accurate `length` -- like if it uses a parameter signature such as `...args` -- you'll need to pass the `arity` argument to set the expected length manually.

Here's how we would use it for our earlier `ajax(..)` example:

```js
var curriedAjax = curry( ajax );

// from here on, it's the same as before:

var curriedGetPerson = curriedAjax( "http://some.api/person" );

var curriedGetCurrentUser = curriedGetPerson( { user: CURRENT_USER_ID } );

curriedGetCurrentUser( function foundUser(user){ /* .. */ } );
```

How about another example, this time with adding numbers together:

```js
function sum(...args) {
	var sum = 0;
	for (var i = 0; i < args.length; i++) {
		sum += args[i];
	}
	return sum;
}

var curriedSum = curry( sum, 5 );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );		// 15
```

## All But One

// TODO: discuss `unary(..)` transform.

## Summary

Partial Application is a technique for reducing the arity -- expected number of arguments to a function -- by creating a new function where some of the arguments are preset.

Currying is a special form of partial application where the arity is reduced to 1, with a chain of successive chained function calls, each which takes one argument. Once all arguments have been specified by these function calls, the original function is executed with all the collected arguments.
