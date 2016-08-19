# Functional-Light JavaScript
# Chapter 1: Functional Functions

> Functional programmer: (noun) One who names variables "x", names functions "f", and names code patterns "zygohistomorphic prepromorphism"
>
> James Iry ‏@jamesiry 5/13/15
> https://twitter.com/jamesiry/status/598547781515485184

Functional Programming (FP) is not a new concept by any means. It's been around almost as long as any programming has been around. I don't know if it's fair to say, but it sure hasn't seemed like as mainstream of a concept in the overall developer world until perhaps the last few years. I think FP has more been the realm of academics.

But that's all changing. There's a groundswell of interest growing around FP, not just at the languages level but even in libraries and frameworks. You very well might be reading this text because you've finally realized FP is something you can't ignore any longer. Or maybe you're like me and you've tried to learn FP many times before but struggled to wade through all the terms or mathematical notation.

Whatever your reason for reading this book, welcome to the party!

We're going to approach FP from the ground up, and uncover the basic foundational principles that I believe all formal FPers would admit are the framework for everything they do. But we'll stay arms length away from any of the intimidating terminology or notation that can so easily frustrate learners.

Functional Programming is not just programming with functions. Oh if only it was that easy, I could end the book right here! But in a way, the function *is* at the center of FP. And yet, how sure are you that you know what is meant by *function*?

## What Is A Function?

The most natural place I can think of to start tackling functional programming is with the *function*. That may seem too simplistic and too obvious, but I think our journey needs a solid first step, and this is it.

So... what is a function?

### Brief Math Review

I know I've promised we'd stay away from math notation as much as possible, but let's just quickly observe some simple things about functions and graphs from basic algebra before we move on.

Do you remember learning anything about `f(x)` back in school? What about the equation `y = f(x)`?

Let's say an equation is defined like this: `f(x) = 2x^2 + 3`. What does that mean? What does it mean to graph that equation? Here's the graph:

<img src="fig1.png">

What you can notice is that for any value of `x`, say `2`, if you plug it into the equation, you get `11`. What is `11`, though? It's the *return value* of the `f(x)` function, which earlier we said represents a `y` value.

In other words, there's a point at `(2,11)` on that curve in the graph. And for every value of `x` we plug in, we get another `y` value that pairs with it as a coordinate for a point. Another is `(0,3)`, and another is `(-1,5)`. Put all those points together, and you have the graph of that parabolic curve as shown above.

So what's any of this got to do with FP?

In math, a function always takes input(s), and always gives an output. Those inputs and outputs are often interpreted as parts of coordinates to be graphed.

In our programs, however, we can define functions with all sorts of inputs and output(s), and they need not have any relationship to a curve on a graph.

### Function vs Procedure

So why all the talk of math and graphs? Because in a sense functional programming is about embracing using functions as *functions* in this mathematical sense.

You're probably most used to thinking of functions as general procedures. What is a procedure? An arbitrary collection of functionality. It may have inputs, it may not. It may have an output (`return` value), it may not.

But a function specifically takes input(s), and definitely always has a `return` value.

So the first observation I'd make about functional programming is that **you should be using functions as much as possible**, and not procedures. As much as possible, all your functions should take input(s) and return output(s). Why? The answer to that will have many levels of meaning that we'll uncover throughout this book.

## Function Input

By our current definition, all functions need input.

You sometimes hear people refer to them as "arguments" and sometimes as "parameters". So what's that all about?

Simple: *arguments* are the values you pass in, and *parameters* are the named variables inside the functions that receive those passed in values. Example:

```js
function foo(x,y) {
	// ..
}

var a = 3;

foo( a, a * 2 );
```

`a` and `a * 2` (actually, the result of that expression, `6`) are the *arguments* to the `foo(..)` call. `x` and `y` are the *parameters* that receive the argument values (`3` and `6`, respectively).

**Note:** In JavaScript, there's no requirement that the number of *arguments* matches the number of *parameters*. If you pass more *arguments* than you have declared *parameters* to receive them, the values pass in just fine untouched. There's a few different ways to access them, including the deprecated `arguments` object you may have heard of before. If you pass fewer *arguments* than the declared *parameters*, each unaccounted-for parameter simply acts as an "undefined" variable, meaning it's present and available in the scope of the function, but just has the empty `undefined` value.

### Counting Inputs

The number of arguments a function *expects* -- meaning, how many arguments you'll probably want to pass to it -- is determined by the number of parameters that are declared.

```js
function foo(x,y,z) {
	// ..
}
```

`foo(..)` here expects three arguments, because it has three declared parameters. This count has a special term: arity. Arity is the count of parameters for a function. The arity of the above `foo(..)` is `3`.

You may wish to inspect a function reference during the runtime of a program to determine its arity. This can be done with the `length` property of that function reference:

```js
function foo(x,y,z) {
	// ..
}

foo.length;			// 3
```

One reason for determining the arity during execution would be if a piece of code received a function reference from multiple sources, and sent different values depending on the arity of each.

For example, imagine a case where an `fn` function reference could expect one, two, or three arguments, but you always want to pass a variable `x` in the last position:

```js
// `fn` is set to some function reference
// `x` exists with some value

if (fn.length == 1) {
	fn( x );
}
else if (fn.length == 2) {
	fn( undefined, x );
}
else if (fn.length == 3) {
	fn( undefined, undefined, x );
}
```

**Tip:** The `length` property of a function is read-only and it's determined at the time you declare the function. It should be thought of as essentially a piece of metadata that describes something about the intended usage of the function.

What about counting the number of arguments a function receives? This used to be trivial, but now the situation is slightly more complicated. In the original version(s) of JavaScript, each function had an `arguments` object (array-like) that held a reference to all the arguments passed in. You could then inspect the `length` property of `arguments` to figure out how many were actually passed.

```js
function foo(x,y,z) {
	console.log( arguments.length );	// 2
}

foo( 3, 4 );
```

As of ES5, `arguments` is deprecated. It'll almost certainly never be removed -- in JS we "never" break backwards-compatibility -- but it's strongly suggested for a whole range of reasons that you avoid using it whenever possible.

However, I'm going to suggest to you that `arguments.length`, and only that, is OK to keep using for those cases where you need to care about the passed number of arguments. There's talk that a future version of JS will restore the ability to determine length of arguments list without `arguments.length`; if that happens, then we can fully get rid of `arguments`.

Be warned: **never** access arguments positionally, like `arguments[1]`.

Except... how will you access an argument that was passed in a position beyond the declared parameters? I'll answer that in a moment; but first, take a step back and ask yourself, "Why would I want to allow that?". Seriously. Think about that hard for a minute.

It should be pretty rare that this occurs; it shouldn't be something you regularly expect or rely on when writing your functions. If you find yourself in such a scenario, spend an extra 20 minutes trying to design the interaction with that function in a different way. Name that extra argument even if it's exceptional. Don't make a function signature that can just accept an indeterminate amount of arguments if you can avoid it.

**Note:** You'll understand later in the book why I'm making such a big deal out of this point about indeterminate numbers of arguments.

OK, enough harping on that point. Say you do need to access the arguments in a positional array-like way, possibly because you're accessing an argument that doesn't have a formal parameter at that position. How do we do it?

ES6 to the rescue! Let's declare our function with the `...` operator -- variously referred to as "spread", "rest", or (my preference) "gather".

```js
function foo(x,y,z,...args) {
	// ..
}
```

See the `...args` in the parameter list? That's a new ES6 declarative form that tells the engine to collect (ahem, "gather") all remaining arguments (if any) not assigned to named parameters, and put them in a real array named `args`. `args` will always be an array, even if it's empty. But it **will not** include values that are assigned to the `x`, `y`, and `z` parameters, only anything else that's passed in beyond those first three values.

```js
function foo(x,y,z,...args) {
	console.log( x, y, z, args );
}

foo();					// undefined undefined undefined []
foo( 1, 2, 3 );			// 1 2 3 []
foo( 1, 2, 3, 4 );		// 1 2 3 [ 4 ]
foo( 1, 2, 3, 4, 5 );	// 1 2 3 [ 4, 5 ]
```

So, if you *really* want to be design a function that can account for an arbitrary number of arguments to be passed in, use `...args` (or whatever name you like) on the end. Now, you'll have a real, non-deprecated, non-yucky array to access those argument values from.

Just pay attention to the fact that the value `4` is at position `0` of that `args`, not position `3`. And its `length` value won't include those three `1`, `2`, and `3` values. Do the math.

You *can* use the `...` operator in the parameter list even if there's no formal parameters declared:

```js
function foo(...args) {
	// ..
}
```

Now `args` will be the full array of arguments, whatever they are, and you can use `args.length` to know exactly how many arguments have been passed in. And you're safe to use `args[1]` or `args[317]` if you so choose. Please don't pass in 318 arguments, though.

Speaking of ES6 goodies, there's a few other tricks you may want to know about with your function arguments and parameters. For more information on them, see Chapter 2 of my "You Don't Know JS: ES6 & Beyond" book.

#### Argument Tricks

What if you wanted to pass along an array of values as the arguments in your function call?

```js
function foo(...args) {
	console.log( args[3] );
}

var arr = [ 1, 2, 3, 4, 5 ];

foo( ...arr );						// 4
```

There's our new friend `...`, but here it's used not in the parameter list but in the argument list. It has the opposite behavior in this context. In a parameter list, we said it *gathered* arguments together. In an argument list, it *spreads* them out. So the contents of `arr` are actually spread out as individual arguments to the `foo(..)` call. See how that's different from just passing in a reference to the whole `arr` array?

By the way, values and multiple `...` spreadings can be interleaved, as you see fit:

```js
function foo(...args) {
	console.log( args[3] );
}

var arr = [ 2 ];

foo( 1, ...arr, 3, ...[4,5] );		// 4
```

Think of `...` in the symmetric sense: in a value position, it *spreads*. In an assignment position -- like a parameter list, because arguments get *assigned to* parameters -- it *gathers*.

Whichever behavior you invoke, it makes working with arrays of arguments much easier. Gone are the days of `slice(..)`, `concat(..)` and `apply(..)` to wrangle our argument value arrays.

#### Parameter Tricks

As of ES6, parameters can have declared *default values*. In the case where the argument for that parameter is not passed, or it's passed as the value `undefined`, the default assignment expression takes over.

Consider:

```js
function foo(x = 3) {
	console.log( x );
}

foo();				// 3
foo( undefined );	// 3
foo( null );		// null
foo( 0 );			// 0
```

**Note:** We won't cover it here in any more detail, but the default value expression is lazy meaning it's not evaluated unless and until needed. Also, it can be any valid JS expression, even a function call. There's lots of cool tricks you can do with that capability. For example, you could declare `x = required()` in your parameter list, and in the `required()` function simply `throw "This argument is required."` to make sure someone always calls your function with that argument/parameter specified.

Another ES6 trick we can use with our parameters is called "destructuring". We'll only glance briefly at it because this topic is fantastically more complex than we have space to cover here. But again, refer to my "ES6 & Beyond" book for lots more info.

Remember our `foo(..)` from before that could receive as many as 318 arguments!?

```js
function foo(...args) {
	// ..
}

foo( ...[1,2,3] );
```

What if we wanted to change that interaction so the caller of our function passes in an array of values instead of individual argument values? Easy. We just drop the two `...` usages:

```js
function foo(args) {
	// ..
}

foo( [1,2,3] );
```

Simple enough. But what if now we wanted to give a parameter name to the first two values passed in? We aren't declaring individual parameters anymore, so it seems we lost that ability. Destructuring is the answer:

```js
function foo( [x,y,...args] ) {
	// ..
}

foo( [1,2,3] );
```

Do you spot the `[ .. ]` brackets in the argument list now? That's array destructuring. Destructuring is a way to declaratively list a *pattern* for the kind of structure (object, array, etc) that you expect to see, and how decomposition into its individual parts should happen.

In this example, destructuring tells the engine that an array is expected in this assignment position (aka parameter). The pattern says to take the first value of that array and assign to a local parameter variable called `x`, the second to `y`, and whatever is left is *gathered* into `args`.

You could have done that same thing manually like this:

```js
function foo(params) {
	var x = params[0];
	var y = params[1];
	var args = params.slice( 2 );

	// ..
}
```

But now we start to uncover the first bits of a principle that we'll come back to many more times in this text: declarative code often communicates more cleanly than imperative code.

Declarative code, like destructuring in the earlier snippet, focuses on what the outcome of a piece of code should be. Imperative code, like the manual assignments just shown, focuses more on how to get the outcome. If you later read the code, you have to mentally execute it to understand the desired outcome. The outcome is *coded* there, but it's implicit.

Wherever possible, and to whatever degrees our language and our libraries/frameworks will let us, **we should be striving for declarative and self-explanatory code.**

Just as we can destructure arrays, we can destructure object parameters:

```js
function foo( {x,y} ) {
	console.log( x, y );
}

foo( {
	y: 3
} );				// undefined 3
```

We pass in an object as the single argument, and it's destructured into two separate parameter variables `x` and `y`, which are assigned the values of those corresponding property names from the object passed in. It didn't matter that the `x` property wasn't on the object; it just ended up as a variable with `undefined` like you'd expect.

But the part of parameter object destructuring I want you to pay attention to is the object being passed into `foo(..)`.

With a normal call-site like `foo(undefined,3)`, position is used to map from argument to parameter; we put the `3` in the second position to get it assigned to a `y` parameter. But at this new kind of call-site where parameter destructuring is involved, a simple object-property indicates which parameter (`y`) the argument value `3` should be assigned to.

We didn't have to account for `x` in *that* new call-site because in effect we didn't care about `x`. We just omitted it, instead of having to do something silly (read: distracting) like passing `undefined`.

This pattern is approximating a feature that some languages have, which JS does not officially: named arguments.

It will not be obvious at all right now why passing in an object that's destructured via its parameter is a benefit, especially to FP. The benefit will be that a function that only takes one parameter (the object) is much easier to compose with another function that also only takes a single parameter. Trust me for now. We'll come back to that point later in the text, in quite a bit of detail.

## Function Output

In JavaScript, functions always return a value. These three functions all have identical return behavior:

```js
function foo() {}

function bar() {
	return;
}

function baz() {
	return undefined;
}
```

The `undefined` value is implicitly `return`ed if you have no `return` or if you just have an empty `return;`.

But keeping as much with the spirit of FP function definition as possible -- using functions and not procedures -- our functions should always have outputs, which means they should explicitly `return` a value.

A `return` statement can only return a single value. So if your function needs to return multiple values, your only viable option is to collect them into a compound value like an array or an object:

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}
```

Just like destructuring lets us de-construct array/object values in parameters, we can also do so in regular assignments:

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}

var [ x, y ] = foo();
console.log( x + y );
```

Structuring the multiple values into an array (or object) and subsequently destructuring those values back into distinct assignments is a way to transparently handle multiple outputs for a function.

**Tip:** I'd be remiss if I didn't suggest you take a moment to consider if a function needing multiple outputs could be refactored to avoid that, perhaps separated into two or more smaller functions. Sometimes that will be possible, sometimes not, but you should at least consider it.

### Early Returns

The `return` statement doesn't just return a value from a function, though. It's also a flow control structure; it ends the execution of the function at that point. A function with multiple `return` statements thus has multiple possible exit points, meaning that it may be harder to read a function to understand its behavior if there are many paths that output.

### Non-`return` Outputs

One technique that you've probably used in most code you've written, and maybe didn't even think about it much, is to have a function output some or all of its values by simply changing variables.

Remember our `y = f(x) = 2x^2 + 3` function from earlier in the chapter? We could have defined it like this:

```js
var y;

function foo(x) {
	y = (2 * Math.pow( x, 2 )) + 3;
}

foo( 2 );

y;		// 11
```

I know this is a silly example, because you can clearly see we could just as easily have `return`d the value instead of setting it into `y` from within the function:

```js
function foo(x) {
	return (2 * Math.pow( x, 2 )) + 3;
}

var y = foo( 2 );

y;		// 11
```

Both functions accomplish the same task. Is there any reason we should pick one over the other? **Yes, absolutely.**

One way to frame the difference is that the `return` in the latter version signals an explicit output, whereas the `y` assignment in the former is an implicit output. You may already have some intuition that guides you in such cases; typically, developers prefer explicit patterns over implicit ones.

But changing a variable in an outer scope, as we did with the `y` assignment inside of `foo(..)`, is just one way of achieving an implicit output. A more subtle form of this behavior is making changes to non-local values via reference.

Consider:

```js
function sum(list) {
	var total = 0;
	for (var i = 0; i < list.length; i++) {
		if (!list[i]) list[i] = 0;

		total = total + list[i];
	}

	return total;
}

var nums = [ 1, 3, 9, 27, , 84 ];

sum( nums );		// 124
```

The most obvious output from this function is the sum `124`. But do you spot the other output?

Try that code and then inspect the `nums` array. Now do you spot the difference? Instead of an `undefined` empty slot value in position `4`, now there's a `0`. The harmless looking `list[i] = 0` operation ended up affecting the array value on the outside, even though we operated on a local `list` parameter variable.

Why? Because `list` holds a reference-copy of the `nums` reference, not a value-copy of the `[1,3,9,..]` array value. Because JS uses references and reference-copies for arrays, objects, and functions, we can create an output from our function all too easily, even if by accident.

This implicit function output has a special name in the FP world: side effects. And a function that has *no side effects* also has a special name: pure function. We'll talk a lot more about these in a later chapter, but the punchline is that we'll want to prefer pure functions and avoid side effects if at all possible.

## Functions Of Functions

Functions can receive and return values of any type. There's a special term for when a function receives or returns one or more other functions: higher-order function.

## Syntax

So far we've been using the full canonical syntax for functions. But you've no doubt also heard all the buzz about the new ES6 `=>` arrow function syntax.

## Summary

Functions are cool.
