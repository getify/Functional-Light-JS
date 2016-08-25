# Functional-Light JavaScript
# Chapter 4: Composing Functions

// TODO:

Visualizing `compose(..)`:

```
compose:
finalValue <-- func1 <-- func2 <-- ... <-- funcN <-- origValue
```


```js
function compose(...fns) {
	return function composed(result){
		while (fns.length > 0) {
			result = fns.pop()( result );
		}
		return result;
	};
}
```

// TODO: use reverse() and array destructuring here

```js
function compose(...fns) {
	if (fns.length == 2) {
		return compose2( fns[0], fns[1] );
	}

	return compose(
		...fns.slice( 0, fns.length - 2),
		compose2( ...fns.slice( fns.length - 2 ) )
	);

	function compose2(fn1,fn2) {
		return function composed(...args){
			return fn1( fn2( ...args ) );
		};
	}
}
```

// TODO: implement with `reduce(..)`




## Revisiting Points

Recall in "No Points" in Chapter 3 that we covered a style of programming called "point-free". The *point* of point-free is to use existing utilities and well-known patterns to reduce the clutter of our programs. We do this by reducing/elminating places where a function parameter ("point") passes through to an inner function call.

Here, the `mapper(..)` function calls the `double(..)` function, but that's unnecessary and can be simplified:

```js
function double(x) {
	return x * 2;
}

// instead of:
[1,2,3,4,5].map( function mapper(v){
	return double( v );
} );

// just do this:
[1,2,3,4,5].map( double );
```

Now that we've covered composition -- a trick that will be immensely helpful in many areas of FP -- in detail in this chapter, let's revisit point-free style with a scenario that's a fair bit more complex to refactor:

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
