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
	(fn, ...presetArgs) =>
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

Let's take a look at another example of the usefulness of partial application. Consider an `add(..)` function which takes two arguments and adds them together:

```js
function add(x,y) {
	return x + y;
}
```

Now, imagine we'd like take a list of numbers and add a certain number to each of them. We'll use the `map(..)` utility built into JS arrays.

```js
[1,2,3,4,5].map( function adder(val){
	return add( 3, val );
} );
// [4,5,6,7,8]
```

**Note:** Don't worry if you haven't seen `map(..)` before; we'll cover it in much more detail later in the book. For now, just know that it loops over an array calling a function to produce new values for a new array.

The reason we can't pass `add(..)` directly to `map(..)` is because the signature of `add(..)` doesn't match the mapping function that `map(..)` expects. That's where partial application can help us: we can adapt the signature of `add(..)` to something that will match.

```js
[1,2,3,4,5].map( partial( add, 3 ) );
// [4,5,6,7,8]
```

### `bind(..)`

JavaScript has a built-in utility called `bind(..)`, which is available on all functions. It has two capabilities: presetting the `this` context and partially applying arguments.

I think this is incredibly unfortunate to conflate these two capabilities in one utility. Sometimes you'll want to hard-bind the `this` context and not partially apply arguments. Other times you'll want to partially apply arguments but not care about `this` binding at all. I personally have almost never needed both at the same time.

The latter scenario is awkward because you have to pass an ignorable placeholder for the `this`-binding argument (the first one), usually `null`.

Consider:

```js
var getPerson = ajax.bind( null, "http://some.api/person" );
```

That `null` just bugs me to no end.

### Reversing Arguments

Recall that the signature for our Ajax function is: `ajax( url, data, cb )`. What if we wanted to partially apply the `cb` but wait to specify `data` and `url` later? We could create a utility that wraps a function to reverse its argument order:

```js
function reverseArgs(fn) {
	return function argsReversed(...args) {
		fn( ...args.reverse() );
	};
}
```

Now we can reverse the order of the `ajax(..)` arguments, so that we can then partially apply from the right rather than the left. To restore the expected order, we'll then reverse the partially applied function:

```js
var cache = {};

var cacheResult = reverseArgs(
	partial( reverseArgs( ajax ), function onResult(obj){
		cache[obj.id] = obj;
	} )
);

// later:
cacheResult( "http://some.api/person", { user: CURRENT_USER_ID } );
```

Now, we can define a `partialRight(..)` which partially applies from the right, using this same reverse-partial apply-reverse trick:

```js
function partialRight( fn, ...args ) {
	return reverseArgs(
		partial( reverseArgs( fn ), ...args )
	);
}

var cacheResult = partialRight( ajax, function onResult(obj){
	cache[obj.id] = obj;
});

// later:
cacheResult( "http://some.api/person", { user: CURRENT_USER_ID } );
```

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
	return (function nextCurried(prevArgs) {
		return function curried(nextArg) {
			var args = prevArgs.concat( nextArg );

			if (args.length >= arity) {
				return fn( ...args );
			}
			else {
				return nextCurried( args );
			}
		};
	})( [] );
}
```

And for the ES6 `=>` fans:

```js
var curry =
	(fn, arity = fn.length, nextCurried) =>
		(nextCurried = prevArgs =>
			nextArg => {
				var args = prevArgs.concat( nextArg );

				if (args.length >= arity) {
					return fn( ...args );
				}
				else {
					return nextCurried( args );
				}
			}
		)( [] );
```

The strategy here is to start a collection of arguments in `prevArgs` as an empty `[]` array, and add each received `nextArg` to that, calling the concatenation `args`. While `args.length` is less than `arity` (the number of declared/expected parameters of the original `fn(..)` function), make and return another `curried(..)` function to collect the next `nextArg` argument, passing the running `args` collection along as `prevArgs`. Once we have enough `args`, execute the original `fn(..)` function with them.

By default, this approach relies on being able to inspect the `length` property of the to-be-curried function to know how many iterations of currying we'll need before we've collected all its expected arguments. If you use it against a function that doesn't have an accurate `length` -- like if it uses a parameter signature such as `...args` -- you'll need to pass the `arity` argument to set the expected length manually.

Here's how we would use it for our earlier `ajax(..)` example:

```js
var curriedAjax = curry( ajax );

// from here on, it's the same as before:

var curriedGetPerson = curriedAjax( "http://some.api/person" );

var curriedGetCurrentUser = curriedGetPerson( { user: CURRENT_USER_ID } );

curriedGetCurrentUser( function foundUser(user){ /* .. */ } );
```

Remember our example from earlier about adding `3` to a each value in a list of numbers? Recall that currying is just a special case of partial application, so we could do that task with currying in almost the same way:

```js
[1,2,3,4,5].map( curry( add )( 3 ) );
// [4,5,6,7,8]
```

The difference between the two? `partial(add,3)` vs `curry(add)(3)`. Why might you choose `curry(..)` over partial? It might be helpful in the case where you know ahead of time that `add(..)` is the function to be adapted, but the value `3` isn't known yet:

```js
var adder = curry( add );

// later
[1,2,3,4,5].map( adder( 3 ) );
// [4,5,6,7,8]
```

How about another numbers example, this time adding a list of them together:

```js
function sum(...args) {
	var sum = 0;
	for (var i = 0; i < args.length; i++) {
		sum += args[i];
	}
	return sum;
}

sum( 1, 2, 3, 4, 5 );						// 15

// now with currying:
// (5 to indicate how many to wait for)
var curriedSum = curry( sum, 5 );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );		// 15
```

The advantage of currying here is being able to do something like `curriedSum(1)(2)(3)`, which returns a function. Then later call `fn(4)` to get yet another fn, and still later call `anotherfn(5)`, finally computing the `15` result.

In JavaScript, both currying and partial application use closure to remember the arguments over time until all have been received, and then the original operation can be performed.

### Why Currying Or Partial Application?

With either currying style (`sum(1)(2)(3)`) or partial application style (`sum(1,2)(3)`), the call-site unquestionably looks stranger than a more common one like `sum(1,2,3)`. So **why would we go this direction** when adopting FP? There's multiple layers to answering that question.

The first and most obvious reason is that both currying and partial application allow you to separate in time/space (throughout your code base) when and where separate arguments are specified, whereas traditional function calls require all the arguments to be present all at once. If you have a place in your code where you'll know some of the arguments and another place where the other arguments are determined, currying or partial application are very useful.

Another layer to this answer, which applies most specifically to currying, is that composition of functions is much easier when there's only one argument. So a function that ultimately needs 3 arguments, if curried, becomes a function that needs just one, three times over. That kind of unary function will be a lot easier to work with when we start composing them. We'll tackle this later in the text.

### Currying More Than One Argument?

The definition and implementation I've given of currying thus far is, I believe, as true to the spirit as we can likely get in JavaScript.

Specifically, if we look briefly at how currying works in Haskell, we can observe that multiple arguments always go in to a function one at a time, one per curried call -- other than tuples (analogus to arrays for our purposes) that transport multiple values in a single argument.

For example, in Haskell:

```
foo 1 2 3
```

This calls the `foo` function, and has the result of passing in three values `1`, `2`, and `3`. But functions are automatically curried in Haskell, which means each value goes in as a separate curried-call. The JS equivalent of that would look like `foo(1)(2)(3)`, which is the same style as the `curry(..)` I presented above.

**Note:** In Haskell, `foo (1,2,3)` is not passing in those 3 values as three separate arguments, but a tuple as a single argument. To work, `foo` would need to be altered to handle a tuple in that argument position. As far as I can tell, there's no way to call `foo` only once and pass all three arguments. Each argument gets its own curried-call. Of course, the presence of multiple calls is opaque to the Haskell developer, but it's a lot more syntactically obvious to the JS developer.

For these reasons, I think the earlier `curry(..)` that I demonstrated is a faithful adaptation.

However, it's important to note that there's a looser definition used in most popular JavaScript FP libraries.

Specifically, JS currying utilities typically allow you to specify multiple arguments for each curried-call. Revisiting our `sum(..)` example from before, this would look like:

```js
var curriedSum = looseCurry( sum, 5 );

curriedSum( 1 )( 2, 3 )( 4, 5 );			// 15
```

There's a slight syntax savings of fewer `( )`, and an implied performance benefit of now having three function calls instead of five. But other than that, using `looseCurry(..)` is identical in end result to the narrower `curry(..)` definition from earlier. I would guess the convenience/performance factor is probably why frameworks allow multiple arguments. This seems mostly like a matter of taste.

**Note:** The loose currying *does* give you the ability to send in more arguments than the arity (detected or specified). If you designed your function with optional/variadic arguments, that could be a benefit. For example, if you curry five arguments, looser currying still allows more than five arguments (`curriedSum(1)(2,3,4)(5,6)`), but narrower currying wouldn't support `curriedSum(1)(2)(3)(4)(5)(6)`.

It's easy to adapt our previous currying implementation to this common looser definition:

```js
function looseCurry(fn,arity = fn.length) {
	return (function nextCurried(prevArgs) {
		return function curried(...nextArgs) {
			var args = prevArgs.concat( nextArgs );

			if (args.length >= arity) {
				return fn( ...args );
			}
			else {
				return nextCurried( args );
			}
		};
	})( [] );
}
```

Now each curried-call accepts one or more arguments (as `nextArgs`). We'll leave it as an exercise for the interested reader to define the ES6 `=>` version of `looseCurry(..)` similar to how we did it for `curry(..)` earlier.

## All For One

Imagine you're passing a function to a utility where it will send multiple arguments to your function. But you may only want to receive a single argument. This is especially true if you have a loosely curried function like we discussed previously that *can* accept more arguments that you wouldn't want.

We can design a simple utility that wraps a function call to ensure only one argument will pass through. Since this is effectively enforcing that a function is treated as unary, let's name it as such:

```js
function unary(fn) {
	return function onlyOneArg(arg) {
		return fn( arg );
	};
}

// or the ES6 => arrow form
var unary = fn => arg => fn(arg);
```

We saw the `map(..)` utility eariler. It calls the provided mapping function with three arguments: `value`, `index`, and `list`. If you want your mapping function to only receive one of these, like `value`, use the `unary(..)` operation:

```js
function unary(fn) {
	return function onlyOneArg(arg) {
		return fn( arg );
	};
}

var adder = looseCurry( sum, 2 );

// oops:
[1,2,3,4,5].map( adder( 3 ) );
// ["41,2,3,4,5", "61,2,3,4,5", "81,2,3,4,5", "101, ...

// fixed with `unary(..)`:
[1,2,3,4,5].map( unary( adder( 3 ) ) );
// [4,5,6,7,8]
```

Another commonly cited example using `unary(..)` is:

```js
["1","2","3"].map( parseFloat );
// [1,2,3]

["1","2","3"].map( parseInt );
// [1,NaN,NaN]

["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

For the signature `parseInt(str,radix)`, it's clear that if `map(..)` passes an index in the second argument position, it will be interpreted by `parseInt(..)` as the `radix`, which we don't want. `unary(..)` creates a function that will ignore this `index` argument.

We could also have solved this with `partialRight(parseInt,10)`, which also creates a unary function where the `radix` argument has already been preset to `10`.

### One For One

Speaking of functions with only one argument, another common base operation in the FP toolbelt is a function that simply takes one argument and does nothing but return it untouched. This is often referred to as the *identity* function.

Consider:

```js
function identity(v) {
	return v;
}

// ES6 => form:
var identity = v => v;
```

We haven't talked about function composition, or `reduce(..)`, yet (I promise, we will!), but a place where `identity(..)` can be useful is when you need an initial value for function composition via a reduction:

```js
function composeLeft(fn1,fn2){
	return function composed(v) {
		return fn2( fn1( v ) );
	};
}

var listOfOps = [
	function add1(v) { return v + 1; },
	function mul2(v) { return v * 2; },
	function pow3(v) { return Math.pow( v, 3 ); }
];

var calc1 = listOfOps.reduce( composeLeft, identity );
var calc2 = [].reduce( composeLeft, identity );

calc1( 3 );				// 512
calc2( 3 );				// 3
```

For `calc1(..)`, the `identity(..)` function receives the initial `3` and simply returns it back, so it can be passed into `add1(..)` function. For `calc2(..)`, where the array was empty, the value `3` passes straight through unchanged because of `identity(..)`.

## No Points

// TODO: discuss point-free style

## Summary

Partial Application is a technique for reducing the arity -- expected number of arguments to a function -- by creating a new function where some of the arguments are preset.

Currying is a special form of partial application where the arity is reduced to 1, with a chain of successive chained function calls, each which takes one argument. Once all arguments have been specified by these function calls, the original function is executed with all the collected arguments.

Operations like `unary(..)` and `identity(..)` are part of the base toolbox in FP.
