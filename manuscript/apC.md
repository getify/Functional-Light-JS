# Functional-Light JavaScript
# Appendix C: FP Libraries

If you've been reading this book from start to finish, take a minute to stop and look back how far you've come since Chapter 1. It's been quite a journey. I hope you've learned a lot and gained insight into thinking functionally for your own programs.

I want to close this book leaving you with some quick pointers of working with official FP libraries. This is not an exhaustive documentation on each, but a quick glance at the things you should be aware of as you venture beyond "functional-light" into true FP.

Wherever possible, I recommend you *not* reinvent any wheels. If you find an FP library that suits your needs, use it. Only use the ad hoc helper utilities from this book -- or invent ones of your own! -- if you can't find a suitable library method for your circumstance.

## Stuff To Investigate

Let's expand the list of FP libraries to be aware of, from Chapter 1. We won't cover all of these (as there's a lot of overlap), but here are the ones that should probably be on your radar screen:

* [Ramda](http://ramdajs.com): General FP Utilities
* [Sanctuary](https://github.com/sanctuary-js/sanctuary): Ramda Companion For FP Types
* [lodash/fp](https://github.com/lodash/lodash/wiki/FP-Guide): General FP Utilities
* [functional.js](http://functionaljs.com/): General FP Utilities
* [Immutable](https://github.com/facebook/immutable-js): Immutable Data Structures
* [Mori](https://github.com/swannodette/mori): (ClojureScript Inspired) Immutable Data Structures
* [Seamless-Immutable](https://github.com/rtfeldman/seamless-immutable): Immutable Data Helpers
* [tranducers-js](https://github.com/cognitect-labs/transducers-js): Transducers
* [monet.js](https://github.com/cwmyers/monet.js): Monadic Types

There are dozens of other fine libraries not on this list. Just because it's not on my list here doesn't mean it's not good, nor is this list a particular endorsement. It's just a quick glance at the landscape of FP-in-JavaScript. A much longer list of FP resources can be [found here](https://github.com/stoeffel/awesome-fp-js).

One resource that's extremely important to the FP world -- it's not a library but more an encyclopedia! -- is [Fantasy Land](https://github.com/fantasyland/fantasy-land) (aka FL).

This is definitely not light reading for the faint of heart. It's a complete detailed roadmap of all of FP as it's interpreted in JavaScript. FL has become a de facto standard for JavaScript FP libraries to adhere to, to ensure maximum interoperability.

Fantasy Land is pretty much the exact opposite of "functional-light". It's the full-on no holds barred approach to FP in JavaScript. That said, as you venture beyond this book, it's undeniable that FL will be down that road for you. I'd recommend you bookmark it, and go back to it after you've had at least 6 months of real world practice with this book's concepts.

## Ramda (0.23.0)

From the [Ramda documentation](http://ramdajs.com/):

> Ramda functions are automatically curried.
>
> The parameters to Ramda functions are arranged to make it convenient for currying. The data to be operated on is generally supplied last.

I find that design decision to be one of Ramda's strengths. It's also important to note that Ramda's form of currying (as with most libraries, it seems) is the "loose currying" we talked about in Chapter 3.

The final example of Chapter 3 -- recall defining a point-free `printIf(..)` utility -- can be done with Ramda like this:

```js
function output(msg) {
	console.log( msg );
}

function isShortEnough(str) {
	return str.length <= 5;
}

var isLongEnough = R.complement( isShortEnough );

var printIf = R.partial( R.flip( R.when ), [output] );

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );			// Hello
printIf( isShortEnough, msg2 );

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );			// Hello World
```

A few differences to point out compared to Chapter 3's approach:

* We use `R.complement(..)` instead of `not(..)` to create a negating function `isLongEnough(..)` around `isShortEnough(..)`.

* We use `R.flip(..)` instead of `reverseArgs(..)`. It's important to note that `R.flip(..)` only swaps the first two arguments, whereas `reverseArgs(..)` reverses all of them. In this case, `flip(..)` is more convenient for us, so we don't need to do `partialRight(..)` or any of that kind of juggling.

* `R.partial(..)` takes all of its subsequent arguments (beyond the function) as a single array.

* Because Ramda is using loose currying, we don't need to use `R.uncurryN(..)` to get a `printIf(..)` that takes both its arguments. If we did, it would look like `R.uncurryN( 2, .. )` wrapped around the `R.partial(..)` call; but, that's not necessary.

Ramda is a very popular and powerful library. It's a really good place to start if you're practicing adding FP to your code base.

## Lodash/fp (4.17.4)

Lodash is one of the most popular libraries in the entire JS ecosystem. They publish an "FP friendly" version of their API as ["lodash/fp"](https://github.com/lodash/lodash/wiki/FP-Guide).

In Chapter 8, we looked at composing standalone list operations (`map(..)`, `filter(..)`, and `reduce(..)`). Here's how we could do it with "lodash/fp":

```js
var sum = (x,y) => x + y;
var double = x => x * 2;
var isOdd = x => x % 2 == 1;

fp.compose( [
	fp.reduce( sum )( 0 ),
	fp.map( double ),
	fp.filter( isOdd )
] )
( [1,2,3,4,5] );					// 18
```

Instead of the more familiar `_.` namespace prefix, "lodash/fp" defines its methods with `fp.` as the namespace prefix. I find that a helpful distinguisher, and also generally more easy on my eyes than `_.` anyway!

Notice that `fp.compose(..)` (also known as `_.flowRight(..)` in lodash proper) takes an array of functions instead of individual arguments.

You cannot beat the stability, widespread community support, and performance of lodash. It's a solid bet for your FP explorations.

## Mori (0.3.2)

In Chapter 6, we already briefly glanced at the Immutable.js library, probably the most well-known for immutable data structures.

Let's instead look at another popular library: [Mori](https://github.com/swannodette/mori). Mori is designed with a different (ostensibly more FP-like) take on API: it uses standalone functions instead of methods directly on the values.

```js
var state = mori.vector( 1, 2, 3, 4 );

var newState = mori.assoc(
	mori.into( state, Array.from( {length: 39} ) ),
	42,
	"meaning of life"
);

state === newState;						// false

mori.get( state, 2 );					// 3
mori.get( state, 42 );					// undefined

mori.get( newState, 2 );				// 3
mori.get( newState, 42 );				// "meaning of life"

mori.toJs( newState ).slice( 1, 3 );	// [2,3]
```

Some interesting things to point out about Mori for this example:

* We're using a `vector` instead of a `list` (as one might assume), mostly because the documentation says it behaves more like we expect JS arrays to be.

* We cannot just randomly set a position past the end of the vector like we can with JS arrays; that throws an exception. So we have to first "grow" the vector using `mori.into(..)` with an array of the appropriate size of extra slots we want. Once we have a vector with 43 slots (4 + 39), we can set the final slot (position `42`) to the `"meaning of life"` value using the `mori.assoc(..)` method.

* The intermediate step of creating a larger vector with `mori.into(..)` and then creating another from it with `mori.assoc(..)` might sound inefficient. But the beauty of immutable data structures is that no cloning is going on here. Each time a "change" is made, the new data structure is just tracking the difference from the previous state.

Mori is heavily inspired by ClojureScript. Its API will be very familiar if you have experience (or currently work in!) that language. Since I don't have that experience, I find the method names a little strange to get used to.

But I really like the standalone function design instead of methods on values. Mori also has some functions that automatically return regular JS arrays, which is a nice convenience.

## Summary

JavaScript is not particularly designed as an FP language. However, it does have enough of the basics (like function values, closures, etc) for us to make it FP-friendly. And the libraries we've examined here will help you do that.

Armed with the concepts from this book, you're ready to start tackling real world code. Find a good FP library and jump in. Practice, practice, practice!

So... that's it. I've shared what I have for you, for now. I hereby officially certify you as a "Functional-Light JavaScript" programmer! It's time to close out this "chapter" of our story of learning FP together. But my learning journey continues; I hope your's does, too!
