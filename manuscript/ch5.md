# Functional-Light JavaScript
# Chapter 5: Reducing Side Effects

In Chapter 2, we discussed how a function can have outputs besides its `return` value. By now you should be very comfortable with the FP definition of a function, so the idea of such side outputs -- side effects! -- should smell.

We're going to examine the various different forms of side effects and see why they are harmful to our code's quality and readability.

But let me not bury the lede here. The punchline to this chapter: it's impossible to write a program with no side effects. Well, not impossible; you certainly can. But that program won't do anything useful or observable. If you wrote a program with zero side effects, you wouldn't be able to tell the difference between it and an empty program.

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

**Note:** When a function makes a reference to a variable outside itself, this is called a free variable. Not all free variable references will be bad, but we'll want to be very careful with them.

What if I gave you a reference to call a function `bar(..)` that you cannot see the code for, but I told you that it had no such indirect side effects, only an explicit `return` value effect?

```js
bar( 4 );           // 42
```

Because you know that the internals of `bar(..)` do not create any side effects, you can now reason about any `bar(..)` call like this one in a much more straightforward way. But if you didn't know that `bar(..)` had no side effects, to understand the outcome of calling it, you'd have to go read and dissect all of its logic. This is extra mental tax burden for the reader.

**The readability of a side effecting function is worse** because it requires more reading to understand the program.

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

The correct answer is: not at all. If you're not sure whether `foo()`, `bar()`, and `baz()` are side-effecting or not, you cannot guarantee what `x` will be at each step unless you inspect the implementations of each, **and** then trace the program from line 1 forward, keeping track of all the changes in state as you go.

In other words, the final `console.log(x)` is impossible to analyze or predict unless you've mentally executed the whole program up to that point.

Guess who's good at running your program? The JS engine. Guess who's not as good at running your program? The reader of your code. And yet, your choice to write code (potentially) with side effects in one or more of those function calls means that you've burdened the reader with having to mentally execute your program in its entirety up to a certain line, for them to read and understand that line.

If `foo()`, `bar()`, and `baz()` were all free of side effects, they could not affect `x`, which means we do not need to execute them to mentally trace what happens with `x`. This is less mental tax, and makes the code more readable.

### Hidden Causes

Outputs, changes in state, are the most commonly cited manifestation of side effects. But another readability-harming practice is what some refer to as side causes. Consider:

```js
function foo(x) {
    return x + y;
}

var y = 3;

foo( 1 );           // 4
```

`y` is not changed by `foo(..)`, so it's not the same kind of side effect as we saw before. But now, the calling of `foo(..)` actually depends on the presence and current state of a `y`. If later, we do:

```js
y = 5;

// ..

foo( 1 );           // 6
```

Might we be surprised that the call to `foo(1)` returned different results from call to call?

`foo(..)` has an indirection of cause that is harmful to readability. The reader cannot see, without inspecting `foo(..)`'s implementation carefully, what causes are contributing to the output effect. It *looks* like the argument `1` is the only cause, but it turns out it's not.

To aid readability, all of the causes that will contribute to determining the effect output of `foo(..)` should be made as direct and obvious inputs to `foo(..)`. The reader of the code will clearly see the cause(s) and effect.

#### Fixed State

Does avoiding side causes mean the `foo(..)` function cannot reference any free variables?

Consider this code:

```js
function foo(x) {
    return x + bar( x );
}

function bar(x) {
    return x * 2;
}

foo( 3 );           // 9
```

It's clear that for both `foo(..)` and `bar(..)`, the only direct cause is the `x` parameter. But what about the `bar(x)` call? `bar` is just an identifier, and in JS it's not even a constant (aka, non-reassignable variable) by default. The `foo(..)` function is relying on the value of `bar` -- a variable that references the second function -- as a free variable.

So is this program relying on a side cause?

I say no. Even though it is *possible* to overwrite the `bar` variable's value with some other function, I am not doing so in this code, nor is it a common practice of mine or precedent to do so. For all intents and purposes, my functions are constants (never reassigned).

Consider:

```js
const PI = 3.141592;

function foo(x) {
    return x * PI;
}

foo( 3 );           // 9.424776000000001
```

**Note:** JavaScript has `Math.PI` built-in, so we're only using the `PI` example in this text as a convenient illustration. In practice, always use `Math.PI` instead of defining your own!

How about the above code snippet? Is `PI` a side cause of `foo(..)`?

Two observations will help us answer that question in a reasonable way:

1. Think about every call you might ever make to `foo(3)`. Will it always return that `9.424..` value? **Yes.** Every single time. If you give it the same input (`x`), it will always return the same output.

2. Could you replace every usage of `PI` with its immediate value, and could the program run **exactly** the same as it did before? **Yes.** There's no part of this program that relies on being able to change the value of `PI` -- indeed since it's a `const`, it cannot be reassigned -- so the `PI` variable here is only for readability/maintenance sake. Its value can be inlined without any change in program behavior.

My conclusion: `PI` here is not a violation of the spirit of minimizing/avoiding side effects (or causes). Nor is the `bar(x)` call in the previous snippet.

In both cases, `PI` and `bar` are not part of the state of the program. They're fixed, non-reassigned references. If they don't change throughout the program, we don't have to worry about tracking them as changing state. As such, they don't harm our readability. And they cannot be the source of bugs related to variables changing in unexpected ways.

**Note:** The use of `const` above does not, in my opinion, make the case that `PI` is absolved as a side cause; `var PI` would lead to the same conclusion. The lack of reassigning `PI` is what matters, not the inability to do so. We'll discuss `const` in a later chapter.

#### Randomness

You may never have considered it before, but randomness is a side cause. A function that uses `Math.random()` cannot have predictable output based on its input. So any code that generates unique random IDs/etc will by definition be considered reliant on the program's side causes.

In computing, we use what's called pseudo-random algorithms for generation. Turns out true randomness is pretty hard, so we just kinda fake it with complex algorithms that produce values that seem observably random. These algorithms calculate long streams of numbers, but the secret is, the sequence is actually predictable if you know the starting point. This starting point is referred to as a seed.

Some languages let you specify the seed value for the random number generation. If you always specify the same seed, you'll always get the same sequence of outputs from subsequent "pseudo-random number" generations. This is incredibly useful for testing purposes, for example, but incredibly dangerous for real world application usage.

In JS, the randomness of `Math.random()` calculation is based on an indirect input, because you cannot specify the seed. As such, we have to treat built-in random number generation as a side cause.

### I/O Effects

The most common (and essentially unavoidable) form of side cause/effect is I/O (input/output). A program with no I/O is totally pointless, because its work cannot be observed in any way. Useful programs must at a minimum have output, and many also need input. Input is a side cause and output is a side effect.

The typical input for the browser JS programmer is user events (mouse, keyboard), and for output is the DOM. If you work more in Node.js, you may more likely receive input from, and send output to, the file system, network connections, and/or the `stdin`/`stdout` streams.

As a matter of fact, these sources can be both input and output, both cause and effect. Take the DOM, for example. We update (side effect) a DOM element to show text or an image to the user, but the current state of the DOM is an implicit input (side cause) to those operations as well.

### Side Bugs

The scenarios where side causes and side effects can lead to bugs are as varied as the programs in existence. But let's examine a scenario to illustrate these hazards, in hopes that they help us recognize similar mistakes in our own programs.

Consider:

```js
var users = {};
var userOrders = {};

function fetchUserData(userId) {
    ajax( `http://some.api/user/${userId}`, function onUserData(userData){
        users[userId] = userData;
    } );
}

function fetchOrders(userId) {
    ajax( `http://some.api/orders/${userId}`, function onOrders(orders){
        for (let order of orders) {
            // keep a reference to latest order for each user
            users[userId].latestOrder = order;
            userOrders[orders[i].orderId] = order;
        }
    } );
}

function deleteOrder(orderId) {
    var user = users[ userOrders[orderId].userId ];
    var isLatestOrder = (userOrders[orderId] == user.latestOrder);

    // deleting the latest order for a user?
    if (isLatestOrder) {
        hideLatestOrderDisplay();
    }

    ajax( `http://some.api/delete/order/${orderId}`, function onDelete(success){
        if (success) {
            // deleted the latest order for a user?
            if (isLatestOrder) {
                user.latestOrder = null;
            }

            userOrders[orderId] = null;
        }
        else if (isLatestOrder) {
            showLatestOrderDisplay();
        }
    } );
}
```

I bet for some readers one of the potential bugs here is fairly obvious. If the callback `onOrders(..)` runs before the `onUserData(..)` callback, it will attempt to add a `latestOrder` property to a value (the `userData` object at `users[userId]`) that's not yet been set.

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

Do you see the interleaving of `fetchOrders(..)` / `onOrders(..)` with the `deleteOrder(..)` / `onDelete(..)` pair? That potential sequencing exposes a weird condition with our side causes/effects of state management.

There's a delay in time (because of the callback) between when we set the `isLatestOrder` flag and when we use it to decide if we should empty the `latestOrder` property of the user data object in `users`. During that delay, if `onOrders(..)` callback fires, it can potentially change which order value that user's `latestOrder` references. When `onDelete(..)` then fires, it will assume it still needs to unset the `latestOrder` reference.

The bug: the data (state) *might* now be out of sync. `latestOrder` will be unset, when potentially it should have stayed pointing at a newer order that came in to `onOrders(..)`.

The worst part of this kind of bug is that you don't get a program-crashing exception like we did with the other bug. We just simply have state that is incorrect; our application's behavior is "silently" broken.

The sequencing dependency between `fetchUserData(..)` and `fetchOrders(..)` is fairly obvious, and straightforwardly addressed. But it's far less clear that there's a potential sequencing dependency between `fetchOrders(..)` and `deleteOrder(..)`. These two seem to be more independent. And ensuring that their order is preserved is more tricky, because you don't know in advance (before the results from `fetchOrders(..)`) whether that sequencing really must be enforced.

Yes, you can recompute the `isLatestOrder` flag once `deleteOrder(..)` fires. But now you have a different problem: your UI state can be out of sync.

If you had called the `hideLatestOrderDisplay()` previously, you'll now need to call `showLatestOrderDisplay()`, but only if a new `latestOrder` has in fact been set. So you'll need to track at least three states: was the deleted order the "latest" originally, and is the "latest" set, and are those two orders different? These are solvable problems, of course. But they're not obvious by any means.

All of these hassles are because we decided to structure our code with side causes/effects on a shared set of state.

Functional programmers detest these sorts of side cause/effect bugs because of how much it hurts our ability read, reason about, validate, and ultimately **trust** the code. That's why they take the principle to avoid side causes/effects so seriously.

There are multiple different strategies for avoiding/fixing side causes/effects. We'll talk about some later in this chapter, and others in later chapters. I'll say one thing for certain: **writing with side causes/effects is often of our normal default** so avoiding them is going to require careful and intentional effort.

## Once Is Enough, Thanks

If you must make side effect changes to state, one class of operations that's useful for limiting the potential trouble is idempotence. If your update of a value is idempotent, then data will be resilient to the case where you might have multiple such updates from different side effect sources.

If you try to research it, the definition of idempotence can be a little confusing; mathematicians use a slightly different meaning than programmers typically do. However, both perspectives are useful for the functional programmer.

First, let's give a counter example that is neither mathematically nor programmingly idempotent:

```js
function updateCounter(obj) {
    if (obj.count < 10) {
        obj.count++;
        return true;
    }

    return false;
}
```

This function mutates an object via reference by incrementing `obj.count`, so it produces a side effect on that object. If `updateCounter(o)` is called multiple times -- while `o.count` is less than `10`, that is -- the program state changes each time. Also, the output of `updateCounter(..)` is a boolean, which is not suitable to feed back into a subsequent call of `updateCounter(..)`.

### Mathematic Idempotence

From the mathematical point of view, idempotence means an operation whose output won't ever change after the first call, if you feed that output back into the operation over and over again. In other words, `foo(x)` would produce the same output as `foo(foo(x))` and `foo(foo(foo(x)))`.

A typical mathematic example is `Math.abs(..)` (absolute value). `Math.abs(-2)` is `2`, which is the same result as `Math.abs(Math.abs(Math.abs(Math.abs(-2))))`. Utilities like `Math.min(..)`, `Math.max(..)`, `Math.round(..)`, `Math.floor(..)` and `Math.ceil(..)` are all idempotent.

Some custom mathematical operations we could define with this same characteristic:

```js
function toPower0(x) {
    return Math.pow( x, 0 );
}

function snapUp3(x) {
    return x - (x % 3) + (x % 3 > 0 && 3);
}

toPower0( 3 ) == toPower0( toPower0( 3 ) );         // true

snapUp3( 3.14 ) == snapUp3( snapUp3( 3.14 ) );      // true
```

Mathematical-style idempotence is **not** restricted to mathematic operations. Another place we can illustrate this form of idempotence is with JavaScript primitive type coercions:

```js
var x = 42, y = "hello";

String( x ) === String( String( x ) );              // true

Boolean( y ) === Boolean( Boolean( y ) );           // true
```

Earlier in the text, we explored a common FP tool that fulfills this form of idempotence:

```js
identity( 3 ) === identity( identity( 3 ) );    // true
```

Certain string operations are also naturally idempotent, such as:

```js
function upper(x) {
    return x.toUpperCase();
}

function lower(x) {
    return x.toLowerCase();
}

var str = "Hello World";

upper( str ) == upper( upper( str ) );              // true

lower( str ) == lower( lower( str ) );              // true
```

We can even design more sophisticated string formatting operations in an idempotent way, such as:

```js
function currency(val) {
    var num = parseFloat(
        String( val ).replace( /[^\d.-]+/g, "" )
    );
    var sign = (num < 0) ? "-" : "";
    return `${sign}$${Math.abs( num ).toFixed( 2 )}`;
}

currency( -3.1 );                                   // "-$3.10"

currency( -3.1 ) == currency( currency( -3.1 ) );   // true
```

`currency(..)` illustrates an important technique: in some cases the developer can take extra steps to normalize an input/output operation to ensure the operation is idempotent where it normally wouldn't be.

Wherever possible, restricting side effects to idempotent operations is much better than unrestricted updates.

### Programming Idempotence

The programming-oriented definition for idempotence is similar, but less formal. Instead of requiring `f(x) === f(f(x))`, this view of idempotence is just that `f(x);` results in the same program behavior as `f(x); f(x);`. In other words, the result of calling `f(x)` subsequent times after the first call doesn't change anything.

That perspective fits more with our observations about side effects, because it's more likely that such an `f(..)` operation creates an idempotent side effect rather than necessarily returning an idempotent output value.

This idempotence-style is often cited for HTTP operations (verbs) such as GET or PUT. If an HTTP REST API is properly following the specification guidance for idempotence, PUT is defined as an update operation that fully replaces a resource. As such, a client could either send a PUT request once or multiple times (with the same data), and the server would have the same resultant state regardless.

Thinking about this in more concrete terms with programming, let's examine some side effect operations for their idempotence (or lack thereof):

```js
// idempotent:
obj.count = 2;
a[a.length - 1] = 42;
person.name = upper( person.name );

// non-idempotent:
obj.count++;
a[a.length] = 42;
person.lastUpdated = Date.now();
```

Remember: the notion of idempotence here is that each idempotent operation (like `obj.count = 2`) could be repeated multiple times and not change the program state beyond the first update. The non-idempotent operations change the state each time.

What about DOM updates?

```js
var hist = document.getElementById( "orderHistory" );

// idempotent:
hist.innerHTML = order.historyText;

// non-idempotent:
var update = document.createTextNode( order.latestUpdate );
hist.appendChild( update );
```

The key difference illustrated here is that the idempotent update replaces the DOM element's content. The current state of the DOM element is irrelevant, because it's unconditionally overwritten. The non-idempotent operation adds content to the element; implicitly, the current state of the DOM element is part of computing the next state.

It won't always be possible to define your operations on data in an idempotent way, but if you can, it will definitely help reduce the chances that your side effects will crop up to break your expectations when you least expect it.

## Pure Bliss

A function with no side causes/effects is called a pure function. A pure function is idempotent in the programming sense, since it cannot have any side effects. Consider:

```js
function add(x,y) {
    return x + y;
}
```

All the inputs (`x` and `y`) and outputs (`return ..`) are direct; there are no free variable references. Calling `add(3,4)` multiple times would be indistinguishable from only calling it once. `add(..)` is pure and programming-style idempotent.

However, not all pure functions are idempotent in the mathematical sense, because they don't have to return a value that would be suitable for feeding back in as their own input. Consider:

```js
function calculateAverage(nums) {
    var sum = 0;
    for (let num of nums) {
        sum += num;
    }
    return sum / nums.length;
}

calculateAverage( [1,2,4,7,11,16,22] );         // 9
```

The output `9` is not an array, so you cannot pass it back in: `calculateAverage(calculateAverage( .. ))`.

As we discussed earlier, a pure function *can* reference free variables, as long as those free variables aren't side causes.

Some examples:

```js
const PI = 3.141592;

function circleArea(radius) {
    return PI * radius * radius;
}

function cylinderVolume(radius,height) {
    return height * circleArea( radius );
}
```

`circleArea(..)` references the free variable `PI`, but it's a constant so it's not a side cause. `cylinderVolume(..)` references the free variable `circleArea`, which is also not a side cause because this program treats it as, in effect, a constant reference to its function value. Both these functions are pure.

Another example where a function can still be pure but reference free variables is with closure:

```js
function unary(fn) {
    return function onlyOneArg(arg){
        return fn( arg );
    };
}
```

`unary(..)` itself is clearly pure -- its only input is `fn` and its only output is the `return`ed function -- but what about the inner function `onlyOneArg(..)`, which closes over the free variable `fn`?

It's still pure because `fn` never changes. In fact, we have full confidence in that fact because lexically speaking, those few lines are the only ones that could possibly reassign `fn`.

**Note:** `fn` is a reference to a function object, which is by default a mutable value. Somewhere else in the program *could* for example add a property to this function object, which technically "changes" the value (mutation, not reassignment). However, since we're not relying on anything about `fn` other than our ability to call it, and it's not possible to affect the callability of a function value, `fn` is still effectively unchanging for our reasoning purposes; it cannot be a side cause.

Another common way to articulate a function's purity is: **given the same input(s), it always produces the same output.** If you pass `3` to `circleArea(..)`, it will always output the same result (`28.274328`).

If a function *can* produce a different output each time it's given the same inputs, it is impure. Even if such a function always `return`s the same value, if it produces an indirect output side effect, the program state is changed each time it's called; this is impure.

Impure functions are undesirable because they make all of their calls harder to reason about. A pure function's call is perfectly predictable. When someone reading the code sees multiple `circleArea(3)` calls, they won't have to spend any extra effort to figure out what its output will be *each time*.

**Note:** An interesting thing to ponder: is the heat produced by the CPU while performing any given operation an unavoidable side effect of even the most pure functions/programs? What about just the CPU time delay as it spends time on a pure operation before it can do another one?

### Purely Relative

We have to be very careful when talking about a function being pure. JavaScript's dynamic value nature makes it all too easy to have non-obvious side causes/effects.

Consider:

```js
function rememberNumbers(nums) {
    return function caller(fn){
        return fn( nums );
    };
}

var list = [1,2,3,4,5];

var simpleList = rememberNumbers( list );
```

`simpleList(..)` looks like a pure function, as it's a reference to the inner function `caller(..)`, which just closes over the free variable `nums`. However, there's multiple ways that `simpleList(..)` can actually turn out to be impure.

First, our assertion of purity is based on the array value (referenced both by `list` and `nums`) never changing:

```js
function median(nums) {
    return (nums[0] + nums[nums.length - 1]) / 2;
}

simpleList( median );       // 3

// ..

list.push( 6 );

// ..

simpleList( median );       // 3.5
```

When we mutate the array, the `simpleList(..)` call changes its output. So, is `simpleList(..)` pure or impure? Depends on your perspective. It's pure for a given set of assumptions. It could be pure in any program that didn't have the `list.push(6)` mutation.

We could guard against this kind of impurity by altering the definition of `rememberNumbers(..)`. One approach is to duplicate the `nums` array:

```js
function rememberNumbers(nums) {
    // make a copy of the array
    nums = nums.slice();

    return function caller(fn){
        return fn( nums );
    };
}
```

But an even trickier hidden side effect could be lurking:

```js
var list = [1,2,3,4,5];

// make `list[0]` be a getter with a side effect
Object.defineProperty(
    list,
    0,
    {
        get: function(){
            console.log( "[0] was accessed!" );
            return 1;
        }
    }
);

var simpleList = rememberNumbers( list );
// [0] was accessed!
```

A perhaps more robust option is to change the signature of `rememberNumbers(..)` to not receive an array in the first place, but rather the numbers as individual arguments:

```js
function rememberNumbers(...nums) {
    return function caller(fn){
        return fn( nums );
    };
}

var simpleList = rememberNumbers( ...list );
// [0] was accessed!
```

The two `...`s have the effect of copying `list` into `nums` instead of passing it by reference.

**Note:** The console message side effect here comes not from `rememberNumbers(..)` but from the `...list` spreading. So in this case, both `rememberNumbers(..)` and `simpleList(..)` are pure.

But what if the mutation is even harder to spot? Composition of a pure function with an impure function **always** produces an impure function. If we pass an impure function into the otherwise pure `simpleList(..)`, it's now impure:

```js
// yes, a silly contrived example :)
function firstValue(nums) {
    return nums[0];
}

function lastValue(nums) {
    return firstValue( nums.reverse() );
}

simpleList( lastValue );    // 5

list;                       // [1,2,3,4,5] -- OK!

simpleList( lastValue );    // 1
```

**Note:** Despite `reverse()` looking safe (like other array methods in JS) in that it returns a reversed array, it actually mutates the array rather than creating a new one.

We need a more robust definition of `rememberNumbers(..)` to guard against the `fn(..)` mutating its closed over `nums` via reference:

```js
function rememberNumbers(...nums) {
    return function caller(fn){
        // send in a copy!
        return fn( nums.slice() );
    };
}
```

So is `simpleList(..)` reliably pure yet!? **Nope.** :(

We're only guarding against side effects we can control (mutating by reference). Any function we pass that has other side effects will have polluted the purity of `simpleList(..)`:

```js
simpleList( function impureIO(nums){
    console.log( nums.length );
} );
```

In fact, there's no way to define `rememberNumbers(..)` to make a perfectly-pure `simpleList(..)` function.

Purity is about confidence. But we have to admit that in many cases, **any confidence we feel is actually relative to the context** of our program and what we know about it. In practice (in JavaScript) the question of function purity is not about being absolutely pure or not, but about a range of confidence in its purity.

The more pure, the better. The more effort you put into making a function pure(r), the higher your confidence will be when you read code that uses it, and that will make that part of the code more readable.

## There Or Not

So far, we've defined function purity both as a function without side causes/effects and as a function that, given the same input(s), always produces the same output. These are just two different ways of looking at the same characteristics.

But a third way of looking at function purity, and perhaps the most widely accepted definition, is that a pure function has referential transparency.

Referential transparency is the assertion that a function call could be replaced by its output value, and the overall program behavior wouldn't change. In other words, it would be impossible to tell from the program's execution whether the function call was made or its return value was inlined in place of the function call.

From the perspective of referential transparency, both of these programs have identical behavior as they are built with pure functions:

```js
function calculateAverage(nums) {
    var sum = 0;
    for (let num of nums) {
        sum += num;
    }
    return sum / nums.length;
}

var numbers = [1,2,4,7,11,16,22];

var avg = calculateAverage( numbers );

console.log( "The average is:", avg );      // The average is: 9
```

```js
function calculateAverage(nums) {
    var sum = 0;
    for (let num of nums) {
        sum += num;
    }
    return sum / nums.length;
}

var numbers = [1,2,4,7,11,16,22];

var avg = 9;

console.log( "The average is:", avg );      // The average is: 9
```

The only difference between these two snippets is that in the latter one, we skipped the `calculateAverage(nums)` call and just inlined its ouput (`9`). Since the rest of the program behaves identically, `calculateAverage(..)` has referential transparency, and is thus a pure function.

### Mentally Transparent

The notion that a referentially transparent pure function *can be* replaced with its output does not mean that it *should literally be* replaced. Far from it.

The reasons we build functions into our programs instead of using pre-computed magic constants are not just about responding to changing data, but also about readability with proper abstractions, etc. The function call to calculate the average of that list of numbers makes that part of the program more readable than the line that just assigns the value explicitly. It tells the story to the reader of where `avg` comes from, what it means, etc.

What we're really suggesting with referential transparency is that as you're reading a program, once you've mentally computed what a pure function call's output is, you no longer need to think about what that exact function call is doing when you see it in code, especially if it appears multiple times.

That result becomes kinda like a mental `const` declaration, which as you're reading you can transparently swap in and not spend any more mental energy working out.

Hopefully the importance of this characteristic of a pure function is obvious. We're trying to make our programs more readable. One way we can do that is give the reader less work, by providing assistance to skip over the unnecessary stuff so they can focus on the important stuff.

The reader shouldn't need to keep re-computing some outcome that isn't going to change (and doesn't need to). If you define a pure function with referential transparency, the reader won't have to.

### Not So Transparent?

What about a function that has a side effect, but this side effect isn't ever observed or relied upon anywhere else in the program? Does that function still have referential transparency?

Here's one:

```js
function calculateAverage(nums) {
    sum = 0;
    for (let num of nums) {
        sum += num;
    }
    return sum / nums.length;
}

var sum;
var numbers = [1,2,4,7,11,16,22];

var avg = calculateAverage( numbers );
```

Did you spot it?

`sum` is an outer free variable that `calculateAverage(..)` uses to do its work. But, every time we call `calculateAverage(..)` with the same list, we're going to get `9` as the output. And this program couldn't be distinguished in terms of behavior from a program that replaced the `calculateAverage(nums)` call with the value `9`. No other part of the program cares about the `sum` variable, so it's an unobserved side effect.

Is a side cause/effect that's unobserved like this tree:

> If a tree falls in the forest, but no one is around to hear it, does it still make a sound?

By the narrowest definition of referential transparency, I think you'd have to say `calculateAverage(..)` is still a pure function. But as we're trying to not just be academic in our study, but balanced with pragmatism, I think this conclusion needs more perspective. Let's explore.

#### Performance Effects

You'll generally find these kind of side-effects-that-go-unobserved being used to optimize the performance of an operation. For example:

```js
var cache = [];

function specialNumber(n) {
    // if we've already calculated this special number,
    // skip the work and just return it from the cache
    if (cache[n] !== undefined) {
        return cache[n];
    }

    var x = 1, y = 1;

    for (let i = 1; i <= n; i++) {
        x += i % 2;
        y += i % 3;
    }

    cache[n] = (x * y) / (n + 1);

    return cache[n];
}

specialNumber( 6 );             // 4
specialNumber( 42 );            // 22
specialNumber( 1E6 );           // 500001
specialNumber( 987654321 );     // 493827162
```

This silly `specialNumber(..)` algorithm is deterministic and thus pure from the definition that it always gives the same output for the same input. It's also pure from the referential transparency perspective -- replace any call to `specialNumber(42)` with `22` and the end result of the program is the same.

However, the function has to do quite a bit of work to calculate some of the bigger numbers, especially the `987654321` input. If we needed to get that particular special number multiple times throughout our program, the `cache`ing of the result means that subsequent calls are far more efficient.

Don't be so quick to assume that you could just run the `specialNumber(987654321)` calculation once and manually stick that result in some variable / constant. Programs are often highly modularized and globally accessible scopes are not usually the way you want to go around sharing state between those independent pieces. Having `specialNumber(..)` do its own caching (even though it happens to be using a global variable to do so!) is a more preferable abstraction of that state sharing.

The point is that if `specialNumber(..)` is the only part of the program that accesses and updates the `cache` side cause/effect, the referential transparency perspective observably holds true, and this might be seen as an acceptable pragmatic "cheat" of the pure function ideal.

But should it?

Typically, this sort of performance optimization side effecting is done by hiding the caching of results so they *cannot* be observed by any other part of the program. This process is referred to as memoization. I always think of that word as "memorization"; I have no idea if that's even remotely where it comes from, but it certainly helps me understand the concept better.

Consider:

```js
var specialNumber = (function memoization(){
    var cache = [];

    return function specialNumber(n){
        // if we've already calculated this special number,
        // skip the work and just return it from the cache
        if (cache[n] !== undefined) {
            return cache[n];
        }

        var x = 1, y = 1;

        for (let i = 1; i <= n; i++) {
            x += i % 2;
            y += i % 3;
        }

        cache[n] = (x * y) / (n + 1);

        return cache[n];
    };
})();
```

We've contained the `cache` side causes/effects of `specialNumber(..)` inside the scope of the `memoization()` IIFE, so now we're sure that no other parts of the program *can* observe them, not just that they *don't* observe them.

That last sentence may seem like a subtle point, but actually I think it might be **the most important point of the entire chapter**. Read it again.

Recall this philosophical musing:

> If a tree falls in the forest, but no one is around to hear it, does it still make a sound?

Going with the metaphor, what I'm getting at is: whether the sound is made or not, it would be better if we never create a scenario where the tree can fall without us being around; we'll always hear the sound when a tree falls.

The purpose of reducing side causes/effects is not per se to have a program where they aren't observed, but to design a program where fewer of them are possible, because this makes the code easier to reason about. A program with side causes/effects that *just happen* to not be observed is not nearly as effective in this goal as a program that *cannot* observe them.

If side causes/effects can happen, the writer and reader must mentally juggle them. Make it so they can't happen, and both writer and reader will find more confidence over what can and cannot happen in any part.

## Purifying

The first best option in writing functions is that you design them from the beginning to be pure. But you'll spend plenty of time maintaining existing code, where those kinds of decisions were already made; you'll run across a lot of impure functions.

If possible, refactor the impure function to be pure. Sometimes you can just shift the side effects out of a function to the part of the program where the call of that function happens. The side effect wasn't eliminated, but it was made more obvious by showing up at the call-site.

Consider this trivial example:

```js
function addMaxNum(arr) {
    var maxNum = Math.max( ...arr );
    arr.push( maxNum + 1 );
}

var nums = [4,2,7,3];

addMaxNum( nums );

nums;       // [4,2,7,3,8]
```

The `nums` array needs to be modified, but we don't have to obscure that side effect by containing it in `addMaxNum(..)`. Let's move the `push(..)` mutation out, so that `addMaxNum(..)` becomes a pure function, and the side effect is now more obvious:

```js
function addMaxNum(arr) {
    var maxNum = Math.max( ...arr );
    return maxNum + 1;
}

var nums = [4,2,7,3];

nums.push(
    addMaxNum( nums )
);

nums;       // [4,2,7,3,8]
```

**Note:** Another technique for this kind of task could be to use an immutable data structure, which we cover in the next chapter.

But what can you do if you have an impure function where the refactoring is not as easy?

You need to figure what kind of side causes/effects the function has. It may be that the side causes/effects come variously from lexical free variables, mutations-by-reference, or even `this` binding. We'll look at approaches that address each of these scenarios.

### Containing Effects

If the nature of the concerned side causes/effects is with lexical free variables, and you have the option to modify the surrounding code, you can encapsulate them using scope.

Recall:

```js
var users = {};

function fetchUserData(userId) {
    ajax( `http://some.api/user/${userId}`, function onUserData(userData){
        users[userId] = userData;
    } );
}
```

One option for purifying this code is to create a wrapper around both the variable and the impure function. Essentially, the wrapper has to receive as input "the entire universe" of state it can operate on.

```js
function safer_fetchUserData(userId,users) {
    // simple, naive ES6+ shallow object copy, could also
    // be done w/ various libs or frameworks
    users = Object.assign( {}, users );

    fetchUserData( userId );

    // return the copied state
    return users;


    // ***********************

    // original untouched impure function:
    function fetchUserData(userId) {
        ajax( `http://some.api/user/${userId}`, function onUserData(userData){
            users[userId] = userData;
        } );
    }
}
```

**Warning:** `safer_fetchUserData(..)` is *more* pure, but is not strictly pure in that it still relies on the I/O of making an Ajax call. There's no getting around the fact that an Ajax call is an impure side effect, so we'll just leave that detail unaddressed.

Both `userId` and `users` are input for the original `fetchUserData`, and `users` is also output. The `safer_fetchUserData(..)` takes both of these inputs, and returns `users`. To make sure we're not creating a side effect on the outside when `users` is mutated, we make a local copy of `users`.

This technique has limited usefulness mostly because if you cannot modify a function itself to be pure, you're not that likely to be able to modify its surrounding code either. However, it's helpful to explore it if possible, as it's the simplest of our fixes.

Regardless of whether this will be a practical technique for refactoring to pure functions, the more important take-away is that function purity only need be skin deep. That is, the **purity of a function is judged from the outside**, regardless of what goes on inside. As long as a function's usage behaves pure, it is pure. Inside a pure function, impure techniques can be used -- in moderation! -- for a variety of reasons, including most commonly, for performance. It's not necessarily, as they say, "turtles all the way down".

Be very careful, though. Any part of the program that's impure, even if it's wrapped with and only ever used via a pure function, is a potential source of bugs and confusion for readers of the code. The overall goal is to reduce side effects wherever possible, not just hide them.

### Covering Up Effects

Many times you will be unable to modify the code to encapsulate the lexical free variables inside the scope of a wrapper function. For example, the impure function may be in a third-party library file that you do not control, containing something like:

```js
var nums = [];
var smallCount = 0;
var largeCount = 0;

function generateMoreRandoms(count) {
    for (let i = 0; i < count; i++) {
        let num = Math.random();

        if (num >= 0.5) {
            largeCount++;
        }
        else {
            smallCount++;
        }

        nums.push( num );
    }
}
```

The brute-force strategy to *quarantine* the side causes/effects when using this utility in the rest of our program is to create an interface function that performs the following steps:

1. capture the to-be-affected current states
2. set initial input states
3. run the impure function
4. capture the side effect states
5. restore the original states
6. return the captured side effect states

```js
function safer_generateMoreRandoms(count,initial) {
    // (1) save original state
    var orig = {
        nums,
        smallCount,
        largeCount
    };

    // (2) setup initial pre-side effects state
    nums = initial.nums.slice();
    smallCount = initial.smallCount;
    largeCount = initial.largeCount;

    // (3) beware impurity!
    generateMoreRandoms( count );

    // (4) capture side effect state
    var sides = {
        nums,
        smallCount,
        largeCount
    };

    // (5) restore original state
    nums = orig.nums;
    smallCount = orig.smallCount;
    largeCount = orig.largeCount;

    // (6) expose side effect state directly as output
    return sides;
}
```

And to use `safer_generateMoreRandoms(..)`:

```js
var initialStates = {
    nums: [0.3, 0.4, 0.5],
    smallCount: 2,
    largeCount: 1
};

safer_generateMoreRandoms( 5, initialStates );
// { nums: [0.3,0.4,0.5,0.8510024448959794,0.04206799238...

nums;           // []
smallCount;     // 0
largeCount;     // 0
```

That's a lot of manual work to avoid a few side causes/effects; it'd be a lot easier if we just didn't have them in the first place. But if we have no choice, this extra effort is well worth it to avoid surprises in our programs.

**Note:** This technique really only works when you're dealing with synchronous code. Asynchronous code can't reliably be managed with this approach because it can't prevent surprises if other parts of the program access/modify the state variables in the interim.

### Evading Effects

When the nature of the side effect to be dealt with is a mutation of a direct input value (object, array, etc) via reference, we can again create an interface function to interact with instead of the original impure function.

Consider:

```js
function handleInactiveUsers(userList,dateCutoff) {
    for (let i = 0; i < userList.length; i++) {
        if (userList[i].lastLogin == null) {
            // remove the user from the list
            userList.splice( i, 1 );
            i--;
        }
        else if (userList[i].lastLogin < dateCutoff) {
            userList[i].inactive = true;
        }
    }
}
```

Both the `userList` array itself, plus the objects in it, are mutated. One strategy to protect against these side effects is to do a deep (well, just not shallow) copy first:

```js
function safer_handleInactiveUsers(userList,dateCutoff) {
    // make a copy of both the list and its user objects
    let copiedUserList = userList.map( function mapper(user){
        // copy a `user` object
        return Object.assign( {}, user );
    } );

    // call the original function with the copy
    handleInactiveUsers( copiedUserList, dateCutoff );

    // expose the mutated list as a direct output
    return copiedUserList;
}
```

The success of this technique will be dependent on the thoroughness of the *copy* you make of the value. Using `userList.slice()` would not work here, since that only creates a shallow copy of the `userList` array itself. Each element of the array is an object that needs to be copied, so we need to take extra care. Of course, if those objects have objects inside them (they might!), the copying needs to be even more robust.

### `this` Revisited

Another variation of the via-reference side cause/effect is with `this`-aware functions having `this` as an implicit input. See "What's This" in Chapter 2 for more info on why the `this` keyword is problematic for FPers.

Consider:

```js
var ids = {
    prefix: "_",
    generate() {
        return this.prefix + Math.random();
    }
};
```

Our strategy is similar to the previous section's discussion: create an interface function that forces the `generate()` function to use a predictable `this` context:

```js
function safer_generate(context) {
    return ids.generate.call( context );
}

// *********************

safer_generate( { prefix: "foo" } );
// "foo0.8988802158307285"
```

These strategies are in no way fool-proof; the safest protection against side causes/effects is to not do them. But if you're trying to improve the readability and confidence level of your program, reducing the side causes/effects wherever possible is a huge step forward.

Essentially, we're not really eliminating side causes/effects, but rather containing and limiting them, so that more of our code is verifiable and reliable. If we later run into program bugs, we know that the parts of our code still using side causes/effects are the most likely culprits.

## Summary

Side effects are harmful to code readability and quality because they make your code much harder to understand. Side effects are also one of the most common *causes* of bugs in programs, because juggling them is hard. Idempotence is a strategy for restricting side effects by essentially creating one-time-only operations.

Pure functions are how we best avoid side effects. A pure function is one that always returns the same output given the same input, and has no side causes or side effects. Referential transparency further states that -- more as a mental exercise than a literal action -- a pure function's call could be replaced with its output and the program would not have altered behavior.

Refactoring an impure function to be pure is the preferred option. But if that's not possible, try encapsulating the side causes/effects, or creating a pure interface against them.

No program can be entirely free of side effects. But prefer pure functions in as many places as that's practical. Collect impure functions side effects together as much as possible, so that it's easier to identify and audit these most likely culprits of bugs when they arise.
