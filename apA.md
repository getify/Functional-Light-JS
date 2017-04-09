# Functional-Light JavaScript
# Appendix A: Transducing

Transducing is a more advanced technique than we've covered in this book. It extends many of the concepts from Chapter 8 on list operations.

I wouldn't necessarily call this topic strictly "Functional-Light", but more like a bonus on top. I've left this to an appendix because you might very well need to skip the discussion for now and come back to it once you feel fairly comfortable with -- and make sure you've practiced! -- the main book concepts.

To be honest, even after teaching transducing many times, and writing this chapter, I am still trying to fully wrap my brain around this technique. So don't feel bad if it twists you up. Bookmark this appendix and come back when you're ready.

Transducing means transforming with reduction.

I know that may sound like a jumble of words that confuses more than it clarifies. But let's take a look at how powerful it can be. I actually think it's one of the best illustrations of what you can do once you grasp the principles of Functional-Light Programming.

As with the rest of this book, my approach is to first explain *why*, then *how*, then finally boil it down to a simplified, repeatable *what*. That's often backwards of how many teach, but I think you'll learn the topic more deeply this way.

## Why, First

Let's start by extending a scenario we covered back in Chapter 3, testing words to see if they're short enough and/or long enough:

```js
function isLongEnough(str) {
	return str.length >= 5;
}

function isShortEnough(str) {
	return str.length <= 10;
}
```

In Chapter 3, we used these predicate functions to test a single word. Then in Chapter 8, we learned how to repeat such tests using list operations like `filter(..)`. For example:

```js
var words = [ "You", "have", "written", "something", "very", "interesting" ];

words
.filter( isLongEnough )
.filter( isShortEnough );
// ["written","something"]
```

It may not be obvious, but this pattern of separate adjacent list operations has some non-ideal characteristics. When we're dealing with only a single array of a small number of values, everything is fine. But if there were lots of values in the array, each `filter(..)` processing the list separately can slow down a bit more than we'd like.

A similar performance problem arises when our arrays are async/lazy (aka observables), processing values over time in response to events (see Chapter 10). In this scenario, only a single value comes down the event stream at a time, so processing that discrete value with two separate `filter(..)`s function calls isn't really such a big deal.

But, what's not obvious is that each `filter(..)` method produces a separate observable. The overhead of pumping a value out of one observable into another can really add up. That's especially true since in these cases, it's not uncommon for thousands or millions of values to be processed; even such small overhead costs add up quickly.

The other downside is readability, especially when we need to repeat the same series of operations against multiple lists (or observables). For example:

```js
zip(
	list1.filter( isLongEnough ).filter( isShortEnough ),
	list2.filter( isLongEnough ).filter( isShortEnough ),
	list3.filter( isLongEnough ).filter( isShortEnough )
)
```

Repetitive, right?

Wouldn't it be better (both for readability and performance) if we could combine the `isLongEnough(..)` predicate with the `isShortEnough(..)` predicate? You could do so manually:

```js
function isCorrectLength(str) {
	return isLongEnough( str ) && isShortEnough( str );
}
```

But that's not the FP way!

In Chapter 8, we talked about fusion -- composing adjacent mapping functions. Recall:

```js
words
.map(
	pipe( removeInvalidChars, upper, elide )
);
```

Unfortunately, combining adjacent predicate functions doesn't work as easily as combining adjacent mapping functions. To understand why, think about the "shape" of the predicate function -- a sort of academic way of describing the signature of inputs and output. It takes a single value in, and it returns a `true` or a `false`.

If you tried `isShortEnough(isLongEnough(str))`, it wouldn't work properly. `isLongEnough(..)` will return `true` / `false`, not the string value that `isShortEnough(..)` is expecting. Bummer.

A similar frustration exists trying to compose two adjacent reducer functions. The "shape" of a reducer is a function that receives two values as input, and returns a single combined value. The output of a reducer as a single value is not suitable for input to another reducer expecting two inputs.

Moreover, the `reduce(..)` helper takes an optional `initialValue` input. Sometimes this can be omitted, but sometimes it has to be passed in. That even further complicates composition, since one reduction might need one `initialValue` and the other reduction might seem like it needs a different `initialValue`. How can we possibly do that if we only make one `reduce(..)` call with some sort of composed reducer?

Consider a chain like this:

```js
words
.map( strUppercase )
.filter( isLongEnough )
.filter( isShortEnough )
.reduce( strConcat, "" );
// "WRITTENSOMETHING"
```

Can you envision a composition that includes all of these steps: `map(strUppercase)`, `filter(isLongEnough)`, `filter(isShortEnough)`, `reduce(strConcat)`? The shape of each operator is different, so they won't directly compose together. We need to bend their shapes a little bit to fit them together.

Hopefully these observations have illustrated why simple fusion-style composition isn't up to the task. We need a more powerful technique, and transducing is that tool.

## How, Next

Let's talk about how we might derive a composition of mappers, predicates and/or reducers.

Don't get too overwhelmed: you won't have to go through all these mental steps we're about to explore in your own programming. Once you understand and can recognize the problem transducing solves, you'll be able just jump straight to using a `transduce(..)` utility from a FP library and move on with the rest of your application!

Let's jump in.

### Expressing Map/Filter As Reduce

The first trick we need to perform is expressing our `filter(..)` and `map(..)` calls as `reduce(..)` calls. Recall how we did that in Chapter 8:

```js
function strUppercase(str) { return str.toUpperCase(); }
function strConcat(str1,str2) { return str1 + str2; }

function strUppercaseReducer(list,str) {
	list.push( strUppercase( str ) );
	return list;
}

function isLongEnoughReducer(list,str) {
	if (isLongEnough( str )) list.push( str );
	return list;
}

function isShortEnoughReducer(list,str) {
	if (isShortEnough( str )) list.push( str );
	return list;
}

words
.reduce( strUppercaseReducer, [] )
.reduce( isLongEnoughReducer, [] )
.reduce( isShortEnough, [] )
.reduce( strConcat, "" );
// "WRITTENSOMETHING"
```

That's a decent improvement. We now have four adjacent `reduce(..)` calls instead of a mixture of three different methods all with different shapes. We still can't just `compose(..)` those four reducers, however, because they accept two arguments instead of one.

In Chapter 8, we sort of cheated and used `list.push(..)` to mutate as a side effect rather than calling `list.concat(..)` to return a whole new array. Let's be a bit more formal for now:

```js
function strUppercaseReducer(list,str) {
	return list.concat( [strUppercase( str )] );
}

function isLongEnoughReducer(list,str) {
	if (isLongEnough( str )) return list.concat( [str] );
	return list;
}

function isShortEnoughReducer(list,str) {
	if (isShortEnough( str )) return list.concat( [str] );
	return list;
}
```

Later, we'll look at whether `concat(..)` is necessary here or not.

### Parameterizing The Reducers

Both filter reducers are almost identical, except they use a different predicate function. Let's parameterize that so we get one utility that can define any filter-reducer:

```js
function filterReducer(predicateFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return list.concat( [val] );
		return list;
	};
}

var isLongEnoughReducer = filterReducer( isLongEnough );
var isShortEnoughReducer = filterReducer( isShortEnough );
```

Let's do the same parameterization of the `mapperFn(..)` for a utility to produce any map-reducer:

```js
function mapReducer(mapperFn) {
	return function reducer(list,val){
		return list.concat( [mapperFn( val )] );
	};
}

var strToUppercaseReducer = mapReducer( strUppercase );
```

Our chain still looks the same:

```js
words
.reduce( strUppercaseReducer, [] )
.reduce( isLongEnoughReducer, [] )
.reduce( isShortEnough, [] )
.reduce( strConcat, "" );
```

### Extracting Common Combination Logic

Look very closely at the above `mapReducer(..)` and `filterReducer(..)` functions. Do you spot the common functionality shared in each?

This part:

```js
return list.concat( .. );

// or
return list;
```

Let's define a helper for that common logic. But what shall we call it?

```js
function WHATSITCALLED(list,val) {
	return list.concat( [val] );
}
```

If you examine what that `WHATSITCALLED(..)` function does, it takes two values (an array and another value) and it "combines" them by concatenating the value onto the end of the array, returning a new array. Very uncreatively, we could name this `listCombination(..)`:

```js
function listCombination(list,val) {
	return list.concat( [val] );
}
```

Let's now re-define our reducer helpers to use `listCombination(..)`:

```js
function mapReducer(mapperFn) {
	return function reducer(list,val){
		return listCombination( list, mapperFn( val ) );
	};
}

function filterReducer(predicateFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return listCombination( list, val );
		return list;
	};
}
```

Our chain still looks the same (so we won't repeat it).

### Parameterizing The Combination

Our simple `listCombination(..)` utility is only one possible way that we might combine two values. Let's parameterize the use of it to make our reducers more generalized:

```js
function mapReducer(mapperFn,combinationFn) {
	return function reducer(list,val){
		return combinationFn( list, mapperFn( val ) );
	};
}

function filterReducer(predicateFn,combinationFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return combinationFn( list, val );
		return list;
	};
}
```

To use this form of our helpers:

```js
var strToUppercaseReducer = mapReducer( strUppercase, listCombination );
var isLongEnoughReducer = filterReducer( isLongEnough, listCombination );
var isShortEnoughReducer = filterReducer( isShortEnough, listCombination );
```

Defining these utilities to take two arguments instead of one is less convenient for composition, so let's use our `curry(..)` approach:

```js
var curriedMapReducer = curry( function mapReducer(mapperFn,combinationFn){
	return function reducer(list,val){
		return combinationFn( list, mapperFn( val ) );
	};
} );

var curriedFilterReducer = curry( function filterReducer(predicateFn,combinationFn){
	return function reducer(list,val){
		if (predicateFn( val )) return combinationFn( list, val );
		return list;
	};
} );

var strToUppercaseReducer =
	curriedMapReducer( strUppercase )( listCombination );
var isLongEnoughReducer =
	curriedFilterReducer( isLongEnough )( listCombination );
var isShortEnoughReducer =
	curriedFilterReducer( isShortEnough )( listCombination );
```

That looks a bit more verbose, and probably doesn't seem very useful.

But this is actually necessary to get to the next step of our derivation. Remember, our ultimate goal here is to be able to `compose(..)` these reducers. We're almost there.

### Composing Curried

This step is the trickiest of all to visualize. So read slowly and pay close attention here.

Let's consider the curried functions from above, but without the `listCombination(..)` function having been passed in to each:

```js
var x = curriedMapReducer( strUppercase );
var y = curriedFilterReducer( isLongEnough );
var z = curriedFilterReducer( isShortEnough );
```

Think about the shape of all three of these intermediate functions, `x(..)`, `y(..)`, and `z(..)`. Each one expects a single combination function, and produces a reducer function with it.

Remember, if we wanted the independent reducers from all these, we could do:

```js
var upperReducer = x( listCombination );
var longEnoughReducer = y( listCombination );
var shortEnoughReducer = z( listCombination );
```

But what would you get back if you called `y(z)`? Basically, what happens when passing `z` in as the `combinationFn(..)` for the `y(..)` call? That returned reducer function internally looks kinda like this:

```js
function reducer(list,val) {
	if (isLongEnough( val )) return z( list, val );
	return list;
}
```

See the `z(..)` call inside? That should look wrong to you, because the `z(..)` function is supposed to receive only a single argument (a `combinationFn(..)`), not two arguments (`list` and `val`). The shapes don't match. That won't work.

Let's instead look at the composition `y(z(listCombination))`. We'll break that down into two separate steps:

```js
var shortEnoughReducer = z( listCombination );
var longAndShortEnoughReducer = y( shortEnoughReducer );
```

We create `shortEnoughReducer(..)`, then we pass *it* in as the `combinationFn(..)` to `y(..)`, producing `longAndShortEnoughReducer(..)`. Re-read that a few times until it clicks.

Now consider: what do `shortEnoughReducer(..)` and `longAndShortEnoughReducer(..)` look like internally? Can you see them in your mind?

```js
// shortEnoughReducer, from z(..):
function reducer(list,val) {
	if (isShortEnough( val )) return listCombination( list, val );
	return list;
}

// longAndShortEnoughReducer, from y(..):
function reducer(list,val) {
	if (isLongEnough( val )) return shortEnoughReducer( list, val );
	return list;
}
```

Do you see how `shortEnoughReducer(..)` has taken the place of `listCombination(..)` inside `longAndShortEnoughReducer(..)`? Why does that work?

Because **the shape of a `reducer(..)` and the shape of `listCombination(..)` are the same.** In other words, a reducer can be used as a combination function for another reducer; that's how they compose! The `listCombination(..)` function makes the first reducer, then *that reducer* can be as the combination function to make the next reducer, and so on.

Let's test out our `longAndShortEnoughReducer(..)` with a few different values:

```js
longAndShortEnoughReducer( [], "nope" );
// []

longAndShortEnoughReducer( [], "hello" );
// ["hello"]

longAndShortEnoughReducer( [], "hello world" );
// []
```

The `longAndShortEnoughReducer(..)` utility is filtering out both values that are not long enough and values that are not short enough, and it's doing both these filterings in the same step. It's a composed reducer!

Take another moment to let that sink in. It still kinda blows my mind.

Now, to bring `x(..)` (the uppercase reducer producer) into the composition:

```js
var longAndShortEnoughReducer = y( z( listCombination) );
var upperLongAndShortEnoughReducer = x( longAndShortEnoughReducer );
```

As the name `upperLongAndShortEnoughReducer(..)` implies, it does all three steps at once -- a mapping and two filters! What it kinda look likes internally:

```js
// upperLongAndShortEnoughReducer:
function reducer(list,val) {
	return longAndShortEnoughReducer( list, strUppercase( val ) );
}
```

A string `val` is passed in, uppercased by `strUppercase(..)` and then passed along to `longAndShortEnoughReducer(..)`. *That* function only conditionally adds this uppercased string to the `list` if it's both long enough and short enough. Otherwise, `list` will remain unchanged.

It took my brain weeks to fully understand the implications of that juggling. So don't worry if you need to stop here and re-read a few (dozen!) times to get it. Take your time.

Now let's verify:

```js
upperLongAndShortEnoughReducer( [], "nope" );
// []

upperLongAndShortEnoughReducer( [], "hello" );
// ["HELLO"]

upperLongAndShortEnoughReducer( [], "hello world" );
// []
```

This reducer is the composition of the map and both filters! That's amazing!

Let's recap where we're at so far:

```js
var x = curriedMapReducer( strUppercase );
var y = curriedFilterReducer( isLongEnough );
var z = curriedFilterReducer( isShortEnough );

var upperLongAndShortEnoughReducer = x( y( z( listCombination ) ) );

words.reduce( upperLongAndShortEnoughReducer, [] );
// ["WRITTEN","SOMETHING"]
```

That's pretty cool. But let's make it even better.

`x(y(z( .. )))` is a composition. Let's skip the intermediate `x` / `y` / `z` variable names, and just express that composition directly:

```js
var composition = compose(
	curriedMapReducer( strUppercase ),
	curriedFilterReducer( isLongEnough ),
	curriedFilterReducer( isShortEnough )
);

var upperLongAndShortEnoughReducer = composition( listCombination );

words.reduce( upperLongAndShortEnoughReducer, [] );
// ["WRITTEN","SOMETHING"]
```

Think about the flow of "data" in that composed function:

1. `listCombination(..)` flows in as the combination function to make the filter-reducer for `isShortEnough(..)`.
2. *That* resulting reducer function then flows in as the combination function to make the filter-reducer for `isLongEnough(..)`.
3. Finally, *that* resulting reducer function flows in as the combination function to make the map-reducer for `strUppercase(..)`.

In the previous snippet, `composition(..)` is a composed function expecting a combination function to make a reducer; `composition(..)` has a special label: transducer. Providing the combination function to a transducer produces the composed reducer:

// TODO: fact-check if the transducer *produces* the reducer or *is* the reducer

```js
var transducer = compose(
	curriedMapReducer( strUppercase ),
	curriedFilterReducer( isLongEnough ),
	curriedFilterReducer( isShortEnough )
);

words
.reduce( transducer( listCombination ), [] );
// ["WRITTEN","SOMETHING"]
```

**Note:** We should make an observation about the `compose(..)` order in the previous two snippets, which may be confusing. Recall that in our original example chain, we `map(strUppercase)` and then `filter(isLongEnough)` and finally `filter(isShortEnough)`; those operations indeed happen in that order. But in Chapter 4, we learned that `compose(..)` typically has the effect of running its functions in reverse order of listing. So why don't we need to reverse the order *here* to get the same desired outcome? The abstraction of the `combinationFn(..)` from each reducer reverses the effective applied order of operations under the hood. So counter-intuitively, when composing a tranducer, you actually want to list them in desired order of execution!

#### List Combination: Pure vs Impure

As a quick aside, let's revisit our `listCombination(..)` combination function implementation:

```js
function listCombination(list,val) {
	return list.concat( [val] );
}
```

While this approach is pure, it has negative consequences for performance. First, it creates the `[..]` temporary array wrapped around `val`. Then, `concat(..)` creates a whole new array to append this temporary array onto. For each step in our composed reduction, that's a lot of arrays being created and thrown away, which is not only bad for CPU but also GC memory churn.

The better-performing, impure version:

```js
function listCombination(list,val) {
	list.push( val );
	return list;
}
```

Thinking about `listCombination(..)` in isolation, there's no question it's impure and that's usually something we'd want to avoid. However, there's a bigger context we should consider.

`listCombination(..)` is not a function we interact with at all. We don't directly use it anywhere in the program, instead we let the transducing process use it.

Back in Chapter 5, we asserted that our goal with reducing side effects and defining pure functions was only that we expose pure functions to the API level of functions we'll use throughout our program. We observed that under the covers, inside a pure function, it can cheat for performance sake all it wants, as long as it doesn't violate the external contract of purity.

`listCombination(..)` is more an internal implementation detail of the transducing -- in fact, it'll often be provided by the transducing library for you! -- rather than a top-level method you'd interact with on a normal basis throughout your program.

Bottom line: I think it's perfectly acceptable, and advisable even, to use the performance-optimal impure version of `listCombination(..)`. Just make sure you document that it's impure with a code comment!

### Alternate Combination

So far, this is what we've derived with transducing:

```js
words
.reduce( transducer( listCombination ), [] )
.reduce( strConcat, "" );
// WRITTENSOMETHING
```

That's pretty good, but we have one final trick up our sleeve with transducing. And frankly, I think this part is what makes all this mental effort you've expended thus far, actually worth it.

Can we somehow "compose" these two `reduce(..)` calls to get it down to just one `reduce(..)`? Unfortunately, we can't just add `strConcat(..)` into the `compose(..)` call; its shape is not correct for that kind of composition.

But let's look at these two functions side-by-side:

```js
function strConcat(str1,str2) { return str1 + str2; }

function listCombination(list,val) { list.push( val ); return list; }
```

If you squint your eyes, you can almost see how these two functions are interchangable. They operate with different data types, but conceptually they do the same thing: combine two values into one.

In other words, `strConcat(..)` is a combination function!

That means that we can use *it* instead of `listCombination(..)` if our end goal is to get a string concatenation rather than a list:

```js
words.reduce( transducer( strConcat ), "" );
// WRITTENSOMETHING
```

Boom! That's transducing for you. I won't actually drop the mic here, but just gently set it down...

## What, Finally

Take a deep breath. That was a lot to digest.

Clearing our brains for a minute, let's turn our attention back to just using transducing in our applications without jumping through all those mental hoops to derive how it works.

Recall the helpers we defined earlier; let's rename them for clarity:

```js
var transduceMap = curry( function mapReducer(mapperFn,combinationFn){
	return function reducer(list,v){
		return combinationFn( list, mapperFn( v ) );
	};
} );

var transduceFilter = curry( function filterReducer(predicateFn,combinationFn){
	return function reducer(list,v){
		if (predicateFn( v )) return combinationFn( list, v );
		return list;
	};
} );
```

Also recall that we use them like this:

```js
var transducer = compose(
	transduceMap( strUppercase ),
	transduceFilter( isLongEnough ),
	transduceFilter( isShortEnough )
);
```

`transducer(..)` still needs a combination function (like `listCombination(..)` or `strConcat(..)`) passed to it to produce a transduce-reducer function, which then can then be used (along with an initial value) in `reduce(..)`.

But to express all these transducing steps more declaratively, let's make a `transduce(..)` utility that does these steps for us:

```js
function transduce(transducer,combinationFn,initialValue,list) {
	var reducer = transducer( combinationFn );
	return list.reduce( reducer, initialValue );
}
```

Here's our running example, cleaned up:

```js
var transducer = compose(
	transduceMap( strUppercase ),
	transduceFilter( isLongEnough ),
	transduceFilter( isShortEnough )
);

transduce( transducer, listCombination, [], words );
// ["WRITTEN","SOMETHING"]

transduce( transducer, strConcat, "", words );
// WRITTENSOMETHING
```

Not bad, huh!? See the `listCombination(..)` and `strConcat(..)` functions used interchangably as combination functions?

### Transducers.js

Finally, let's illustrate our running example using the `transducers-js` library (https://github.com/cognitect-labs/transducers-js):

```js
var transformer = transducers.comp(
	transducers.map( strUppercase ),
	transducers.filter( isLongEnough ),
	transducers.filter( isShortEnough )
);

transducers.transduce( transformer, listCombination, [], words );
// ["WRITTEN","SOMETHING"]

transducers.transduce( transformer, strConcat, "", words );
// WRITTENSOMETHING
```

Looks almost identical to above.

**Note:** The above snippet uses `transformers.comp(..)` since the library provides it, but in this case our `compose(..)` from Chapter 4 would produce the same outcome. In other words, composition itself isn't a transducing-sensitive operation.

The composed function in this snippet is named `transformer` instead of `transducer`. That's because if we call `transformer(listCombination)` (or `transformer(strConcat)`), we won't get a straight up transduce-reducer function as earlier.

`transducers.map(..)` and `transducers.filter(..)` are special helpers that adapt regular predicate or mapper functions into functions that produce a special transform object (with the transducer function wrapped underneath); the library uses these transform objects for transducing. The extra capabilities of this transform object abstraction are beyond what we'll explore, so consult the library's documentation for more information.

Since calling `transformer(..)` produces a transform object and not a typical two-arity transduce-reducer function, the library also provides `toFn(..)` to adapt the transform object to be useable by native array `reduce(..)`:

```js
words.reduce(
	transducers.toFn( transformer, strConcat ),
	""
);
// WRITTENSOMETHING
```

`into(..)` is another provided helper that automatically selects a default combination function based on the type of empty/initial value specified:

```js
transducers.into( [], transformer, words );
// ["WRITTEN","SOMETHING"]

transducers.into( "", transformer, words );
// WRITTENSOMETHING
```

When specifying an empty `[]` array, the `transduce(..)` called under the covers uses a default implementation of a function like our `listCombination(..)` helper. But when specifying an empty `""` string, something like our `strConcat(..)` is used. Cool!

As you can see, the `transducers-js` library makes transducing pretty straightforward. We can very effectively leverage the power of this technique without getting into the weeds of defining all those intermediate transducer-producing utilities ourselves.

## Summary

To transduce means to transform with a reduce. More specifically, a transducer is a composable reducer.

We use transducing to compose adjacent `map(..)`, `filter(..)`, and `reduce(..)` operations together. We accomplish this by first expressing `map(..)`s and `filter(..)`s as `reduce(..)`s, and then abstracting out the common combination operation to create unary reducer-producing functions that are easily composed.

Transducing primarily improves performance, which is especially obvious if used on a lazy sequence (async observable).

But more broadly, transducing is how we express a more declarative composition of functions that would otherwise not be directly composable. The result, if used appropriately as with all other techniques in this book, is clearer, more readable code! A single `reduce(..)` call with a transducer is easier to reason about than tracking multiple `reduce(..)` calls.
