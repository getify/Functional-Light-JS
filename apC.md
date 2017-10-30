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
* [monet.js](https://github.com/monet/monet.js): Monadic Types

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

printIf( isShortEnough, msg1 );            // Hello
printIf( isShortEnough, msg2 );

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );            // Hello World
```

A few differences to point out compared to Chapter 3's approach:

* We use `R.complement(..)` instead of `not(..)` to create a negating function `isLongEnough(..)` around `isShortEnough(..)`.

* We use `R.flip(..)` instead of `reverseArgs(..)`. It's important to note that `R.flip(..)` only swaps the first two arguments, whereas `reverseArgs(..)` reverses all of them. In this case, `flip(..)` is more convenient for us, so we don't need to do `partialRight(..)` or any of that kind of juggling.

* `R.partial(..)` takes all of its subsequent arguments (beyond the function) as a single array.

* Because Ramda is using loose currying, we don't need to use `R.uncurryN(..)` to get a `printIf(..)` that takes both its arguments. If we did, it would look like `R.uncurryN( 2, .. )` wrapped around the `R.partial(..)` call; but, that's not necessary.

Ramda is a very popular and powerful library. It's a really good place to start if you're practicing adding FP to your code base.

## Lodash/fp (4.17.4)

Lodash is one of the most popular libraries in the entire JS ecosystem. They publish an "FP friendly" version of their API as ["lodash/fp"](https://github.com/lodash/lodash/wiki/FP-Guide).

In Chapter 9, we looked at composing standalone list operations (`map(..)`, `filter(..)`, and `reduce(..)`). Here's how we could do it with "lodash/fp":

```js
var sum = (x,y) => x + y;
var double = x => x * 2;
var isOdd = x => x % 2 == 1;

fp.compose( [
    fp.reduce( sum )( 0 ),
    fp.map( double ),
    fp.filter( isOdd )
] )
( [1,2,3,4,5] );                    // 18
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

state === newState;                        // false

mori.get( state, 2 );                    // 3
mori.get( state, 42 );                    // undefined

mori.get( newState, 2 );                // 3
mori.get( newState, 42 );                // "meaning of life"

mori.toJs( newState ).slice( 1, 3 );    // [2,3]
```

Some interesting things to point out about Mori for this example:

* We're using a `vector` instead of a `list` (as one might assume), mostly because the documentation says it behaves more like we expect JS arrays to be.

* We cannot just randomly set a position past the end of the vector like we can with JS arrays; that throws an exception. So we have to first "grow" the vector using `mori.into(..)` with an array of the appropriate size of extra slots we want. Once we have a vector with 43 slots (4 + 39), we can set the final slot (position `42`) to the `"meaning of life"` value using the `mori.assoc(..)` method.

* The intermediate step of creating a larger vector with `mori.into(..)` and then creating another from it with `mori.assoc(..)` might sound inefficient. But the beauty of immutable data structures is that no cloning is going on here. Each time a "change" is made, the new data structure is just tracking the difference from the previous state.

Mori is heavily inspired by ClojureScript. Its API will be very familiar if you have experience (or currently work in!) that language. Since I don't have that experience, I find the method names a little strange to get used to.

But I really like the standalone function design instead of methods on values. Mori also has some functions that automatically return regular JS arrays, which is a nice convenience.

## Bonus: FPO

In Chapter 2, we introduced a pattern for dealing with arguments called "named arguments", which in JS means using an object at the call-site to map properties to destructured function parameters:

```js
function foo( {x,y} = {} ) {
    console.log( x, y );
}

foo( {
    y: 3
} );                    // undefined 3
```

Then in Chapter 3, we talked about extending our ideas of currying and partial application to work with named arguments, like this:

```js
function foo({ x, y, z } = {}) {
    console.log( `x:${x} y:${y} z:${z}` );
}

var f1 = curryProps( foo, 3 );

f1( {y: 2} )( {x: 1} )( {z: 3} );
```

One major benefit of this style is being able to pass arguments (even with currying or partial application!) in any order without needing to do `reverseArgs(..)`-style juggling of parameters. Another is being able to omit an optional argument by simply not specifying it, instead of passing an ugly placeholder.

In my journey learning FP, I've regularly been frustrated by both of those irritations of functions with traditional positional arguments; thus I've really appreciated the named arguments style for addressing those concerns.

One day, I was musing about with this style of FP coding, and wondered what it would be like if a whole FP library had all its API methods exposed in this style. I started experimenting, showed those experiments to a few FP folks, and got some positive feedback.

From those experiments, eventually the FPO (pronounced "eff-poh") library (https://github.com/getify/fpo) was born; FPO stands for FP-with-Objects, in case you were wondering.

From the documentation:

```js
// Ramda's `reduce(..)`
R.reduce(
    (acc,v) => acc + v,
    0,
    [3,7,9]
);  // 19

// FPO named-argument method style
FPO.reduce({
    arr: [3,7,9],
    fn: ({acc,v}) => acc + v
}); // 19
```

With traditional library implementations of `reduce(..)` (like Ramda), the initial value parameter is in the middle, and not optional. FPO's `reduce(..)` method can take the arguments in any order, and you can omit the optional initial value if desired.

As with most other FP libraries, FPO's API methods are automatically loose-curried, so you can not only provide arguments in any order, but specialize the function by providing its arguments over multiple calls:

```js
var f = FPO.reduce({ arr: [3,7,9] });

// later

f({ fn: ({acc,v}) => acc + v });    // 19
```

Lastly, all of FPO's API methods are also exposed using the traditional positional arguments style -- you'll find they're all very similar to Ramda and other libraries -- under the `FPO.std.*` namespace:

```js
FPO.std.reduce(
    (acc,v) => acc + v,
    undefined,
    [3,7,9]
);  // 19
```

If FPO's named argument form of FP appeals to you, perhaps check out the library and see what you think. It has a full test suite and most of the major FP functionality you'd expect, including everything we covered in this text to get you up and going with Functional-Light JavaScript!

## Bonus #2: fasy

FP iterations (`map(..)`, `filter(..)`, etc) are almost always modeled as synchronous operations, meaning we eagerly run through all the steps of the iteration immediately. As a matter of fact, other FP patterns like composition and even transducing are also iterations, and are also modeled exactly this way.

But what happens if one or more of the steps in an iteration needs to complete asynchronously? You might jump to thinking that Observables (see Chapter 10) is the natural answer, but they're not what we need.

Let me quickly illustrate.

Imagine you have a list of URLs that represent images you want to load into a web page. The fetching of the images is asynchronous, obviously. So, this isn't going to work quite like you'd hope:

```js
var imageURLs = [
    "https://some.tld/image1.png",
    "https://other.tld/image2.png",
    "https://various.tld/image3.png"
];

var images = imageURLs.map( fetchImage );
```

The `images` array won't contain the images. Depending on the behavior of `fetchImage(..)`, it probably returns a promise for the image object once it finishes downloading. So `images` would now be a list of promises.

Of course, you could then use `Promise.all(..)` to wait for all those promises to resolve, and then unwrap an array of the image object results at its completion:

```js
Promise.all( images )
.then(function allImages(imgObjs){
    // ..
});
```

Unfortunately, this "trick" only works if you're going to do all the asynchronous steps concurrently (rather than serially, one after the other), and only if the operation is a `map(..)` call as shown. If you want serial asynchrony, or you want to, for example, do a `filter(..)` concurrently, this won't quite work; it's possible, but it's messier.

And some operations naturally require serial asynchrony, like for example an asynchronous `reduce(..)`, which clearly needs to work left-to-right one at a time; those steps can't be run concurrently and have that operation make any sense.

As I said, Observables (see Chapter 10) aren't the answer to these kinds of tasks. The reason is, an Observable's coordination of asynchrony is between separate operations, not between steps/iterations in at a single level of operation.

Another way to visualize this distinction is that Observables support "vertical asynchrony", whereas what I'm talking about would be "horizontal asynchrony".

Consider:

```js
var obsv = Rx.Observable.from( [1,2,3,4,5] );

obsv
.map( x => x * 2 )
.delay( 100 )        // <-- vertical asynchrony
.map( x => x + 1 )
.subscribe( v => console.log );
// {after 100 ms}
// 3
// 5
// 7
// 9
// 11
```

If for some reason I wanted to ensure that there was a delay of 100ms between when `1` was processed by the first `map(..)` and when `2` was processed, that would be the "horizontal asynchrony" I'm referring to. There's not really a clean way to model that.

And of course, I'm using an arbitrary delay in that description, but in practice that would more likely be serial-asynchrony like an asynchronous reduce, where each step in that reduction iteration could take some time before it completes and lets the next step be processed.

So, how do we support both serial and concurrent iteration across asynchronous operations?

**fasy** (pronounced like "Tracy" but with an "f") is a little utility library I built for supporting exactly those kinds of tasks. You can find more information about it here: https://github.com/getify/fasy

To illustrate **fasy**, let's consider a concurrent `map(..)` versus a serial `map(..)`:

```js
FA.concurrent.map( fetchImage, imageURLs )
.then( function allImages(imgObjs){
    // ..
} );

FA.serial.map( fetchImage, imageURLs )
.then( function allImages(imgObjs){
    // ..
} );
```

In both cases, the `then(..)` handler will only be invoked once all the fetches have fully completed. The difference is whether the fetches will all initiate concurrently (aka, "in parallel") or go out one at a time.

Your instinct might be that concurrent would always be preferable, and while that may be common, it's not always the case.

For example, what if `fetchImage(..)` maintains a cache of fetched images, and it checks the cache before making the actual network request? What if also, the list of `imageURLs` could have duplicates in it? You'd certainly want the first fetch of an image URL to complete (and populate the cache) before doing the check on the duplicate image URL later in the list.

Again, there will inevitably be cases where whether concurrent or serial asynchrony will be called for. Asynchronous reductions will always be serial, whereas asynchronous mappings may likely tend to be more concurrent but can also need to be serial in some cases. That's why **fasy** supports all these options.

Along with Observables, **fasy** will help you extend more FP patterns and principles to your asynchronous operations.

## Summary

JavaScript is not particularly designed as an FP language. However, it does have enough of the basics (like function values, closures, etc) for us to make it FP-friendly. And the libraries we've examined here will help you do that.

Armed with the concepts from this book, you're ready to start tackling real world code. Find a good, comfortable FP library and jump in. Practice, practice, practice!

So... that's it. I've shared what I have for you, for now. I hereby officially certify you as a "Functional-Light JavaScript" programmer! It's time to close out this "chapter" of our story of learning FP together. But my learning journey still continues; I hope your's does, too!
