# Functional-Light JavaScript
# Appendix A: Transducing

Transducing is a more advanced technique than we've covered in this book. It extends many of the concepts from Chapter 8 on list operations.

I wouldn't necessarily call this topic strictly "Functional-Light", but more like a bonus on top. I've left this to an appendix because you might very well need to skip the discussion for now and come back to it once you feel fairly comfortable with -- and make sure you've practiced! -- the main book concepts.

To be honest, even after teaching transducing many times, and writing this chapter, I am still trying to fully wrap my brain around this technique. So don't feel bad if it twists you up. Bookmark this appendix and come back when you're ready.

Transducing means transforming with reduction.

I know that may sound like a jumble of words that confuses more than it clarifies. But let's take a look at how powerful it can be. I actually think it's one of the best illustrations of what you can do once you grasp the principles of Functional-Light Programming.

As with the rest of this book, my approach is to first explain *why*, then *how*, the finally boil it down to a simplified, repeatable *what*. That's often backwards of how many teach, but I think you'll learn the topic more deeply this way.

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

Wouldn't it be better (both for readability and performacne) if we could combine the `isLongEnough(..)` predicate with the `isShortEnough(..)` predicate? You could do so manually:

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
.reduce( strConcat );
// "WRITTENSOMETHING"
```

Can you envision a composition that includes all of these steps: `map(strUppercase)`, `filter(isLongEnough)`, `filter(isShortEnough)`, `reduce(strConcat)`? The shape of each operator is different, so they won't directly compose together. We need to bend their shapes a little bit to fit them together.

Hopefully these observations have illustrated why simple fusion-style composition isn't up to the task. We need a more powerful technique, and transducing is that tool.

## How, Next

Let's talk about how we might derive a composition of mappers, predicates and/or reducers.

Make sure you're clear on this: you won't ever have to go through all these mental steps in your own programming. Once you understand and can recognize the problem transducing solves, you'll be able just jump straight to using a `transduce(..)` utility from a FP library and move on with the rest of your coding!

// TODO

Example:

```js
function listCombination(list,v) {
	list.push( v );
	return list;
}

function filterReducer(predicateFn) {
	return function toCombine(combineFn){
		return function reducer(list,v){
			if (predicateFn( v )) combineFn( list, v );
			return list;
		};
	}
}

function isLongEnough(str) { return str.length >= 5; }
function isShortEnough(str) { return str.length <= 10; }

var words = [ "You", "have", "written", "something", "very", "interesting" ];

// words
// .filter( isLongEnough )
// .filter( isShortEnough );


// words
// .reduce( filterReducer( isLongEnough ), [] )
// .reduce( filterReducer( isShortEnough ), [] );


words
.reduce(
	compose(
		filterReducer( isShortEnough ),
		filterReducer( isLongEnough )
	)( listCombination ),
	[]
);
```

## What, Finally

So, how do we use transducing in our applications without jumping through all those mental hoops?

// TODO

### Transducers.js

Now let's illustrate our running example with the `transducers-js` library (https://github.com/cognitect-labs/transducers-js):

```js
function strUppercase(str) { return str.toUpperCase(); }
function strConcat(str1,str2) { return str1 + str2; }

function listCombination(list,v) {
	list.push( v );
	return list;
}

var transformer = transducers.comp(
	transducers.filter( isShortEnough ),
	transducers.filter( isLongEnough ),
	transducers.map( strUppercase )
);

transducers.transduce( transformer, listCombination, [], words );
// ["WRITTEN","SOMETHING"]

transducers.transduce( transformer, strConcat, "", words );
// WRITTENSOMETHING
```

**Note:** This above snippet uses `transformers.compose(..)` since the library provides it, but in this example our `compose(..)` from Chapter 4 would have produced the same outcome.

The composed function in this snippet is named `transformer` instead of `transducer`. That's because if we call `transformer(listCombination)` (or `transformer(strConcat)`), we won't get a straight up transducer/reducer function as earlier.

`transducers.map(..)` and `transducers.filter(..)` are special helpers that adapt regular predicate or mapper functions into functions that produce a special transform object (with the transducer function wrapped underneath); the library uses these transform objects for transducing. The extra capabilities of the transform object abstractino are beyond what we'll explore, so consult the documentation for more information.

Since calling `transformer(..)` produces a transform object and not a typical two-arity transducer-reducer function, the library also provides a `toFn(..)` adapter to make it suitable for use with native array `reduce(..)`:

```js
words.reduce(
	transducers.toFn( transformer, strConcat ),
	""
);
// WRITTENSOMETHING
```

`into(..)` is another provider helper that automatically selects a default combination function based on the type of empty/initial value specified:

```js
transducers.into( [], transformer, words );
// ["WRITTEN","SOMETHING"]

transducers.into( "", transformer, words );
// WRITTENSOMETHING
```

When specifying an empty `[]` array, the `transduce(..)` called under the covers uses a default implementation of a function like our `listCombination(..)` helper. But when specifying an empty `""` string, something like our `strConcat(..)` is used. Cool!

As you can see, the `transducers-js` library makes transducing very straightforward. We can easily leverage the power of this technique without getting into the weeds of making those transducer-producing utilities ourselves.

## Summary

To transduce means to transform with a reduce. More specifically, a transducer is a composable reducer.

More practically, we use transducing to compose adjacent `map(..)`, `filter(..)`, and `reduce(..)` operations together. We accomplish this by first expressing `map(..)`s and `filter(..)`s as `reduce(..)`s.

A transducer is the composition of multiple adjacent reducers. Composing reducers can't just be done naively with `compose(..)` because of the multiple-parameters signature of a reducer. The trick is parameterizing the common combination operation so we create unary functions that can be composed.

Transducing primarily improves performance, which is especially obvious if used on a lazy sequence (async observable). But more broadly, transducing is how we express a more declarative composition of functions that would otherwise not be directly composable.
