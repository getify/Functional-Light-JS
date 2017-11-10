# Functional-Light JavaScript
# Chapter 3: Managing Function Inputs

Chapter 2 explored the core nature of JS `function`s, and layed the foundation for what makes a `function` an FP *function*. But to leverage the full power of FP, we also need patterns and practices for manipulating functions to shift and adjust their interactions -- to bend them to our will.

Specifically, our attention for this chapter will be on the parameter inputs of functions. As you bring functions of all different shapes together in your programs, you'll quickly face incompatibilities in the number/order/type of inputs, as well as the need to specify some inputs at different times than others.

As a matter of fact, for stylistic purposes of readability, sometimes you'll want to define functions in a way that hides their inputs entirely!

These kinds of techniques are absolutely essential to making functions truly *function*-al.

## All For One

Imagine you're passing a function to a utility, where the utility will send multiple arguments to that function. But you may only want the function to receive a single argument.

We can design a simple helper that wraps a function call to ensure only one argument will pass through. Since this is effectively enforcing that a function is treated as unary, let's name it as such:

```js
function unary(fn) {
    return function onlyOneArg(arg){
        return fn( arg );
    };
}
```

Many FPers tend to prefer the shorter `=>` arrow function syntax for such code (see Chapter 1 "Syntax"), such as:

```js
var unary =
    fn =>
        arg =>
            fn( arg );
```

**Note:** No question this is more terse, sparse even. But I personally feel that whatever it may gain in symmetry with the mathematical notation, it loses more in overall readability with the functions all being anonymous, and by obscuring the scope boundaries, making deciphering closure a little more cryptic.

A commonly cited example for using `unary(..)` is with the `map(..)` utility (see Chapter 9) and `parseInt(..)`. `map(..)` calls a mapper function for each item in a list, and each time it invokes the mapper function, it passes in 3 arguments: `value`, `idx`, `arr`.

That's usually not a big deal, unless you're trying to use something as a mapper function that will behave incorrectly if it's passed too many arguments. Consider:

```js
["1","2","3"].map( parseInt );
// [1,NaN,NaN]
```

For the signature `parseInt(str,radix)`, it's clear that when `map(..)` passes `index` in the second argument position, it's interpreted by `parseInt(..)` as the `radix`, which we don't want.

`unary(..)` creates a function that will ignore all but the first argument passed to it, meaning the passed in `index` is never received by `parseInt(..)` and mistaken as the `radix`:

```js
["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

### One On One

Speaking of functions with only one argument, another common base utility in the FP toolbelt is a function that takes one argument and does nothing but return the value untouched:

```js
function identity(v) {
    return v;
}

// or the ES6 => arrow form
var identity =
    v =>
        v;
```

This utility looks so simple as to hardly be useful. But even simple functions can be helpful in the world of FP. Like they say in acting: there are no small parts, only small actors.

For example, imagine you'd like to split up a string using a regular expression, but the resulting array may have some empty values in it. To discard those, we can use JS's `filter(..)` array operation (see Chapter 9) with `identity(..)` as the predicate:

```js
var words = "   Now is the time for all...  ".split( /\s|\b/ );
words;
// ["","Now","is","the","time","for","all","...",""]

words.filter( identity );
// ["Now","is","the","time","for","all","..."]
```

Since `identity(..)` simply returns the value passed to it, JS coerces each value into either `true` or `false`, and that determines whether to keep or exclude each value in the final array.

**Tip:** Another unary function that can be used as the predicate in the previous example is JS's built-in `Boolean(..)` function, which explicitly coerces a value to `true` or `false`.

Another example of using `identity(..)` is as a default function in place of a transformation:

```js
function output(msg,formatFn = identity) {
    msg = formatFn( msg );
    console.log( msg );
}

function upper(txt) {
    return txt.toUpperCase();
}

output( "Hello World", upper );     // HELLO WORLD
output( "Hello World" );            // Hello World
```

You also may see `identity(..)` used as a default transformation function for `map(..)` calls or as the initial value in a `reduce(..)` of a list of functions; both of these utilities will be covered in Chapter 9.

### Unchanging One

Certain APIs don't let you pass a value directly into a method, but require you to pass in a function, even if that function literally just returns the value. One such API is the `then(..)` method on JS Promises:

```js
// doesn't work:
p1.then( foo ).then( p2 ).then( bar );

// instead:
p1.then( foo ).then( function(){ return p2; } ).then( bar );
```

Many claim that ES6 `=>` arrow functions are the best "solution":

```js
p1.then( foo ).then( () => p2 ).then( bar );
```

But there's an FP utility that's more well suited for the task:

```js
function constant(v) {
    return function value(){
        return v;
    };
}

// or the ES6 => form
var constant =
    v =>
        () =>
            v;
```

With this tidy little FP utility, we can solve our `then(..)` annoyance properly:

```js
p1.then( foo ).then( constant( p2 ) ).then( bar );
```

**Warning:** Although the `() => p2` arrow function version is shorter than `constant(p2)`, I would encourage you to resist the temptation to use it. The arrow function is returning a value from outside of itself, which is a bit worse from the FP perspective. We'll cover the pitfalls of such actions later in the text, in Chapter 5 "Reducing Side Effects".

## Adapting Arguments To Parameters

There are a variety of patterns and tricks we can use to adapt a function's signature to match the kinds of arguments we want to provide to it.

Recall this function signature from Chapter 2 which highlights using array parameter destructuring:

```js
function foo( [x,y,...args] = [] ) {
```

This pattern is handy if an array will be passed in but you want to treat its contents as individual parameters. `foo(..)` is thus technically unary -- when it's executed, only one argument (an array) will be passed to it. But inside the function, you get to address different inputs (`x`, `y`, etc) individually.

However, sometimes you won't have the ability to change the declaration of the function to use array parameter destructuring. For example, imagine these functions:

```js
function foo(x,y) {
    console.log( x + y );
}

function bar(fn) {
    fn( [ 3, 9 ] );
}

bar( foo );         // fails
```

Do you spot why `bar(foo)` fails?

The array `[3,9]` is sent in as a single value to `fn(..)`, but `foo(..)` expects `x` and `y` separately. If we could change the declaration of `foo(..)` to be `function foo([x,y]) { ..`, we'd be fine. Or, if we could change the behavior of `bar(..)` to make the call as `fn(...[3,9])`, the values `3` and `9` would be passed in individually.

There will be occasions when you have two functions that are imcompatible in this way, and you won't be able to change their declarations/definitions. So, how can you use them together?

We can define a helper to adapt a function so that it spreads out a single received array as its individual arguments:

```js
function spreadArgs(fn) {
    return function spreadFn(argsArr) {
        return fn( ...argsArr );
    };
}

// or the ES6 => arrow form
var spreadArgs =
    fn =>
        argsArr =>
            fn( ...argsArr );
```

**Note:** I called this helper `spreadArgs(..)`, but in libraries like Ramda it's commonly called `apply(..)`.

Now we can use `spreadArgs(..)` to adapt `foo(..)` to work as the proper input to `bar(..)`:

```js
bar( spreadArgs( foo ) );           // 12
```

It won't seem clear yet why these occassions will arise, but you will see them often. Essentially, `spreadArgs(..)` will allow us to define functions that `return` multiple values via an array, but still have those multiple values treated independently as inputs to another function.

While we're talking about a `spreadArgs(..)` utility, let's also define a utility to handle the opposite action:

```js
function gatherArgs(fn) {
    return function gatheredFn(...argsArr) {
        return fn( argsArr );
    };
}

// or the ES6 => arrow form
var gatherArgs =
    fn =>
        (...argsArr) =>
            fn( argsArr );
```

**Note:** In Ramda, this utility is referred to as `unapply(..)`, being that it's the opposite of `apply(..)`. I think the "spread" / "gather" terminology is a little more descriptive for what's going on.

We can use this utility to gather individual arguments into a single array, perhaps because we want to adapt a function with array parameter destructuring to another utility that passes arguments separately. We will cover `reduce(..)` in Chapter 9, but briefly: it repeatedly calls its reducer function with two individual parameters, which we can now *gather* together:

```js
function combineFirstTwo([ v1, v2 ]) {
    return v1 + v2;
}

[1,2,3,4,5].reduce( gatherArgs( combineFirstTwo ) );
// 15
```

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

Let's define a `partial(..)` utility:

```js
function partial(fn,...presetArgs) {
    return function partiallyApplied(...laterArgs){
        return fn( ...presetArgs, ...laterArgs );
    };
}

// or the ES6 => arrow form
var partial =
    (fn,...presetArgs) =>
        (...laterArgs) =>
            fn( ...presetArgs, ...laterArgs );
```

**Tip:** Don't just take this snippet at face value. Take a few moments to digest what's going on with this utility. Make sure you really *get it*.

The `partial(..)` function takes an `fn` for which function we are partially applying. Then, any subsequent arguments passed in are gathered into the `presetArgs` array and saved for later.

A new inner function (called `partiallyApplied(..)` just for clarity) is created and `return`ed, whose own arguments are gathered into an array called `laterArgs`.

Notice the references to `fn` and `presetArgs` inside this inner function? How does that work? After `partial(..)` finishes running, how does the inner function keep being able to access `fn` and `presetArgs`? If you answered **closure**, you're right on track! The inner function `partiallyApplied(..)` closes over both the `fn` and `presetArgs` variables so it can keep accessing them later, no matter where the function runs. This is why understanding closure is critical!

When the `partiallyApplied(..)` function is later executed somewhere else in your program, it uses the closed over `fn` to execute the original function, first providing any of the (closed over) `presetArgs` partial application arguments, then any further `laterArgs` arguments.

If any of that was confusing, stop and go re-read it. Trust me, you'll be glad you did as we get further into the text.

Let's now use the `partial(..)` utility to make those earlier partially-applied functions:

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
    var getPerson = function innerPartiallyApplied(...innerLaterArgs){
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

Now, imagine we'd like take a list of numbers and add a certain number to each of them. We'll use the `map(..)` (see Chapter 9) utility built into JS arrays:

```js
[1,2,3,4,5].map( function adder(val){
    return add( 3, val );
} );
// [4,5,6,7,8]
```

The reason we can't pass `add(..)` directly to `map(..)` is because the signature of `add(..)` doesn't match the mapping function that `map(..)` expects. That's where partial application can help us: we can adapt the signature of `add(..)` to something that will match.

```js
[1,2,3,4,5].map( partial( add, 3 ) );
// [4,5,6,7,8]
```

The `partial(add,3)` call produces a new unary function which is expecting only one more argument.

The `map(..)` utility will loop through the array (`[1,2,3,4,5]`) and repeatedly call this unary function, once for each of those values, respectively. So, the calls made will effectively be `add(3,1)`, `add(3,2)`, `add(3,3)`, `add(3,4)`, and `add(3,5)`. The array of those results is `[4,5,6,7,8]`.

### `bind(..)`

JavaScript functions all have a built-in utility called `bind(..)`. It has two capabilities: presetting the `this` context and partially applying arguments.

I think this is incredibly misguided to conflate these two capabilities in one utility. Sometimes you'll want to hard-bind the `this` context and not partially apply arguments. Other times you'll want to partially apply arguments but not care about `this` binding at all. I have never needed both at the same time.

The latter scenario (partial application without setting `this` context) is awkward because you have to pass an ignorable placeholder for the `this`-binding argument (the first one), usually `null`.

Consider:

```js
var getPerson = ajax.bind( null, "http://some.api/person" );
```

That `null` just bugs me to no end. Despite this *this* annoyance, it's mildly convenient that JS has a built-in utility for partial application. However, most FP programmers prefer using the dedicated `partial(..)` utility in their chosen FP library.

### Reversing Arguments

Recall that the signature for our Ajax function is: `ajax( url, data, cb )`. What if we wanted to partially apply the `cb` but wait to specify `data` and `url` later? We could create a utility that wraps a function to reverse its argument order:

```js
function reverseArgs(fn) {
    return function argsReversed(...args){
        return fn( ...args.reverse() );
    };
}

// or the ES6 => arrow form
var reverseArgs =
    fn =>
        (...args) =>
            fn( ...args.reverse() );
```

Now we can reverse the order of the `ajax(..)` arguments, so that we can then partially apply from the right rather than the left. To restore the expected order, we'll then reverse the subsequent partially-applied function:

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

Instead of manually using `reverseArgs(..)` (twice!) for this purpose, we could define a `partialRight(..)` which partially applies from the right. Under the covers, it could use the same double-reverse trick:

```js
function partialRight(fn,...presetArgs) {
    return reverseArgs(
        partial( reverseArgs( fn ), ...presetArgs.reverse() )
    );
}

var cacheResult = partialRight( ajax, function onResult(obj){
    cache[obj.id] = obj;
});

// later:
cacheResult( "http://some.api/person", { user: CURRENT_USER_ID } );
```

Another more straightforward (and certainly more performant) implementation of `partialRight(..)` that doesn't use the double-reverse trick:

```js
function partialRight(fn,...presetArgs) {
    return function partiallyApplied(...laterArgs) {
        return fn( ...laterArgs, ...presetArgs );
    };
}

// or the ES6 => arrow form
var partialRight =
    (fn,...presetArgs) =>
        (...laterArgs) =>
            fn( ...laterArgs, ...presetArgs );
```

None of these implementations of `partialRight(..)` guarantee that a specific parameter will receive a specific partially-applied value; it only ensures that the partially-applied value(s) appear as the right-most (aka, last) argument(s) passed to the original function.

For example:

```js
function foo(x,y,z,...rest) {
    console.log( x, y, z, rest );
}

var f = partialRight( foo, "z:last" );

f( 1, 2 );          // 1 2 "z:last" []

f( 1 );             // 1 "z:last" undefined []

f( 1, 2, 3 );       // 1 2 3 ["z:last"]

f( 1, 2, 3, 4 );    // 1 2 3 [4,"z:last"]
```

The value `"z:last"` is only applied to the `z` parameter in the case where `f(..)` is called with exactly two arguments (matching `x` and `y` parameters). In all other cases, the `"z:last"` will just be the right-most argument, however many arguments precede it.

## One At A Time

Let's examine a technique similar to partial application, where a function that expects multiple arguments is broken down into successive chained functions that each take a single argument (arity: 1) and return another function to accept the next argument.

This technique is called currying.

To first illustrate, let's imagine we had a curried version of `ajax(..)` already created. This is how we'd use it:

```js
curriedAjax( "http://some.api/person" )
    ( { user: CURRENT_USER_ID } )
        ( function foundUser(user){ /* .. */ } );
```

The three sets of `(..)`s denote 3 chained function calls. But perhaps splitting out each of the three calls helps see what's going on better:

```js
var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

Instead of taking all the arguments at once (like `ajax(..)`), or some of the arguments up-front and the rest later (via `partial(..)`), this `curriedAjax(..)` function receives one argument at a time, each in a separate function call.

Currying is similar to partial application in that each successive curried call partially applies another argument to the original function, until all arguments have been passed.

The main difference is that `curriedAjax(..)` will return a function (we call `curriedGetPerson(..)`) that expects **only the next argument** `data`, not one that (like the earlier `getPerson(..)`) can receive all the rest of the arguments.

If an original function expected 5 arguments, the curried form of that function would take just the first argument, and return a function to accept the second. That one would take just the second argument, and return a function to accept the third. And so on.

So currying unwinds a single higher-arity function into a series of chained unary functions.

How might we define a utility to do this currying? Consider:

```js
function curry(fn,arity = fn.length) {
    return (function nextCurried(prevArgs){
        return function curried(nextArg){
            var args = [ ...prevArgs, nextArg ];

            if (args.length >= arity) {
                return fn( ...args );
            }
            else {
                return nextCurried( args );
            }
        };
    })( [] );
}

// or the ES6 => arrow form
var curry =
    (fn,arity = fn.length,nextCurried) =>
        (nextCurried = prevArgs =>
            nextArg => {
                var args = [ ...prevArgs, nextArg ];

                if (args.length >= arity) {
                    return fn( ...args );
                }
                else {
                    return nextCurried( args );
                }
            }
        )( [] );
```

The approach here is to start a collection of arguments in `prevArgs` as an empty `[]` array, and add each received `nextArg` to that, calling the concatenation `args`. While `args.length` is less than `arity` (the number of declared/expected parameters of the original `fn(..)` function), make and return another `curried(..)` function to collect the next `nextArg` argument, passing the running `args` collection along as its `prevArgs`. Once we have enough `args`, execute the original `fn(..)` function with them.

By default, this implementation relies on being able to inspect the `length` property of the to-be-curried function to know how many iterations of currying we'll need before we've collected all its expected arguments.

**Note:** If you use this implementation of `curry(..)` with a function that doesn't have an accurate `length` property, you'll need to pass the `arity` (the second parameter of `curry(..)`) to ensure `curry(..)` works correctly. `length` will be inaccurate if the function's parameter signature includes default parameter values, parameter destructuring, or is variadic with `...args` (see Chapter 2).

Here's how we would use `curry(..)` for our earlier `ajax(..)` example:

```js
var curriedAjax = curry( ajax );

var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

Each call partially applies one more argument to the original `ajax(..)` call, until all three have been provided and `ajax(..)` is actually invoked.

Remember our example from the discussion of partial application about adding `3` to each value in a list of numbers? As currying is similar to partial application, we could do that task with currying in almost the same way:

```js
[1,2,3,4,5].map( curry( add )( 3 ) );
// [4,5,6,7,8]
```

The difference between the two? `partial(add,3)` vs `curry(add)(3)`.

Why might you choose `curry(..)` over `partial(..)`? It might be helpful in the case where you know ahead of time that `add(..)` is the function to be adapted, but the value `3` isn't known yet:

```js
var adder = curry( add );

// later
[1,2,3,4,5].map( adder( 3 ) );
// [4,5,6,7,8]
```

Let's look at another numbers example, this time adding a list of them together:

```js
function sum(...nums) {
    var total = 0;
    for (let num of nums) {
        total += num;
    }
    return total;
}

sum( 1, 2, 3, 4, 5 );                       // 15

// now with currying:
// (5 to indicate how many we should wait for)
var curriedSum = curry( sum, 5 );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );        // 15
```

The advantage of currying here is that each call to pass in an argument produces another function that's more specialized, and we can capture and use *that* new function later in the program. Partial application specifies all the partially-applied arguments up front, producing a function that's waiting for all the rest of the arguments **on the next call**.

If you wanted to use partial application to specify one parameter (or several!) at a time, you'd have to keep calling `partial(..)` again on each successive partially-applied function. By contrast, curried functions do this automatically, making working with individual arguments one-at-a-time more ergonomic.

Both currying and partial application use closure to remember the arguments over time until all have been received, and then the original function can be invoked.

### Visualizing Curried Functions

Let's examine more closely the `curriedSum(..)` from the previous section. Recall its usage: `curriedSum(1)(2)(3)(4)(5)`; five subsequent (chained) function calls.

What if we manually defined a `curriedSum(..)` instead of using `curry(..)`, how would that look?

```js
function curriedSum(val1) {
    return function(val2){
        return function(val3){
            return function(val4){
                return function(val5){
                    return sum( val1, val2, val3, val4, val5 );
                };
            };
        };
    };
}
```

Definitely uglier, no question. But this is an important way to visualize what's going on with a curried function. Each nested function call is returning another function that's going to accept the next argument, and that continues until we've specified all the expected arguments.

I've found it helps me tremendously to understand curried functions if I can unwrap them mentally as a series of nested functions like that.

In fact, to reinforce that point, let's consider the same code but written with ES6 arrow functions:

```js
var curriedSum =
    val1 =>
        val2 =>
            val3 =>
                val4 =>
                    val5 =>
                        sum( val1, val2, val3, val4, val5 );
```

And now, all on one line: `curriedSum = val1 => val2 => val3 => val4 => val5 => sum(val1,val2,val3,val4,val5)`.

Depending on your perspective, that form of visualizing the curried function may be more or less helpful to you. For me, it's a fair bit more obscured.

But the reason I show it that way is that it happens to look almost identical to the mathematical notation (and Haskell syntax) for a curried function! That's one reason why those who like mathematical notation (and/or Haskell) like the ES6 arrow function form.

### Why Currying And Partial Application?

With either style -- currying (`sum(1)(2)(3)`) or partial application (`partial(sum,1,2)(3)`) -- the call-site unquestionably looks stranger than a more common one like `sum(1,2,3)`. So **why would we ever go this direction** when adopting FP? There are multiple layers to answering that question.

The first and most obvious reason is that both currying and partial application allow you to separate in time/space (throughout your code base) when and where separate arguments are specified, whereas traditional function calls require all the arguments to be present at the same time. If you have a place in your code where you'll know some of the arguments and another place where the other arguments are determined, currying or partial application are very useful.

Another layer to this answer, specifically for currying, is that composition of functions is much easier when there's only one argument. So a function that ultimately needs 3 arguments, if curried, becomes a function that needs just one, three times over. That kind of unary function will be a lot easier to work with when we start composing them. We'll tackle this topic later in Chapter 4.

But the most important layer is specialization of generalized functions, and how such abstraction improves readability of code.

Consider our running `ajax(..)` example:

```js
ajax(
    "http://some.api/person",
    { user: CURRENT_USER_ID },
    function foundUser(user){ /* .. */ }
);
```

The call-site includes all the information necessary to pass to the most generalized version of the utility (`ajax(..)`). The potential readability downside is that it may be the case that the URL and the data are not relevant information at this point in the program, but yet that information is cluttering up the call-site nonetheless.

Now consider:

```js
var getCurrentUser = partial(
    ajax,
    "http://some.api/person",
    { user: CURRENT_USER_ID }
);

// later

getCurrentUser( function foundUser(user){ /* .. */ } );
```

In this version, we define a `getCurrentUser(..)` function ahead of time that already has known information like URL and data preset. The call-site for `getCurrentUser(..)` then isn't cluttered by information that **at that point of the code** isn't relevant.

Moreover, the semantic name for the function `getCurrentUser(..)` more accurately depicts what is happening than just `ajax(..)` with a URL and data would.

That's what abstraction is all about: separating two sets of details -- in this case, the *how* of getting a current user and the *what* we do with that user -- and inserting a semantic boundary between them, which eases the reasoning of each part independently.

Whether you use currying or partial application, creating specialized functions from generalized ones is a powerful technique for semantic abstraction and improved readability.

### Currying More Than One Argument?

The definition and implementation I've given of currying thus far is, I believe, as true to the spirit as we can likely get in JavaScript.

Specifically, if we look briefly at how currying works in Haskell, we can observe that multiple arguments always go in to a function one at a time, one per curried call -- other than tuples (analogus to arrays for our purposes) that transport multiple values in a single argument.

For example, in Haskell:

```js
foo 1 2 3
```

This calls the `foo` function, and has the result of passing in three values `1`, `2`, and `3`. But functions are automatically curried in Haskell, which means each value goes in as a separate curried-call. The JS equivalent of that would look like `foo(1)(2)(3)`, which is the same style as the `curry(..)` I presented above.

**Note:** In Haskell, `foo (1,2,3)` is not passing in those 3 values at once as three separate arguments, but a tuple (kinda like a JS array) as a single argument. To work, `foo` would need to be altered to handle a tuple in that argument position. As far as I can tell, there's no way in Haskell to pass all three arguments separately with just one function call; each argument gets its own curried-call. Of course, the presence of multiple calls is transparent to the Haskell developer, but it's a lot more syntactically obvious to the JS developer.

For these reasons, I think the earlier `curry(..)` that I demonstrated is a faithful adaptation, or what I might call "strict currying". However, it's important to note that there's a looser definition used in most popular JavaScript FP libraries.

Specifically, JS currying utilities typically allow you to specify multiple arguments for each curried-call. Revisiting our `sum(..)` example from before, this would look like:

```js
var curriedSum = looseCurry( sum, 5 );

curriedSum( 1 )( 2, 3 )( 4, 5 );            // 15
```

We see a slight syntax savings of fewer `( )`, and an implied performance benefit of now having three function calls instead of five. But other than that, using `looseCurry(..)` is identical in end result to the narrower `curry(..)` definition from earlier. I would guess the convenience/performance factor is probably why frameworks allow multiple arguments. This seems mostly like a matter of taste.

We can adapt our previous currying implementation to this common looser definition:

```js
function looseCurry(fn,arity = fn.length) {
    return (function nextCurried(prevArgs){
        return function curried(...nextArgs){
            var args = [ ...prevArgs, ...nextArgs ];

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

### No Curry For Me, Please

It may also be the case that you have a curried function that you'd like to essentially un-curry -- basically, to turn a function like `f(1)(2)(3)` back into a function like `g(1,2,3)`.

The standard utility for this is (un)shockingly typically called `uncurry(..)`. Here's a simple naive implementation:

```js
function uncurry(fn) {
    return function uncurried(...args){
        var ret = fn;

        for (let arg of args) {
            ret = ret( arg );
        }

        return ret;
    };
}

// or the ES6 => arrow form
var uncurry =
    fn =>
        (...args) => {
            var ret = fn;

            for (let arg of args) {
                ret = ret( arg );
            }

            return ret;
        };
```

**Warning:** Don't just assume that `uncurry(curry(f))` has the same behavior as `f`. In some libs the uncurrying would result in a function like the original, but not all of them; certainly our example here does not. The uncurried function acts (mostly) the same as the original function if you pass as many arguments to it as the original function expected. However, if you pass fewer arguments, you still get back a partially curried function waiting for more arguments; this quirk is illustrated in the next snippet.

```js
function sum(...nums) {
    var sum = 0;
    for (let num of nums) {
        sum += num;
    }
    return sum;
}

var curriedSum = curry( sum, 5 );
var uncurriedSum = uncurry( curriedSum );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );        // 15

uncurriedSum( 1, 2, 3, 4, 5 );              // 15
uncurriedSum( 1, 2, 3 )( 4 )( 5 );          // 15
```

Probably the more common case of using `uncurry(..)` is not with a manually curried function as just shown, but with a function that comes out curried as a result of some other set of operations. We'll illustrate that scenario later in this chapter in the "No Points" discussion.

## Order Matters

In Chapter 2, we explored the named arguments pattern. One primary advantage of named arguments is not needing to juggle argument ordering, thereby improving readability.

Now, we've looked at the advantages of using currying/partial application to provide individual arguments to a function separately. But the downside is that these techniques are traditionally based on positional arguments; argument ordering is thus an inevitable headache.

Utilities like `reverseArgs(..)` (and others) are necessary to juggle arguments to get them into the right order. Sometimes we get lucky and define a function with parameters in the order that we later want to curry them, but other times that order is incompatible and we have to jump through hoops to reorder.

The frustration is not merely that we need to use some utility to juggle the properties, but the fact that the usage of the utility clutters up our code a bit with extra noise. These kinds of things are like little paper cuts; one here or there isn't a showstopper, but the pain can certainly add up.

Can we improve currying/partial application to free it from these ordering concerns? Let's apply the tricks from named arguments style and invent some helper utilities for this adaptation:

```js
function partialProps(fn,presetArgsObj) {
    return function partiallyApplied(laterArgsObj){
        return fn( Object.assign( {}, presetArgsObj, laterArgsObj ) );
    };
}

function curryProps(fn,arity = 1) {
    return (function nextCurried(prevArgsObj){
        return function curried(nextArgObj = {}){
            var [key] = Object.keys( nextArgObj );
            var allArgsObj = Object.assign( {}, prevArgsObj, { [key]: nextArgObj[key] } );

            if (Object.keys( allArgsObj ).length >= arity) {
                return fn( allArgsObj );
            }
            else {
                return nextCurried( allArgsObj );
            }
        };
    })( {} );
}
```

**Tip:** We don't even need a `partialPropsRight(..)` because we don't need care about what order properties are being mapped; the name mappings make that ordering concern moot!

Here's how to use those helpers:

```js
function foo({ x, y, z } = {}) {
    console.log( `x:${x} y:${y} z:${z}` );
}

var f1 = curryProps( foo, 3 );
var f2 = partialProps( foo, { y: 2 } );

f1( {y: 2} )( {x: 1} )( {z: 3} );
// x:1 y:2 z:3

f2( { z: 3, x: 1 } );
// x:1 y:2 z:3
```

Even with currying or partial application, order doesn't matter anymore! We can now specify which arguments we want in whatever sequence makes sense. No more `reverseArgs(..)` or other nuisances. Cool!

**Tip:** If this style of function arguments seems useful or interesting to you, check out coverage of my "FPO" library in Appendix C.

### Spreading Properties

Unfortunately, we can only take advantage of currying with named arguments if we have control over the signature of `foo(..)` and define it to destructure its first parameter. What if we wanted to use this technique with a function that had its parameters indivdually listed (no parameter destructuring!), and we couldn't change that function signature? For example:

```js
function bar(x,y,z) {
    console.log( `x:${x} y:${y} z:${z}` );
}
```

Just like the `spreadArgs(..)` utility earlier, we could define a `spreadArgProps(..)` helper that takes the `key: value` pairs out of an object argument and "spreads" the values out as individual arguments.

There are some quirks to be aware of, though. With `spreadArgs(..)`, we were dealing with arrays, where ordering is well defined and obvious. However, with objects, property order is less clear and not necessarily reliable. Depending on how an object is created and properties set, we cannot be absolutely certain what enumeration order properties would come out.

Such a utility needs a way to let you define what order the function in question expects its arguments (e.g., property enumeration order). We can pass an array like `["x","y","z"]` to tell the utility to pull the properties off the object argument in exactly that order.

That's decent, but it's also unfortunate that we kinda *have* to do add that property-name array even for the simplest of functions. Is there any kind of trick we could use to detect what order the parameters are listed for a function, in at least the common simple cases? Fortunately, yes!

JavaScript functions have a `.toString()` method that gives a string representation of the function's code, including the function declaration signature. Dusting off our regular expression parsing skills, we can parse the string representation of the function, and pull out the individually named parameters. The code looks a bit gnarly, but it's good enough to get the job done:

```js
function spreadArgProps(
    fn,
    propOrder =
        fn.toString()
        .replace( /^(?:(?:function.*\(([^]*?)\))|(?:([^\(\)]+?)
            \s*=>)|(?:\(([^]*?)\)\s*=>))[^]+$/, "$1$2$3" )
        .split( /\s*,\s*/ )
        .map( v => v.replace( /[=\s].*$/, "" ) )
) {
    return function spreadFn(argsObj) {
        return fn( ...propOrder.map( k => argsObj[k] ) );
    };
}
```

**Note:** This utility's parameter parsing logic is far from bullet-proof; we're using regular expressions to parse code, which is already a faulty premise! But our only goal here is to handle the common cases, which this does reasonably well. We only need a sensible default detection of parameter order for functions with simple parameters (including those with default parameter values). We don't, for example, need to be able to parse out a complex destructured parameter, because we wouldn't likely be using this utility with such a function, anyway. So, this logic gets the 80% job done; it lets us override the `propOrder` array for any other more complex function signature that wouldn't otherwise be correctly parsed. That's the kind of pragmatic balance this book seeks to find wherever possible.

Let's illustrate using our `spreadArgProps(..)` utility:

```js
function bar(x,y,z) {
    console.log( `x:${x} y:${y} z:${z}` );
}

var f3 = curryProps( spreadArgProps( bar ), 3 );
var f4 = partialProps( spreadArgProps( bar ), { y: 2 } );

f3( {y: 2} )( {x: 1} )( {z: 3} );
// x:1 y:2 z:3

f4( { z: 3, x: 1 } );
// x:1 y:2 z:3
```

While order is no longer a concern, usage of functions defined in this style requires you to know what each argument's exact name is. You can't just remember, "oh, the function goes in as the first argument" anymore. Instead you have to remember, "the function parameter is called 'fn'." Conventions can create consistency of naming that lessens this burden, but it's still something to be aware of.

Weigh these tradeoffs carefully.

## No Points

A popular style of coding in the FP world aims to reduce some of the visual clutter by removing unnecessary parameter-argument mapping. This style is formally called tacit programming, or more commonly: point-free style. The term "point" here is referring to a function's parameter input.

**Warning:** Stop for a moment. Let's make sure we're careful not to take this discussion as an unbounded suggestion that you go overboard trying to be point-free in your FP code at all costs. This should be a technique for improving readability, when used in moderation. But as with most things in software development, you can definitely abuse it. If your code gets harder to understand because of the hoops you have to jump through to be point-free, stop. You won't win a blue ribbon just because you found some clever but esoteric way to remove another "point" from your code.

Let's start with a simple example:

```js
function double(x) {
    return x * 2;
}

[1,2,3,4,5].map( function mapper(v){
    return double( v );
} );
// [2,4,6,8,10]
```

Can you see that `mapper(..)` and `double(..)` have the same (or compatible, anyway) signatures? The parameter ("point") `v` can directly map to the corresponding argument in the `double(..)` call. As such, the `mapper(..)` function wrapper is unnecessary. Let's simplify with point-free style:

```js
function double(x) {
    return x * 2;
}

[1,2,3,4,5].map( double );
// [2,4,6,8,10]
```

Let's revisit an example from earlier:

```js
["1","2","3"].map( function mapper(v){
    return parseInt( v );
} );
// [1,2,3]
```

In this example, `mapper(..)` is actually serving an important purpose, which is to discard the `index` argument that `map(..)` would pass in, because `parseInt(..)` would incorrectly interpret that value as a `radix` for the parsing.

If you recall from the beginning of this chapter, this was an example where `unary(..)` helps us out:

```js
["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

Point-free!

The key thing to look for is if you have a function with parameter(s) that is/are directly passed to an inner function call. In both the above examples, `mapper(..)` had the `v` parameter that was passed along to another function call. We were able to replace that layer of abstraction with a point-free expression using `unary(..)`.

**Warning:** You might have been tempted, as I was, to try `map(partialRight(parseInt,10))` to right-partially apply the `10` value as the `radix`. However, as we saw earlier, `partialRight(..)` only guarantees that `10` will be the last argument passed in, not that it will be specifically the second argument. Since `map(..)` itself passes three arguments (`value`, `index`, `arr`) to its mapping function, the `10` value would just be the fourth argument to `parseInt(..)`; it only pays attention to the first two.

Here's another example:

```js
// convenience to avoid any potential binding issue
// with trying to use `console.log` as a function
function output(txt) {
    console.log( txt );
}

function printIf( predicate, msg ) {
    if (predicate( msg )) {
        output( msg );
    }
}

function isShortEnough(str) {
    return str.length <= 5;
}

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );         // Hello
printIf( isShortEnough, msg2 );
```

Now let's say you want to print a message only if it's long enough; in other words, if it's `!isShortEnough(..)`. Your first thought is probably this:

```js
function isLongEnough(str) {
    return !isShortEnough( str );
}

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );          // Hello World
```

Easy enough... but "points" now! See how `str` is passed through? Without re-implementing the `str.length` check, can we refactor this code to point-free style?

Let's define a `not(..)` negation helper (often referred to as `complement(..)` in FP libraries):

```js
function not(predicate) {
    return function negated(...args){
        return !predicate( ...args );
    };
}

// or the ES6 => arrow form
var not =
    predicate =>
        (...args) =>
            !predicate( ...args );
```

Next, let's use `not(..)` to alternately define `isLongEnough(..)` without "points":

```js
var isLongEnough = not( isShortEnough );

printIf( isLongEnough, msg2 );          // Hello World
```

That's pretty good, isn't it? But we *could* keep going. The definition of the `printIf(..)` function can actually be refactored to be point-free itself.

We can express the `if` conditional part with a `when(..)` utility:

```js
function when(predicate,fn) {
    return function conditional(...args){
        if (predicate( ...args )) {
            return fn( ...args );
        }
    };
}

// or the ES6 => form
var when =
    (predicate,fn) =>
        (...args) =>
            predicate( ...args ) ? fn( ...args ) : undefined;
```

Let's mix `when(..)` with a few other helper utilities we've seen earlier in this chapter, to make the point-free `printIf(..)`:

```js
var printIf = uncurry( rightPartial( when, output ) );
```

Here's how we did it: we right-partially-applied the `output` method as the second (`fn`) argument for `when(..)`, which leaves us with a function still expecting the first argument (`predicate`). *That* function when called produces another function expecting the message string; it would look like this: `fn(predicate)(str)`.

A chain of multiple (two) function calls like that looks an awful lot like a curried function, so we `uncurry(..)` this result to produce a single function that expects the two `str` and `predicate` arguments together, which matches the original `printIf(predicate,str)` signature.

Here's the whole example put back together (assuming various utilities we've already detailed in this chapter are present):

```js
function output(msg) {
    console.log( msg );
}

function isShortEnough(str) {
    return str.length <= 5;
}

var isLongEnough = not( isShortEnough );

var printIf = uncurry( partialRight( when, output ) );

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );         // Hello
printIf( isShortEnough, msg2 );

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );          // Hello World
```

Hopefully the FP practice of point-free style coding is starting to make a little more sense. It'll still take a lot of practice to train yourself to think this way naturally. **And you'll still have to make judgement calls** as to whether point-free coding is worth it, as well as what extent will benefit your code's readability.

What do you think? Points or no points for you?

**Note:** Want more practice with point-free style coding? We'll revisit this technique in "Revisiting Points" in Chapter 4, based on new-found knowledge of function composition.

## Summary

Partial Application is a technique for reducing the arity -- expected number of arguments to a function -- by creating a new function where some of the arguments are preset.

Currying is a special form of partial application where the arity is reduced to 1, with a chain of successive chained function calls, each which takes one argument. Once all arguments have been specified by these function calls, the original function is executed with all the collected arguments. You can also undo a currying.

Other important utilities like `unary(..)`, `identity(..)`, and `constant(..)` are part of the base toolbox for FP.

Point-free is a style of writing code that eliminates unnecessary verbosity of mapping parameters ("points") to arguments, with the goal of making easier to read/understand code.

All of these techniques twist functions around so they can work together more naturally. With your functions shaped compatibly now, the next chapter will teach you how to combine them to model the flows of data through your program.
