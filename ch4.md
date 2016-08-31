# Functional-Light JavaScript
# Chapter 4: Composing Functions

By now, I hope you're feeling much more comfortable with what it means to use functions for functional programming.

A functional programmer sees every function in their program like a little simple lego piece. They recognize the blue 2x2 brick at a glance, and know exactly how it works and what they can do with it. As they go about building a bigger complex lego model, as they need each next piece, they already have an instinct for which of their many spare pieces to grab.

But sometimes you take the blue 2x2 brick and the gray 4x1 brick and put them together in a certain way, and you realize, "that's a useful piece that I need often". So now you've come up with a new "piece", a combination of two other pieces, and you can reach for that kind of piece now anytime you need it. It's more effective to recognize and use this compound blue-gray L-brick thing where it's needed than to separately think about the two constitutent bricks each time.

Functions come in a variety of shapes and sizes. And we can define a certain combination of them to make a new composite function that will be handy in various parts of the program. This process of using functions together is called composition.

## Output To Input

We've already seen a few examples of composition. For example, in Chapter 3 our discussion of `unary(..)` included this expression: `unary(adder(3))`. Think about what's happening there.

To compose two functions together, pass the output of the first function call as the input of the second function call. In `unary(adder(3))`, the `adder(3)` call returns a value (a function); that value is directly passed as an argument to `unary(..)`, which also returns a value (another function).

To take a step back and visualize the conceptual flow of data, consider:

```
functionValue <-- unary <-- adder <-- 3
```

`3` is the input to `adder(..)`. The output of `adder(..)` is the input to `unary(..)`. The output of `unary(..)` is `functionValue`. This is called the composition of `unary(..)` and `adder(..)`.

Let's examine composition in action one step at a time. Consider these two utilitites you might have in your program:

```js
function words(str) {
	return String( str )
		.toLowerCase()
		.split( /\s|\b/ )
		.filter( function alpha(v){
			return /^[\w]+$/.test( v );
		} );
}

function unique(list) {
	var uniqList = [];

	for (let i = 0; i < list.length; i++) {
		// value not yet in the new list?
		if (uniqList.indexOf( list[i] ) === -1 ) {
			uniqList.push( list[i] );
		}
	}

	return uniqList;
}
```

To use these two utilities to analyze a string of text:

```js
var text = "To compose two functions together, pass the \
output of the first function call as the input of the \
second function call.";

var wordsFound = words( text );
var wordsUsed = unique( wordsFound );

wordsUsed;
// ["to","compose","two","functions","together","pass",
// "the","output","of","first","function","call","as",
// "input","second"]
```

We name the array output of `words(..)` as `wordsFound`. The input of `unique(..)` is also an array, so we can pass the `wordsFound` into it. But let's now skip the intermediate `wordsFound` variable, and just use the two function calls together:

```js
var wordsUsed = unique( words( text ) );
```

**Note:** Though we typically read the function calls right-to-left, `unique(..)` and then `words(..)`, the order of operations will actually be inner-to-outer; `words(..)` will run first and then `unique(..)`. Later we'll talk about a pattern that reverses the order of execution to follow our natural left-to-right reading.

What if we now decided this new compound lego -- the pairing of `words(..)` and `unique(..)` in that specific order of execution -- is something we'd like to use in various other parts of our application? We could define a utility function that combined them:

```js
function uniqueWords(str) {
	return unique( words( str ) );
}
```

`uniqueWords(..)` takes a string and returns an array. It's a composition of `unique(..)` and `words(..)`, as it fulfills the data flow:

```
wordsUsed <-- unique <-- words <-- text
```

It may seem like `<-- unique <-- words` is the only order these two functions can be composed. But we could actually compose them in the opposite order to create a utility with a bit of a different purpose:

```js
function letters(str) {
	return words( unique( str ) );
}

var chars = letters( "How are you Henry?" );
chars;
// ["h","o","w","a","r","e","y","u","n"]
```

This works because the `words(..)` utility, for value type safety sake, coerces its input to a string using `String(..)`. So the array that `unique(..)` returns becomes the string `"H,o,w, ,a,r,e,y,u,n,?"`, and then `words(..)` processes it into the `chars` array shown.

Admittedly, this is a slightly contrived example. But the point is that function compositions are not always unidirectional. Sometimes we put the gray brick on top of the blue brick, and sometimes we put the blue brick on top.

### General Composition

Recall from earlier:

```js
function uniqueWords(str) {
	return unique( words( str ) );
}
```

This definition works, but it may not be ideal to define it that way. As we saw in "No Points" in Chapter 3, it's not point-free, because of the `str` parameter-to-argument passing.

We could observe that the general form of the composition in `uniqueWords(..)` looks like this:

```js
function composed(origValue) {
	return fn2( fn1( origValue ) );
}
```

So let's define a helper utility for composing any two functions in this same way:

```js
function compose(fn2,fn1) {
	return function composed(origValue){
		return fn2( fn1( origValue ) );
	};
}

// or the ES6 => form
var compose =
	(fn2,fn1) =>
		origValue => fn2( fn1( origValue ) );
```

Now, here's a point-free definition of `uniqueWords(..)`:

```js
var uniqueWords = compose( unique, words );
```

Did you notice that we defined the parameter order as `fn2,fn1`, and furthermore that it's the second function listed (aka `fn1` parameter name) that runs first, then the first function listed (`fn2`)? In other words, the functions compose from right-to-left.

That may seem like a strange choice, but there are some reasons for it. Most typical FP libraries define their `compose(..)` to work right-to-left in terms of ordering, so we're sticking with that convention.

But why? I think the easiest explanation (but perhaps not the most historically accurate) is that we're listing them to match the order they are written if done manually, or rather the order we encounter them when reading from left-to-right. `unique(words(str))` has them in the order `unique,words`, so we make our `compose(..)` utility take them in that order, too.

If we can define the composition of two functions, we can just keep going to support composing any number of functions. The general data visualization flow for any number of functions being composed looks like this:

```
finalValue <-- func1 <-- func2 <-- ... <-- funcN <-- origValue
```

And we can implement such a general `compose(..)` utility like this:

```js
function compose(...fns) {
	return function composed(result){
		// copy the array of functions
		var list = fns.slice();

		while (list.length > 0) {
			// take the last function off the end of the list
			// and execute it
			result = list.pop()( result );
		}

		return result;
	};
}

// or the ES6 => form
var compose =
	(...fns) =>
		result => {
			var list = fns.slice();

			while (list.length > 0) {
				// take the last function off the end of the list
				// and execute it
				result = list.pop()( result );
			}

			return result;
		};
```

Now let's look at an example of composing more than two functions. Recalling our `uniqueWords(..)` composition example, let's add a `skipShortWords(..)` to the mix:

```js
function skipShortWords(list) {
	var filteredList = [];

	for (let i = 0; i < list.length; i++) {
		if (list[i].length > 4) {
			filteredList.push( list[i] );
		}
	}

	return filteredList;
}
```

Let's define `biggerWords(..)` that includes `skipShortWords(..)`. The manual composition equivalent we're looking for is `skipShortWords(unique(words(text)))`, so let's do it with `compose(..)`:

```js
var text = "To compose two functions together, pass the \
output of the first function call as the input of the \
second function call.";

var biggerWords = compose( skipShortWords, unique, words );

var wordsUsed = biggerWords( text );

wordsUsed;
// ["compose","functions","together","output","first",
// "function","input","second"]
```

Let's recall `partialRight(..)` from Chapter 3 to do something more interesting with composition. We can build a right-partial application of `compose(..)` itself, pre-specifying the second and third arguments (`unique(..)` and `words(..)`, respectively); we'll call it `filterWords(..)` (see below).

Then, we can complete the composition multiple times by calling `filterWords(..)`, but with different first-arguments for each:

```js
// uses a `<= 4` check instead of the `> 4` check
// that `skipShortWords(..)` uses
function skipLongWords(list) { /* .. */ }

var filterWords = partialRight( compose, unique, words );

var biggerWords = filterWords( skipShortWords );
var shorterWords = filterWords( skipLongWords );

biggerWords( text );
// ["compose","functions","together","output","first",
// "function","input","second"]

shorterWords( text );
// ["to","two","pass","the","of","call","as"]
```

Of course, you can also `curry(..)` a composition, though because of right-to-left execution, you might more often want to curry `reverseArgs(compose)` rather than just `compose(..)` itself.

**Note:** Since `curry(..)` (at least the way we implemented it in Chapter 3) relies on either detecting the arity (`length`) or having it manually specified, and `compose(..)` is a variadic function, you'll need to manually specify the intended arity: `curry( compose, 3 )`.

### Alternate Implementations

While you may very well never implement your own `compose(..)` to use in production, and rather just use a library's implementation as provided, I've found that understanding how it works under the covers actually helps solidify general FP concepts very well.

So let's examine some different implementation options for `compose(..)`. We'll also see there are some pros/cons to each implementation, especially performance.

We'll be looking at the `reduce(..)` utility in detail later in the text, but for now, just know that it reduces a list (array) to a single finite value. It's like a fancy loop.

For example, if you did an addition-reduction across the list of numbers `[1,2,3,4,5,6]`, you'd be looping over them adding them together as you go. The reduction would add `1` to `2`, and add that result to `3`, and then add that result to `4`, and so on, resulting in the final summation: `21`.

The original version of `compose(..)` uses a loop and eagerly (aka, immediately) calculates the result of one call to pass into the next call. We can do that same thing with `reduce(..)`:

```js
function compose(...fns) {
	return function composed(result){
		return fns.reverse().reduce( function reducer(result,fn){
			return fn( result );
		}, result );
	};
}

// or the ES6 => form
var compose = (...fns) =>
	result =>
		fns.reverse().reduce(
			(result,fn) =>
				fn( result )
			, result
		);
```

Notice that the `reduce(..)` looping happens each time the final `composed(..)` function is run, and that each intermediate `result(..)` is passed along to the next iteration as the input to the next call.

The advantage of this implementation is that the code is more concise and also that it uses a well-known FP construct: `reduce(..)`. And the performace of this implementation is also similar to the original `for`-loop version.

However, this implementation is limited in that the outer composed function (aka, the first function in the composition) can only receive a single argument. Most other implementations pass along all arguments to that first call. If every function in the composition is unary, this is no big deal. But if you need to pass multiple arguments to that first call, you'd want a different implementation.

To fix that first call single-argument limitation, we can still use `reduce(..)` but produce a lazy-evaluation function wrapping:

```js
function compose(...fns) {
	return fns.reverse().reduce( function reducer(fn1,fn2){
		return function composed(...args){
			return fn2( fn1( ...args ) );
		};
	} );
}

// or the ES6 => form
var compose =
	(...fns) =>
		fns.reverse().reduce( (fn1,fn2) =>
			(...args) =>
				fn2( fn1( ...args ) )
		);
```

Notice that we return the result of the `reduce(..)` call directly, which is itself a function, not a computed result. *That* function lets us pass in as many arguments as we want, passing them all down the line to the first function call in the composition, then bubbling up each result through each subsequent call.

Instead of calculating the running result as passing it along as the `reduce(..)` looping proceeds, this implementation runs the `reduce(..)` looping **once** up front, at composition time, and defers all the function call calculations -- referred to as lazy calculation. Each partial result of the reduction is a successively more wrapped function.

When you call the final composed function and provide one or more arguments, all the levels of the big nested function, from the inner most call to the outer, are executed in succession (not via a loop).

The performance characteristics will potentially be different than in the previous `reduce(..)`-based implementation. Here, `reduce(..)` only once to produce a big composed function, and then this composed function call simply executes all its nested functions. In the former version, `reduce(..)` would be run every time.

Your mileage may vary on which implementation is better, but keep in mind that this latter implementation isn't limited in argument count the way the former one is.

We could also define `compose(..)` using recursion. The recursive definition for `compose(fn1,fn2, .. fnN)` would look like:

```
compose( compose(fn1,fn2, .. fnN-1), fnN );
```

**Note:** We will cover recursion in deep detail in a later chapter, so if this approach seems confusing, feel free to skip it for now and come back later after having read that chapter.

Here's how we implement	`compose(..)` with recursion:

```js
function compose(...fns) {
	// pull off the last two arguments
	var [ fn1, fn2, ...rest ] = fns.reverse();

	var composedFn = function composed(...args){
		return fn2( fn1( ...args ) );
	};

	if (rest.length == 0) return composedFn;

	return compose( ...rest.reverse(), composedFn );
}

// or the ES6 => form
var compose =
	(...fns) => {
		// pull off the last two arguments
		var [ fn1, fn2, ...rest ] = fns.reverse();

		var composedFn =
			(...args) =>
				fn2( fn1( ...args ) );

		if (rest.length == 0) return composedFn;

		return compose( ...rest.reverse(), composedFn );
	};
```

I think the benefit of a recursive implementation is mostly conceptual. I personally find it much easier to think about a repetitive action in recursive terms instead of in a loop where I have to track the running result, so I prefer the code to express it that way.

Others will find the recursive approach quite a bit more daunting to mentally juggle. I invite you to make your own evaluations.

## Reordered Composition

We talked earlier about the right-to-left ordering of standard `compose(..)` implementations. The advantage is in listing the arguments (functions) in the same order they'd appear if doing the composition manually. The disadvantage is they're listed in the reverse order that they execute, which can be confusing.

The reverse ordering, where you compose from left-to-right, has a common name: `pipe(..)`:

```js
function pipe() {
	return function piped(result){
		var list = fns.slice();

		while (list.length > 0) {
			// take the first function from the list
			// and execute it
			result = list.shift()( result );
		}

		return result;
	};
}
```

// TODO

## Not Just Abstraction

It might seem like the purpose of composition, either manually or with a `compose(..)` utility, is DRY (don't repeat yourself) abstraction. But let's more carefully examine.

// TODO

## Revisiting Points

Now that we've covered composition -- a trick that will be immensely helpful in many areas of FP -- in detail in this chapter, let's revisit point-free style from Chapter 3 with a scenario that's a fair bit more complex to refactor:

```js
// given: ajax( url, data, cb )

var getPerson = partial( ajax, "http://some.api/person" );
var getLastOrder = partial( ajax, "http://some.api/order", { id: -1 } );

getLastOrder( function orderFound(order){
	getPerson( { id: order.personId }, function personFound(person){
		output( person.name );
	} );
} );
```

The "points" we'd like to remove are the `order` and `person` parameter references.

Let's start by trying to get the `person` "point" out of the `personFound(..)` function. To do so, let's first to define:

```js
function extractName(person) {
	return person.name;
}
```

But let's observe that this operation could instead be expressed in generic terms: extracting any property by name off of any object. Let's call such a utility `prop(..)`:

```js
function prop(name,obj) {
	return obj[name];
}

var extractName = partial( prop, "name" );
```

**Note:** Don't miss that `extractName(..)` here hasn't actually extracted anything yet. We partially applied `prop(..)` to make a function that's waiting to extract the `"name"` property from whatever object we pass into it. We could also have specified `curry(prop)("name")`.

Next, let's reduce our example's nested lookup calls to this:

```js
getLastOrder( function orderFound(order){
	getPerson( { id: order.personId }, outputPersonName );
} );
```

How can we define `outputPersonName(..)`? To visualize what we need, think about the desired flow of data:

```
output <-- extractName <-- person
```

`outputPersonName(..)` needs to be a function that takes an (object) value, passes it into `extractName(..)`, then passes that value to `output(..)`.

Hopefully you recognized that as a `compose(..)` operation. So we can define `outputPersonName(..)` as:

```
var outputPersonName = compose( output, extractName );
```

The `outputPersonName(..)` function we just created is the callback provided to `getPerson(..)`. So we can define a function called `processPerson(..)` that presets the callback argument, using `partialRight(..)`:

```js
var processPerson = partialRight( getPerson, outputPersonName );
```

Let's reconstruct the nested lookups example again with our new function:

```js
getLastOrder( function orderFound(order){
	processPerson( { id: order.personId } );
} );
```

Phew, we're making good progress!

But we need to keep going and remove the `order` "point". The next step is to observe that `personId` can be extracted from an object (like `order`) via `prop(..)`, just like we did with `name` on the `person` object:

```js
var extractPersonId = partial( prop, "personId" );
```

To construct the `{ id: .. }` object that needs to be passed to `processPerson(..)`, let's make another utility for wrapping a value in an object at a specified property name -- this is kind of like the opposite of `prop(..)`. I'll call this utility `setProp(..)`:

```js
function setProp(name,value) {
	return {
		[name]: value
	};
}

var personData = partial( setProp, "id" );
```

To use `processPerson(..)` to perform the lookup of a person from a received `order` value, the conceptual flow of data through operations we need is:

```
processPerson <-- personData <-- extractPersonId <-- order
```

So we'll just use `compose(..)` again to define a `lookupPerson(..)` utility:

```js
var lookupPerson = compose( processPerson, personData, extractPersonId );
```

And... that's it! Putting the whole example back together without any "points":

```js
var getPerson = partial( ajax, "http://some.api/person" );
var getLastOrder = partial( ajax, "http://some.api/order", { id: -1 } );

var extractName = partial( prop, "name" );
var outputPersonName = compose( output, extractName );
var processPerson = partialRight( getPerson, outputPersonName );
var personData = partial( setProp, "id" );
var extractPersonId = partial( prop, "personId" );
var lookupPerson = compose( processPerson, personData, extractPersonId );

getLastOrder( lookupPerson );
```

Wow. Point-free. And `compose(..)` turned out to be really helpful in two places!

I think in this case, even though the steps to derive our final answer were a bit drawn out, the end result is much more readable code, because we've ended up explicitly calling out each step.

And even if you didn't like seeing/naming all those intermediate steps, you can preserve point-free but wire the expressions together without individual variables:

```js
partial( ajax, "http://some.api/order", { id: -1 } )
(
	compose(
		partialRight(
			partial( ajax, "http://some.api/person" ),
			compose( output, partial( prop, "name" ) )
		),
		partial( setProp, "id" ),
		partial( prop, "personId" )
	)
);
```

This snippet is less verbose for sure, but I think it's less readable than the previous snippet where each operation is its own variable. Either way, composition helped us with our point-free style.

## Summary

Composition is cool.
