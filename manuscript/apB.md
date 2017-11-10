# Functional-Light JavaScript
# Appendix B: The Humble Monad

Let me just start off this appendix by admitting: I did not know much about what a monad was before starting to write the following. And it took a lot of mistakes to get something sensible. If you don't believe me, go look at the commit history of this appendix in the Git repo for this book (https://github.com/getify/Functional-Light-JS)!

I am including the topic of monads in the book because it's part of the journey that every developer will encounter while learning FP, just as I have in this book writing.

We're basically ending this book with a brief glimpse at monads, whereas most other FP literature kinda almost starts with monads! I do not encounter in my "functional light" programming much of a need to think explicitly in terms of monads, so that's why this material is more bonus than main core. But that's not to say monads aren't useful or prevalent -- they very much are.

There's a bit of a joke around the JavaScript FP world that pretty much everybody has to write their own tutorial or blog post on what a monad is, like the writing of it alone is some rite-of-passage. Over the years, monads have variously been depicted as burritos, onions, and all sorts of other wacky conceptual abstractions. I hope there's none of that silly business going on here!

> A monad is just a monoid in the category of endofunctors.

We started the preface with this quote, so it seems fitting we come back to it here. But no, we won't be talking about monoids, endofunctors, or category theory. That quote is not only condescending, but totally unhelpful.

My only hope for what you get out of this discussion is to not be scared of the term monad or the concept anymore -- I have been, for years! -- and to be able to recognize them when you see them. You might, just maybe, even use them on occasion.

## Type

There's a huge area of interest in FP that we've basically stayed entirely away from throughout this book: type theory. I'm not going to get very deep into type theory, because quite frankly I'm not qualified to do so. And you wouldn't appreciate it even if I did.

But what I will say is that a monad is basically a value type.

The number `42` has a value type (number!) that brings with it certain characteristics and capabilities that we rely on. The string `"42"` may look very similar, but it has a different purpose in our program.

In object oriented programming, when you have a set of data (even a single discrete value) and you have some behavior you want to bundle with it, you create an object/class to represent that "type". Instances are then members of that type. This practice generally goes by the name "Data Structures".

I'm going to use the notion of data structures very loosely here, and assert that we may find it useful in a program to define a set of behaviors and constraints for a certain value, and bundle them together with that value into a single abstraction. That way, as we work with one or more of those kinds of values in our program, their behaviors come along for free and will make working with them more convenient. And by convenient, I mean more declarative and approachable for the reader of your code!

A monad is a data structure. It's a type. It's a set of behaviors that are specifically designed to make working with a value predictable.

Recall in Chapter 9 that we talked about functors: a value along with a map-like utility to perform an operation on all its constitute data members. A monad is a functor that includes some additional behavior.

## Loose Interface

Actually, a monad isn't a single data type, it's really more like a related collection of data types. It's kind of an interface that's implemented differently depending on the needs of different values. Each implementation is a different type of monad.

For example, you may read about the "Identity Monad", the "IO Monad", the "Maybe Monad", the "Either Monad", or a variety of others. Each of these has the basic monad behavior defined, but it extends or overrides the interactions according to the use cases for each different type of monad.

It's a little more than an interface though, because it's not just the presence of certain API methods that makes an object a monad. There's a certain set of guarantees about the interactions of these methods that is necessary, to be monadic. These well-known invariants are critical to usage of monads improving readability by familiarity; otherwise, it's just an ad hoc data structure that must be fully read to be understood by the reader.

As a matter of fact, there's not even just one single unified agreement on the names of these monadic methods, the way a true interface would mandate; a monad is more like a loose interface. Some people call a certain method `bind(..)`, some call it `chain(..)`, some call it `flatMap(..)`, etc.

So a monad is an object data structure with sufficient methods (of practically any name or sort) that at a minimum satisfy the main behavioral requirements of the monad definition. Each kind of monad has a different kind of extension above the minimum. But, because they all have an overlap in behavior, using two different kinds of monads together is still straightforward and predictable.

It's in that sense that monads are sort of like an interface.

## Just A Monad

A basic primitive monad underlying many other monads you will run across is called Just. It's *just* a simple monadic wrapper for any regular (aka, non-empty) value.

Since a monad is a type, you might think we'd define `Just` as a class to be instantiated. That's a valid way of doing it, but it introduces `this`-binding issues in the methods that I don't want to juggle; instead I'm going to stick with just a simple function approach.

Here's a simple implementation:

```js
function Just(val) {
    return { map, chain, ap, inspect };

    // *********************

    function map(fn) { return Just( fn( val ) ); }

    // aka: bind, flatMap
    function chain(fn) { return fn( val ); }

    function ap(anotherMonad) { return anotherMonad.map( val ); }

    function inspect() {
        return `Just(${ val })`;
    }
}
```

**Note:** The `inspect(..)` method is included here only for our demonstration purposes. It serves no direct role in the monadic sense.

You'll notice that whatever `val` value a `Just(..)` instance holds, it's never changed. All monad methods create new monad instances instead of mutating the monad's value itself.

Don't worry if most of this doesn't make sense right now. We're not gonna obsess too much over the details or the math/theory behind the design of the Monad. Instead, we'll focus more on illustrating what we can do with them.

### Working With Monad Methods

All monad instances will have `map(..)`, `chain(..)` (also called `bind(..)` or `flatMap(..)`), and `ap(..)` methods. The purpose of these methods and their behavior is to provide a standardized way of multiple monad instances interacting with each other.

Let's look first at the monadic `map(..)` function. Like `map(..)` on an array (see Chapter 9) that calls a mapper function with its value(s) and produces a new array, a monad's `map(..)` calls a mapper function with the monad's value, and whatever is returned is wrapped in a new Just monad instance:

```js
var A = Just( 10 );
var B = A.map( v => v * 2 );

B.inspect();                // Just(20)
```

Monadic `chain(..)` kinda does the same thing as `map(..)`, but then it sort of unwraps the resulting value from its new monad. However, instead of thinking informally about "unwrapping" a monad, the more formal explanation would be that `chain(..)` flattens the monad. Consider:

```js
var A = Just( 10 );
var eleven = A.chain( v => v + 1 );

eleven;                 // 11
typeof eleven;              // "number"
```

`eleven` is the actual primitive number `11`, not a monad holding that value.

To connect this `chain(..)` method conceptually to stuff we've already learned, we'll point out that many monad implementations name this method `flatMap(..)`. Now, recall from Chapter 9 what `flatMap(..)` does (as compared to `map(..)`) with an array:

```js
var x = [3];

map( v => [v,v+1], x );         // [[3,4]]
flatMap( v => [v,v+1], x );     // [3,4]
```

See the difference? The mapper function `v => [v,v+1]` results in a `[3,4]` array, which ends up in the single first position of the outer array, so we get `[[3,4]]`. But `flatMap(..)` flattens out the inner array into the outer array, so we get just `[3,4]` instead.

That's the same kind of thing going on with a monad's `chain(..)` (aka `flatMap(..)`). Instead of getting a monad holding the value as `map(..)` does, `chain(..)` additionally flattens the monad into the underlying value. Actually, instead of creating that intermediate monad only to immediately flatten it, `chain(..)` is generally implemented more performantly to just take a shortcut and not create the monad in the first place. Either way, the end result is the same.

One way to illustrate `chain(..)` in this manner is in combination with the `identity(..)` utility (see Chapter 3), to effectively extract a value from a monad:

```js
var identity = v => v;

A.chain( identity );        // 10
```

`A.chain(..)` calls `identity(..)` with the value in `A`, and whatever value `identity(..)` returns (`10` in this case) just comes right out without any intervening monad. In other words, from that earlier `Just(..)` code listing, we wouldn't actually need to include that optional `inspect(..)` helper, as `chain(inspect)` accomplishes the same goal; it's purely for ease of debugging as we learn monads.

At this point, hopefully both `map(..)` and `chain(..)` feel fairly reasonable to you.

By contrast, a monad's `ap(..)` method will likely be much less intuitive at first glance. It will seem like a strange contortion of interaction, but there's deep and important reasoning behind the design. Let's take a moment to break it down.

`ap(..)` takes the value wrapped in a monad and "applies" it to another monad using that other monad's `map(..)`. OK, fine so far.

However, `map(..)` always expects a function. So that means the monad you call `ap(..)` on has to actually contain a function as its value, to pass to that other monad's `map(..)`.

Confused? Yeah, not what you might have expected. We'll try to briefly illuminate, but just expect that these things will be fuzzy for awhile until you've had a lot more exposure and practice with monads.

We'll define `A` as a monad that contains a value `10`, and `B` as a monad that contains the value `3`:

```js
var A = Just( 10 );
var B = Just( 3 );

A.inspect();                // Just(10)
B.inspect();                // Just(3)
```

Now, how could we make a new monad where the values `10` and `3` had been added together, say via a `sum(..)` function? Turns out `ap(..)` can help.

To use `ap(..)`, we said we first need to construct a monad that holds a function. Specifically, we need one that holds a function that itself holds (remembers via closure) the value in `A`. Let that sink in for a moment.

To make a monad from `A` that holds a value-containing function, we'll call `A.map(..)`, giving it a curried function that "remembers" that extracted value (see Chapter 3) as its first argument. We'll call this new function-containing monad `C`:

```js
function sum(x,y) { return x + y; }

var C = A.map( curry( sum ) );

C.inspect();
// Just(function curried...)
```

Think about how that works. The curried `sum(..)` function is expecting two values to do its work, and we give it the first of those values by having `A.map(..)` extract `10` and pass it in. `C` now holds the function that remembers `10` via closure.

Now, to get the second value (`3` inside `B`) passed to the waiting curried function in `C`:

```js
var D = C.ap( B );

D.inspect();                // Just(13)
```

The value `10` came out of `C`, and `3` came out of `B`, and `sum(..)` added them together to `13` and wrapped that in the monad `D`. Let's put the two steps together so you can see their connection more clearly:

```js
var D = A.map( curry( sum ) ).ap( B );

D.inspect();                // Just(13)
```

To illustrate what `ap(..)` is helping us with, we could have achieved the same result this way:

```js
var D = B.map( A.chain( curry( sum ) ) );

D.inspect();                // Just(13);
```

And that of course is just a composition (see Chapter 4):

```js
var D = compose( B.map, A.chain, curry )( sum );

D.inspect();                // Just(13)
```

Cool, huh!?

If the *how* of this discussion on monad methods is unclear so far, go back and re-read. If the *why* is elusive, just hang in there. Monads so easily confound developers, that's *just* how it is!

## Maybe

It's very common in FP material to cover well-known monads like Maybe. Actually, the Maybe monad is a particular pairing of two other simpler monads: Just and Nothing.

We've already seen Just; Nothing is a monad that holds an empty value. Maybe is a monad that either holds a Just or an Empty.

Here's a minimal implementation of Maybe:

```js
var Maybe = { Just, Nothing, of/* aka: unit, pure */: Just };

function Just(val) { /* .. */ }

function Nothing() {
    return { map: Nothing, chain: Nothing, ap: Nothing, inspect };

    // *********************

    function inspect() {
        return "Nothing";
    }
}
```

**Note:** `Maybe.of(..)` (sometimes referred to as `unit(..)` or `pure(..)`) is a convenience alias for `Just(..)`.

In contrast to `Just()` instances, `Nothing()` instances have no-op definitions for all monadic methods. So if such a monad instance shows up in any monadic operations, it has the effect of basically short-circuiting to have no behavior happen. Notice there's no imposition here of what "empty" means -- your code gets to decide that. More on that later.

In Maybe, if a value is non-empty, it's represented by an instance of `Just(..)`; if it's empty, it's represented by an instance of `Nothing()`.

But the importance of this kind of monad representation is that whether we have a `Just(..)` instance or a `Nothing()` instance, we'll use the API methods the same.

The power of the Maybe abstraction is to encapsulate that behavior/no-op duality implicitly.

### Different Maybes

Many implementations of a JavaScript Maybe monad include a check (usually in `map(..)`) to see if the value is `null` / `undefined`, and skipping the behavior if so. In fact, Maybe is trumpeted as being valuable precisely because it sort of automatically short-circuits its behavior with the encapsulated empty-value check.

Here's how Maybe is usually illustrated:

```js
// instead of unsafe `console.log( someObj.something.else.entirely )`:

Maybe.of( someObj )
.map( prop( "something" ) )
.map( prop( "else" ) )
.map( prop( "entirely" ) )
.map( console.log );
```

In other words, if at any point in the chain we get a `null` / `undefined` value, the Maybe magically switches into no-op mode -- it's now a `Nothing()` monad instance! -- and stops doing anything for the rest of the chain. That makes the nested property access safe against throwing JS exceptions if some property is missing/empty. That's cool, and a nice helpful abstraction for sure!

But... that approach to Maybe is not a pure monad.

The core spirit of a Monad says that it must be valid for all values and cannot do any inspection of the value, at all -- not even a null check. So those other implementations are cutting corners for the sake of convenience. It's not a huge deal, but when it comes to learning something, you should probably learn it in its purest form first before you go bending the rules.

The earlier implementation of the Maybe monad I provided differs from other Maybes primarily in that it does not have the empty-check in it. Also, we present `Maybe` merely as a loose pairing of `Just(..)` / `Nothing()`.

So wait. If we don't get the automatic short-circuting, why is Maybe useful at all?!? That seems like its whole point.

Never fear! We can simply provide the empty-check externally, and the rest of the short-circuting behavior of the Maybe monad will work just fine. Here's how you could do the `someObj.something.else.entirely` nested-property access from before, but more "correctly":

```js
function isEmpty(val) {
    return val === null || val === undefined;
}

var safeProp = curry( function safeProp(prop,obj){
    if (isEmpty( obj[prop] )) return Maybe.Nothing();
    return Maybe.of( obj[prop] );
} );

Maybe.of( someObj )
.chain( safeProp( "something" ) )
.chain( safeProp( "else" ) )
.chain( safeProp( "entirely" ) )
.map( console.log );
```

We made a `safeProp(..)` that does the empty-check, and selects either a `Nothing()` monad instance if so, or wraps the value in a `Just(..)` instance (via `Maybe.of(..)`). Then instead of `map(..)`, we use `chain(..)` which knows how to "unwrap" the monad that `safeProp(..)` returns.

We get the same chain short-circuiting upon encountering an empty value. We just don't embed that logic into the Maybe.

The benefit of the monad, and Maybe specifically, is that our `map(..)` and `chain(..)` methods have a consistent and predictable interaction regardless of which kind of monad comes back. That's pretty cool!

## Humble

Now that we have a little more understanding of Maybe and what it does, I'm going to put a little twist on it -- and add some self-deferential humor to our discussion -- by inventing the Maybe+Humble monad. Technically, `MaybeHumble(..)` is not a monad itself, but a factory function that produces a Maybe monad instance.

Humble is an admittedly contrived data structure wrapper that uses Maybe to track the status of an `egoLevel` number. Specifically, `MaybeHumble(..)`-produced monad instances only operate affirmatively if their ego level value is low enough (less than `42`!) to be considered humble; otherwise it's a `Nothing()` no-op. That should sound a lot like Maybe; it's pretty similar!

Here's the factory function for our Maybe+Humble monad:

```js
function MaybeHumble(egoLevel) {
    // accept anything other than a number that's 42 or higher
    return !(Number( egoLevel ) >= 42) ?
        Maybe.of( egoLevel ) :
        Maybe.Nothing();
}
```

You'll notice that this factory function is kinda like `safeProp(..)`, in that it uses a condition to decide if it should pick the `Just(..)` or the `Nothing()` part of the Maybe.

Let's illustrate some basic usage:

```js
var bob = MaybeHumble( 45 );
var alice = MaybeHumble( 39 );

bob.inspect();              // Nothing
alice.inspect();            // Just(39)
```

What if Alice wins a big award and is now a bit more proud of herself?

```js
function winAward(ego) {
    return MaybeHumble( ego + 3 );
}

alice = alice.chain( winAward );
alice.inspect();            // Nothing
```

The `MaybeHumble( 39 + 3 )` call creates a `Nothing()` monad instance to return back from the `chain(..)` call, so now Alice doesn't qualify as humble anymore.

Now, let's use a few monads together:

```js
var bob = MaybeHumble( 41 );
var alice = MaybeHumble( 39 );

var teamMembers = curry( function teamMembers(ego1,ego2){
    console.log( `Our humble team's egos: ${ego1} ${ego2}` );
} );

bob.map( teamMembers ).ap( alice );
// Our humble team's egos: 41 39
```

Recalling the usage of `ap(..)` from earlier, we can now explain how this code works.

Since `teamMembers(..)` is curried, the `bob.map(..)` call passes in the `bob` ego level (`41`), and creates a monad instance with the remaining function wrapped up. Calling `ap(alice)` on *that* monad calls `alice.map(..)` and passes to it the function from the monad. The effect is that both the `bob` and `alice` monad's numeric values have been provided to `teamMembers(..)` function, printing out the message as shown.

However, if either or both monads are actually `Nothing()` instances (because their ego level was too high):

```js
var frank = MaybeHumble( 45 );

bob.map( teamMembers ).ap( frank );
// ..no output..

frank.map( teamMembers ).ap( bob );
// ..no output..
```

`teamMembers(..)` never gets called (and no message is printed), because `frank` is a `Nothing()` instance. That's the power of the Maybe monad, and our `MaybeHumble(..)` factory allows us to select based on the ego level. Cool!

### Humility

One more example to illustrate the behaviors of our Maybe+Humble data structure:

```js
function introduction() {
    console.log( "I'm just a learner like you! :)" );
}

var egoChange = curry( function egoChange(amount,concept,egoLevel) {
    console.log( `${amount > 0 ? "Learned" : "Shared"} ${concept}.` );
    return MaybeHumble( egoLevel + amount );
} );

var learn = egoChange( 3 );

var learner = MaybeHumble( 35 );

learner
.chain( learn( "closures" ) )
.chain( learn( "side effects" ) )
.chain( learn( "recursion" ) )
.chain( learn( "map/reduce" ) )
.map( introduction );
// Learned closures.
// Learned side effects.
// Learned recursion.
// ..nothing else..
```

Unfortunately, the learning process seems to have been cut short. You see, I've found that learning a bunch of stuff without sharing with others: inflates your ego too much and is not good for your skills.

Let's try a better approach to learning:

```js
var share = egoChange( -2 );

learner
.chain( learn( "closures" ) )
.chain( share( "closures" ) )
.chain( learn( "side effects" ) )
.chain( share( "side effects" ) )
.chain( learn( "recursion" ) )
.chain( share( "recursion" ) )
.chain( learn( "map/reduce" ) )
.chain( share( "map/reduce" ) )
.map( introduction );
// Learned closures.
// Shared closures.
// Learned side effects.
// Shared side effects.
// Learned recursion.
// Shared recursion.
// Learned map/reduce.
// Shared map/reduce.
// I'm just a learner like you! :)
```

Sharing while you learn. That's the best way to learn more and learn better.

## Summary

What is a monad, anyway?

A monad is a value type, an interface, an object data structure with encapsulated behaviors.

But none of those definitions are particularly useful. Here's an attempt at something better: a monad is how you organize behavior around a value in a more declarative way.

As with everything else in this book, use monads where they are helpful but don't use them just because everyone else talks about them in FP. Monads aren't a universal silver bullet, but they do offer some utility when used conservatively.
