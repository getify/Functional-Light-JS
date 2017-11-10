# Functional-Light JavaScript
# Chapter 7: Closure vs Object

A number of years ago, Anton van Straaten crafted what has become a rather famous and oft-cited [koan](https://www.merriam-webster.com/dictionary/koan) to illustrate and provoke an important tension between closure and objects:

> The venerable master Qc Na was walking with his student, Anton. Hoping to
prompt the master into a discussion, Anton said "Master, I have heard that
objects are a very good thing - is this true?" Qc Na looked pityingly at
his student and replied, "Foolish pupil - objects are merely a poor man's
closures."
>
> Chastised, Anton took his leave from his master and returned to his cell,
intent on studying closures. He carefully read the entire "Lambda: The
Ultimate..." series of papers and its cousins, and implemented a small
Scheme interpreter with a closure-based object system. He learned much, and
looked forward to informing his master of his progress.
>
> On his next walk with Qc Na, Anton attempted to impress his master by
saying "Master, I have diligently studied the matter, and now understand
that objects are truly a poor man's closures." Qc Na responded by hitting
Anton with his stick, saying "When will you learn? Closures are a poor man's
object." At that moment, Anton became enlightened.
>
> Anton van Straaten 6/4/2003
>
> http://people.csail.mit.edu/gregs/ll1-discuss-archive-html/msg03277.html

The original posting, while brief, has more context to the origin and motivations, and I strongly suggest you read that post to properly set your mindset for approaching this chapter.

Many people I've observed read this koan smirk at its clever wit but then move on without it changing much about their thinking. However, the purpose of a koan (from the Bhuddist Zen perspective) is to prod the reader into wrestling with the contradictory truths therein. So, go back and read it again. Now read it again.

Which is it? Is a closure a poor man's object, or is an object a poor man's closure? Or neither? Or both? Is merely the take-away that closures and objects are in some way equivalent?

And what does any of this have to do with functional programming? Pull up a chair and ponder for awhile. This chapter will be an interesting detour, an excursion if you will.

## The Same Page

First, let's make sure we're all on the same page when we refer to closures and objects. We're obviously in the context of how JavaScript deals with these two mechanisms, and specifically talking about simple function closure (see "Keeping Scope" in Chapter 2) and simple objects (collections of key-value pairs).

For the record, here's an illustration of a simple function closure:

```js
function outer() {
    var one = 1;
    var two = 2;

    return function inner(){
        return one + two;
    };
}

var three = outer();

three();            // 3
```

And an illustration of a simple object:

```js
var obj = {
    one: 1,
    two: 2
};

function three(outer) {
    return outer.one + outer.two;
}

three( obj );       // 3
```

Many people conjur lots of extra things when you mention "closure", such as the asynchronous callbacks or even the module pattern with encapsulation and information hiding. Similarly, "object" brings to mind classes, `this`, prototypes, and a whole slew of other utilities and patterns.

As we go along, we'll carefully address the parts of this external context that matter, but for now, try to just stick to the simplest interpretations of "closure" and "object" as illustrated here; it'll make our exploration less confusing.

## Look Alike

It may not be obvious how closures and objects are related. So let's explore their similarities first.

To frame this discussion, let me just briefly assert two things:

1. A programming language without closures can simulate them with objects instead.
2. A programming language without objects can simulate them with closures instead.

In other words, we can think of closures and objects as two different representations of a thing.

### State

Consider this code from above:

```js
function outer() {
    var one = 1;
    var two = 2;

    return function inner(){
        return one + two;
    };
}

var obj = {
    one: 1,
    two: 2
};
```

Both the scope closed over by `inner()` and the object `obj` contain two elements of state: `one` with value `1` and `two` with value `2`. Syntactically and mechanically, these representations of state are different. But conceptually, they're actually quite similar.

As a matter of fact, it's fairly straightforward to represent an object as a closure, or a closure as an object. Go ahead, try it yourself:

```js
var point = {
    x: 10,
    y: 12,
    z: 14
};
```

Did you come up with something like?

```js
function outer() {
    var x = 10;
    var y = 12;
    var z = 14;

    return function inner(){
        return [x,y,z];
    }
};

var point = outer();
```

**Note:** The `inner()` function creates and returns a new array (aka, an object!) each time it's called. That's because JS doesn't afford us any capability to `return` multiple values without encapsulating them in an object. That's not technically a violation of our object-as-closure task, because it's just an implementation detail of exposing/transporting values; the state tracking itself is still object-free. With ES6+ array destructuring, we can declaratively ignore this temporary intermediate array on the other side: `var [x,y,z] = point()`. From a developer ergonomics perspective, the values are stored individually and tracked via closure instead of objects.

What if we have nested objects?

```js
var person = {
    name: "Kyle Simpson",
    address: {
        street: "123 Easy St",
        city: "JS'ville",
        state: "ES"
    }
};
```

We could represent that same kind of state with nested closures:

```js
function outer() {
    var name = "Kyle Simpson";
    return middle();

    // ********************

    function middle() {
        var street = "123 Easy St";
        var city = "JS'ville";
        var state = "ES";

        return function inner(){
            return [name,street,city,state];
        };
    }
}

var person = outer();
```

Let's practice going the other direction, from closure to object:

```js
function point(x1,y1) {
    return function distFromPoint(x2,y2){
        return Math.sqrt(
            Math.pow( x2 - x1, 2 ) +
            Math.pow( y2 - y1, 2 )
        );
    };
}

var pointDistance = point( 1, 1 );

pointDistance( 4, 5 );      // 5
```

`distFromPoint(..)` is closed over `x1` and `y1`, but we could instead explicitly pass those values as an object:

```js
function pointDistance(point,x2,y2) {
    return Math.sqrt(
        Math.pow( x2 - point.x1, 2 ) +
        Math.pow( y2 - point.y1, 2 )
    );
};

pointDistance(
    { x1: 1, y1: 1 },
    4,  // x2
    5   // y2
);
// 5
```

The `point` object state explicitly passed in replaces the closure that implicitly held that state.

### Behavior, Too!

It's not just that objects and closures represent ways to express collections of state, but also that they can include behavior via functions/methods. Bundling data with its behavior has a fancy name: encapsulation.

Consider:

```js
function person(name,age) {
    return happyBirthday(){
        age++;
        console.log(
            `Happy ${age}th Birthday, ${name}!`
        );
    }
}

var birthdayBoy = person( "Kyle", 36 );

birthdayBoy();          // Happy 37th Birthday, Kyle!
```

The inner function `happyBirthday()` has closure over `name` and `age` so that the functionality therein is kept with the state.

We can achieve that same capability with a `this` binding to an object:

```js
var birthdayBoy = {
    name: "Kyle",
    age: 36,
    happyBirthday() {
        this.age++;
        console.log(
            `Happy ${this.age}th Birthday, ${this.name}!`
        );
    }
};

birthdayBoy.happyBirthday();
// Happy 37th Birthday, Kyle!
```

We're still expressing the encapsulation of state data with the `happyBirthday()` function, but with an object instead of a closure. And we don't have to explicitly pass in an object to a function (as with earlier examples); JavaScript's `this` binding easily creates an implicit binding.

Another way to analyze this relationship: a closure associates a single function with a set of state, whereas an object holding the same state can have any number of functions to operate on that state.

As a matter of fact, you could even expose multiple methods with a single closure as the interface. Consider a traditional object with two methods:

```js
var person = {
    firstName: "Kyle",
    lastName: "Simpson",
    first() {
        return this.firstName;
    },
    last() {
        return this.lastName;
    }
}

person.first() + " " + person.last();
// Kyle Simpson
```

Just using closure without objects, we could represent this program as:

```js
function createPerson(firstName,lastName) {
    return API;

    // ********************

    function API(methodName) {
        switch (methodName) {
            case "first":
                return first();
                break;
            case "last":
                return last();
                break;
        };
    }

    function first() {
        return firstName;
    }

    function last() {
        return lastName;
    }
}

var person = createPerson( "Kyle", "Simpson" );

person( "first" ) + " " + person( "last" );
// Kyle Simpson
```

While these programs look and feel a bit different ergonomically, they're actually just different implementation variations of the same program behavior.

### (Im)mutability

Many people will initially think that closures and objects behave differently with respect to mutability; closures protect from external mutation while objects do not. But, it turns out, both forms have identical mutation behavior.

That's because what we care about, as discussed in Chapter 6, is **value** mutability, and this is a characteristic of the value itself, regardless of where or how it's assigned.

```js
function outer() {
    var x = 1;
    var y = [2,3];

    return function inner(){
        return [ x, y[0], y[1] ];
    };
}

var xyPublic = {
    x: 1,
    y: [2,3]
};
```

The value stored in the `x` lexical variable inside `outer()` is immutable -- remember, primitives like `2` are by definition immutable. But the value referenced by `y`, an array, is definitely mutable. The exact same goes for the `x` and `y` properties on `xyPublic`.

We can reinforce the point that objects and closures have no bearing on mutability by pointing out that `y` is itself an array, and thus we need to break this example down further:

```js
function outer() {
    var x = 1;
    return middle();

    // ********************

    function middle() {
        var y0 = 2;
        var y1 = 3;

        return function inner(){
            return [ x, y0, y1 ];
        };
    }
}

var xyPublic = {
    x: 1,
    y: {
        0: 2,
        1: 3
    }
};
```

If you think about it as "turtles (aka, objects) all the way down", at the lowest level, all state data is primitives, and all primitives are value-immutable.

Whether you represent this state with nested objects, or with nested closures, the values being held are all immutable.

### Isomorphic

The term "isomorphic" gets thrown around a lot in JavaScript these days, and it's usually used to refer to code that can be used/shared in both the server and the browser. I wrote a blog post awhile back that calls bogus on that usage of this word "isomorphic", which actually has an explicit and important meaning that's being clouded.

Here's some selections from a part of that post:

> What does isomorphic mean? Well, we could talk about it in mathematic terms, or sociology, or biology. The general notion of isomorphism is that you have two things which are similar in structure but not the same.
>
> In all those usages, isomorphism is differentiated from equality in this way: two values are equal if they’re exactly identical in all ways, but they are isomorphic if they are represented differently but still have a 1-to-1, bi-directional mapping relationship.
>
> In other words, two things A and B would be isomorphic if you could map (convert) from A to B and then go back to A with the inverse mapping.

Recall in "Brief Math Review" in Chapter 2, we discussed the mathematical definition of a function as being a mapping between inputs and outputs. We pointed out this is technically called a morphism. An isomorphism is a special case of bijective (aka, 2-way) morphism that requires not only that the mapping must be able to go in either direction, but also that the behavior is identical in either form.

But instead of thinking about numbers, let's relate isomorphism to code. Again quoting my blog post:

> [W]hat would isomorphic JS be if there were such a thing? Well, it could be that you have one set of JS code that is converted to another set of JS code, and that (importantly) you could convert from the latter back to the former if you wanted.

As we asserted earlier with our examples of closures-as-objects and objects-as-closures, these representative alternations go either way. In this respect, they are isomorphisms to each other.

Put simply, closures and objects are isomorphic representations of state (and its associated functionality).

The next time you hear someone say "X is isomorphic to Y", what they mean is, "X and Y can be converted from either one to the other in either direction, and not lose information."

### Under The Hood

So, we can think of objects as an isomorphic representation of closures from the perspective of code we could write. But we can also observe that a closure system could actually be implemented -- and likely is -- with objects!

Think about it this way: in the following code, how is JS keeping track of the `x` variable for `inner()` to keep referencing, well after `outer()` has already run?

```js
function outer() {
    var x = 1;

    return function inner(){
        return x;
    };
}
```

We could imagine that the scope -- the set of all variables defined -- of `outer()` is implemented as an object with properties. So, conceptually, somewhere in memory, there's something like:

```js
scopeOfOuter = {
    x: 1
};
```

And then for the `inner()` function, when created, it gets an (empty) scope object called `scopeOfInner`, which is linked via its `[[Prototype]]` to the `scopeOfOuter` object, sorta like this:

```js
scopeOfInner = {};
Object.setPrototypeOf( scopeOfInner, scopeOfOuter );
```

Then, inside `inner()`, when it makes reference to the lexical variable `x`, it's actually more like:

```js
return scopeOfInner.x;
```

`scopeOfInner` doesn't have an `x` property, but it's `[[Prototype]]`-linked to `scopeOfOuter`, which does have an `x` property. Accessing `scopeOfOuter.x` via prototype delegation results in the `1` value being returned.

In this way, we can sorta see why the scope of `outer()` is preserved (via closure) even after it finishes: because the `scopeOfInner` object is linked to the `scopeOfOuter` object, thereby keeping that object and its properties alive and well.

Now, this is all conceptual. I'm not literally saying the JS engine uses objects and prototypes. But it's entirely plausible that it *could* work similarly.

Many languages do in fact implement closures via objects. And other languages implement objects in terms of closures. But we'll let the reader use their imagination on how that would work.

## Two Roads Diverged In A Wood...

So closures and objects are equivalent, right? Not quite. I bet they're more similar than you thought before you started this chapter, but they still have important differences.

These differences should not be viewed as weaknesses or arguments against usage; that's the wrong perspective. They should be viewed as features and advantages that make one or the other more suitable (and readable!) for a given task.

### Structural Mutability

Conceptually, the structure of a closure is not mutable.

In other words, you can never add to or remove state from a closure. Closure is a characteristic of where variables are declared (fixed at author/compile time), and is not sensitive to any runtime conditions -- assuming you use strict mode and/or avoid using cheats like `eval(..)`, of course!

**Note:** The JS engine could technically cull a closure to weed out any variables in its scope that are no longer going to be used, but this is an advanced optimization that's transparent to the developer. Whether the engine actually does these kinds of optimizations, I think it's safest for the developer to assume that closure is per-scope rather than per-variable. If you don't want it to stay around, don't close over it!

However, objects by default are quite mutable. You can freely add or remove (`delete`) properties/indices from an object, as long as that object hasn't been frozen (`Object.freeze(..)`).

It may be an advantage of the code to be able to track more (or less!) state depending on the runtime conditions in the program.

For example, let's imagine tracking the keypress events in a game. Almost certainly, you'll think about using an array to do this:

```js
function trackEvent(evt,keypresses = []) {
    return [ ...keypresses, evt ];
}

var keypresses = trackEvent( newEvent1 );

keypresses = trackEvent( newEvent2, keypresses );
```

**Note:** Did you spot why I didn't `push(..)` directly to `keypresses`? Because in FP, we typically want to treat arrays as immutable data structures that can be recreated and added to, but not directly changed. We trade out the evil of side-effects for an explicit reassignment (more on that later).

Though we're not changing the structure of the array, we could if we wanted to. More on this in a moment.

But an array is not the only way to track this growing "list" of `evt` objects. We could use closure:

```js
function trackEvent(evt,keypresses = () => []) {
    return function newKeypresses() {
        return [ ...keypresses(), evt ];
    };
}

var keypresses = trackEvent( newEvent1 );

keypresses = trackEvent( newEvent2, keypresses );
```

Do you spot what's happening here?

Each time we add a new event to the "list", we create a new closure wrapped around the existing `keypresses()` function (closure), which captures the current `evt`. When we call the `keypresses()` function, it will successively call all the nested functions, building up an intermediate array of all the individually closed-over `evt` objects. Again, closure is the mechanism that's tracking all the state; the array you see is only an implementation detail of needing a way to return multiple values from a function.

So which one is better suited for our task? No surprise here, the array approach is probably a lot more appropriate. The structural immutability of a closure means our only option is to wrap more closure around it. Objects are by default extensible, so we can just grow the array as needed.

By the way, even though I'm presenting this structural (im)mutability as a clear difference between closure and object, the way we're using the object as an immutable value is actually more similar than not.

Creating a new array for each addition to the array is treating the array as structurally immutable, which is conceptually symmetrical to closure being structurally immutable by its very design.

### Privacy

Probably one of the first differences you think of when analyzing closure vs object is that closure offers "privacy" of state through nested lexical scoping, whereas objects expose everything as public properties. Such privacy has a fancy name: information hiding.

Consider lexical closure hiding:

```js
function outer() {
    var x = 1;

    return function inner(){
        return x;
    };
}

var xHidden = outer();

xHidden();          // 1
```

Now the same state in public:

```js
var xPublic = {
    x: 1
};

xPublic.x;          // 1
```

There's some obvious differences around general software engineering principles -- consider abstraction, the module pattern with public and private APIs, etc -- but let's try to constrain our discussion to the perspective of FP; this is, after all, a book about functional programming!

#### Visibility

It may seem that the ability to hide information is a desired characteristic of state tracking, but I believe the FPer might argue the opposite.

One of the advantages of managing state as public properties on an object is that it's easier to enumerate (and iterate!) all the data in your state. Imagine you wanted to process each keypress event (from the earlier example) to save it to a database, using a utility like:

```js
function recordKeypress(keypressEvt) {
    // database utility
    DB.store( "keypress-events", keypressEvt );
}
```

If you already have an array -- just an object with public numerically-named properties -- this is very straightforward using a built-in JS array utility `forEach(..)`:

```js
keypresses.forEach( recordKeypress );
```

But, if the list of keypresses is hidden inside closure, you'll have to expose a utility on the public API of the closure with privileged access to the hidden data.

For example, we can give our closure-`keypresses` example its own `forEach`,  like built-in arrays have:

```js
function trackEvent(
    evt,
    keypresses = {
        list() { return []; },
        forEach() {}
    }
) {
    return {
        list() {
            return [ ...keypresses.list(), evt ];
        },
        forEach(fn) {
            keypresses.forEach( fn );
            fn( evt );
        }
    };
}

// ..

keypresses.list();      // [ evt, evt, .. ]

keypresses.forEach( recordKeypress );
```

The visibility of an object's state data makes using it more straightforward, whereas closure obscures the state making us work harder to process it.

#### Change Control

If the lexical variable `x` is hidden inside a closure, the only code that has the freedom to reassign it is also inside that closure; it's impossible to modify `x` from the outside.

As we saw in Chapter 6, that fact alone improves the readability of code by reducing the surface area that the reader must consider to predict the behavior of any given variable.

The local proximity of lexical reassignment is a big reason why I don't find `const` as a feature that helpful. Scopes (and thus closures) should in general be pretty small, and that means there will only be a few lines of code that can affect reassignment. In `outer()` above, we can quickly inspect to see that no line of code reassigns `x`, so for all intents and purposes it's acting as a constant.

This kind of guarantee is a powerful contributor to our confidence in the purity of a function, for example.

On the other hand, `xPublic.x` is a public property, and any part of the program that gets a reference to `xPublic` has the ability, by default, to reassign `xPublic.x` to some other value. That's a lot more lines of code to consider!

That's why in Chapter 6, we looked at `Object.freeze(..)` as a quick-n-dirty means of making all of an object's properties read-only (`writable: false`), so that they can't be reassigned unpredictably.

Unfortunately, `Object.freeze(..)` is both all-or-nothing and irreversible.

With closure, you have some code with the privilege to change, and the rest of the program is restricted. When you freeze an object, no part of the code will be able to reassign. Moreover, once an object is frozen, it can't be thawed out, so the properties will remain read-only for the duration of the program.

In places where I want to allow reassignment but restrict its surface area, closures are a more convenient and flexible form than objects. In places where I want no reassignment, a frozen object is a lot more convenient than repeating `const` declarations all over my function.

Many FPers take a hard-line stance on reassignment: it shouldn't be used. They will tend to use `const` to make all closure variables read-only, and they'll use `Object.freeze(..)` or full immutable data structures to prevent property reassignment. Moreover, they'll try to reduce the amount of explicitly declared/tracked variables and properties wherever possible, perferring value transfer -- function chains, `return` value passed as argument, etc -- instead of intermediate value storage.

This book is about "functional light" programming in JavaScript, and this is one of those cases where I diverge from the core FP crowd.

I think variable reassignment can be quite useful and, when used approriately, quite readable in its explicitness. It's certainly been my experience that debugging is a lot easier when you can insert a `debugger` or breakpoint, or track a watch expression.

### Cloning State

As we learned in Chapter 6, one of the best ways we prevent side effects from eroding the predictability of our code is to make sure we treat all state values as immutable, regardless of whether they are actually immutable (frozen) or not.

If you're not using a purpose-built library to provide sophisticated immutable data structures, the simplest approach will suffice: duplicate your objects/arrays each time before making a change.

Arrays are easy to clone shallowly: just use the `slice()` method:

```js
var a = [ 1, 2, 3 ];

var b = a.slice();
b.push( 4 );

a;          // [1,2,3]
b;          // [1,2,3,4]
```

Objects can be shallow-cloned relatively easily too:

```js
var o = {
    x: 1,
    y: 2
};

// in ES2017+, using object spread:
var p = { ...o };
p.y = 3;

// in ES2015+:
var p = Object.assign( {}, o );
p.y = 3;
```

If the values in an object/array are themselves non-primitives (objects/arrays), to get deep cloning you'll have to walk each layer manually to clone each nested object. Otherwise, you'll have copies of shared references to those sub-objects, and that's likely to create havoc in your program logic.

Did you notice that this cloning is possible only because all these state values are visible and can thus be easily copied? What about a set of state wrapped up in a closure; how would you clone that state?

That's much more tedious. Essentially, you'd have to do something similar to our custom `forEach` API method earlier: provide a function inside each layer of the closure with the privilege to extract/copy the hidden values, creating new equivalent closures along the way.

Even though that's theoretically possible -- another exercise for the reader! -- it's far less practical to implement than you're likely to justify for any real program.

Objects have a clear advantage when it comes to representing state that we need to be able to clone.

### Performance

One reason objects may be favored over closures, from an implementation perspective, is that in JavaScript objects are often lighter-weight in terms of memory and even computation.

But be careful with that as a general assertion: there are plenty of things you can do with objects that will erase any performance gains you may get from ignoring closure and moving to object-based state tracking.

Let's consider a scenario with both implementations. First, the closure-style implementation:

```js
function StudentRecord(name,major,gpa) {
    return function printStudent(){
        return `${name}, Major: ${major}, GPA: ${gpa.toFixed(1)}`;
    };
}

var student = StudentRecord( "Kyle Simpson", "CS", 4 );

// later

student();
// Kyle Simpson, Major: CS, GPA: 4.0
```

The inner function `printStudent()` closes over three variables: `name`, `major`, and `gpa`. It maintains this state wherever we transfer a reference to that function -- we call it `student()` in this example.

Now for the object (and `this`) approach:

```js
function StudentRecord(){
    return `${this.name}, Major: ${this.major}, GPA: ${this.gpa.toFixed(1)}`;
}

var student = StudentRecord.bind( {
    name: "Kyle Simpson",
    major: "CS",
    gpa: 4
} );

// later

student();
// Kyle Simpson, Major: CS, GPA: 4.0
```

The `student()` function -- technically referred to as a "bound function" -- has a hard-bound `this` reference to the object literal we passed in, such that any later call to `student()` will use that object for it `this`, and thus be able to access its encapsulated state.

Both implemenations have the same outcome: a function with preserved state. But what about the performance; what differences will there be?

**Note:** Accurately and actionably judging performance of a snippet of JS code is a very dodgy affair. We won't get into all the details here, but I urge you to read the "You Don't Know JS: Async & Performance" book, specifically Chapter 6 "Benchmarking & Tuning", for more details.

If you were writing a library that created a pairing of state with its function -- either the call to `StudentRecord(..)` in the first snippet or the call to `StudentRecord.bind(..)` in the second snippet -- you're likely to care most about how those two perform. Inspecting the code, we can see that the former has to create a new function expression each time. The second one uses `bind(..)`, which is not as obvious in its implications.

One way to think about what `bind(..)` does under the covers is that it creates a closure over a function, like this:

```js
function bind(orinFn,thisObj) {
    return function boundFn(...args) {
        return origFn.apply( thisObj, args );
    };
}

var student = bind( StudentRecord, { name: "Kyle.." } );
```

In this way, it looks like both implementations of our scenario create a closure, so the performance is likely to be about the same.

However, the built-in `bind(..)` utility doesn't really have to create a closure to accomplish the task. It simply creates a function and manually sets its internal `this` to the specified object. That's potentially a more efficient operation than if we did the closure ourselves.

The kind of performance savings we're talking about here is miniscule on an individual operation. But if your library's critical path is doing this hundreds or thousands of times or more, that savings can add up quickly. Many libraries -- Bluebird being one such example -- have ended up optimizing by removing closures and going with objects, in exactly this means.

Outside of the library use-case, the pairing of the state with its function usually only happens relatively few times in the critical path of an application. By contrast, typically the usage of the function+state -- calling `student()` in either snippet -- is more common.

If that's the case for some given situation in your code, you should probably care more about the performance of the latter versus the former.

Bound functions have historically had pretty lousy performance in general, but have recently been much more highly optimized by JS engines. If you benchmarked these variations a couple of years ago, it's entirely possible you'd get different results repeating the same test with the latest engines.

A bound function is now likely to perform at least as good if not better as the equivalent closed-over function. So that's another tick in favor of objects over closures.

I just want to reiterate: these performance observations are not absolutes, and the determination of what's best for a given scenario is very complex. Do not just casually apply what you've heard from others or even what you've seen on some other earlier project. Carefully examine whether objects or closures are appropriately efficient for the task.

## Summary

The truth of this chapter cannot be written out. One must read this chapter to find its truth.

----

Coining some Zen wisdom here was my attempt at being clever. But, you deserve a proper summary of this chapter's message.

Objects and closures are isomorphic to each other, which means that can be used somewhat interchangably to represent state and behavior in your program.

Representation as a closure has certain benefits, like granular change control and automatic privacy. Representation as an object has other benefits, like easier cloning of state.

The critically thinking FPer should be able to conceive any segment of state and behavior in the program with either representation, and pick the representation that's most appropriate for the task at hand.
