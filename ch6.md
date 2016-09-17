# Functional-Light JavaScript
# Chapter 6: Value Immutability

In Chapter 5, we talked about the importance of reducing side causes/effects: the ways that your application's state can change unexpectedly and cause surprises (bugs). The fewer places we have with such landmines, the more confidence we have over our code, and the more readable it will be. Our topic for this chapter follows directly from that same effort.

If programming-style idempotence is about defining a value change operation so that it can only affect state once, we now turn our attention to the goal of reducing the number of change occurrences from one to zero.

Let's now explore value immutability, the notion that we use only values in our programs that cannot be changed.

## Value To Value

We'll unpack this idea more throughout the chapter, but just to start with a clear understanding in mind: value immutability does not mean we can't have values change over the course of our program. It also doesn't mean that our variables can't hold different values. These are all common misconceptions about value immutability.

Value immutability means that *when* we need to change the state in our program, we must create a new value rather than mutate an existing value.

For example:

```js
function addValue(arr) {
	var newArr = [ ...arr, 4 ];
	return newArr;
}

addValue( [1,2,3] );	// [1,2,3,4]
```

Notice that we did not change the array that `arr` references, but rather created a new array (`newArr`) that contains the existing values plus the new `4` value.

Analyze `addValue(..)` based on what we discussed in Chapter 5 about side causes/effects. Is it pure? Does it have referential transparency? Given the same array, will it always produce the same output? Is it free of both side causes and side effects? **Yes.**

Imagine the `[1,2,3]` array represents a sequence of data from some previous operations and we stored in some variable. It is our current state. If we want to compute what the next state of our application is, we call `addValue(..)`. But we want that act of next-state computation to be direct and explicit. So the `addValue(..)` operation takes a direct input, returns a direct output, and avoids creating a side effect by mutating the original array that `arr` references.

This means we can calculate the new state of `[1,2,3,4]` and be fully in control of that transition of states. No other part of our program can unexpectedly transition us to that state early, or to another state entirely, like `[1,2,3,5]`. By being disciplined about our values and treating them as immutable, we drastically reduce the surface area of surprise, making our programs easier to read, reason about, and ultimately trust.

The array that `arr` references is actually mutable. We just chose not to mutate it, so we practiced the spirit of value immutability.

### Non-Local

The importance of an immutable value can be seen if you do something like this:

```js
var arr = [1,2,3];
foo( arr );
console.log( arr[0] );
```

Ostensibly, you're expecting `arr[0]` to still be the value `1`. But is it? You don't know, because `foo(..)` *might* mutate the array using the reference you pass to it.

We already saw a cheat in the previous chapter to avoid such a surprise:

```js
var arr = [1,2,3];
foo( arr.slice() );			// ha! a copy!
console.log( arr[0] );		// 1
```

Of course, that assertion holds true only if `foo` doesn't skip its parameter and reference our same `arr` via free variable lexical reference!

In a little bit, we'll see another strategy for protecting ourselves from a value being mutated out from underneath us unexpectedly.

## Reassignment

How would you describe what a "constant" is? Think about that for a moment before you move onto the next paragraph.

...

Some of you may have conjured descriptions like, "a value that can't change", "a variable that can't be changed", etc. These are all approximately in the neighborhood, but not quite at the right house. The precise definition we should use for a constant is: a variable that cannot be reassigned.

This nitpicking is actually really important, because it points out that a constant actually has nothing to do with the value, except to say that whatever value a constant holds, that variable cannot be reassigned to any other value. But it says nothing about the nature of the value itself.

Consider:

```js
var x = 2;
```

The value `2` is unchangeable. It's what we call a primitive in JS. There's no way to change or redefine what `2` means. It means the numeric `2` in base-10, always and forever.

If I change that code to this:

```js
const x = 2;
```

The presence of the `const` keyword, known familiarly as a "constant declaration", actually does nothing at all to change the nature of `2`; it's already unchangeable, and it always will be.

It's true that this later line will fail with an error:

```js
// try to change `x`, fingers crossed!

x = 3;		// Error!
```

But again, we're not changing anything about the value. We're attempting to reassign the variable `x`. The values involved are almost incidental.

To prove that `const` has nothing to do with the nature of the value, consider:

```js
const x = [2];
```

Is the array a constant? **No.** `x` is a constant because it cannot be reassigned. But this later line is totally OK:

```js
x[0] = 3;
```

Why? Because the array is still totally mutable, even though `x` is a constant.

The confusion around `const` and "constant" only dealing with assignments and not value semantics is a long and dirty story. It seems a high degree of developers in just about every language that has a `const` stumble over the same sorts of confusions. Java in fact deprecated `const` and introduced a new keyword `final` just to separate itself from the confusion over "constant" semantics.

Setting aside the confusion detractions, what importance does `const` hold for the FPer, if not to have anything to do with creating an immutable value?

### Intent

The use of `const` tells the reader of your code that *that* variable will not be reassigned. As a signal of intent, `const` is often highly lauded as a welcome addition to JavaScript and universal improvement in code readability.

In my opinion, this is all hype; there's no substance to these claims. I see only the mildest of faint benefit in signaling your intent in this way. And when you match that up against decades of precedent around confusion about it implying value immutability, I don't think `const` comes even close to carrying its own weight.

To back up my assertion, let's take a reality check. `const` creates block scoped variables, meaning those variables only exist in that one localized block:

```js
// lots of code

{
	const x = 2;

	// a few lines of code
}

// lots of code
```

Typically, blocks are considered best designed to be only a few lines long. If you have blocks of more than say 10 lines, most developers will advise you to refactor. So `const x = 2` only applies to those next 9 lines of code at most.

No other part of the program can ever affect the assignment of `x`. Period. I say that program has basically the same magnitude of readability as this one:

```js
// lots of code

{
	var x = 2;

	// a few lines of code
}

// lots of code
```

If you look at the next few lines of code after `var x = 2;`, you'll be able to easily tell that `x` is not in fact reassigned. That to me is a **much stronger signal** -- actually not reassigning it -- than the use of some confusable `const` declaration to say "won't reassign it".

Moreover, let's consider what this code is likely to communicate to a reader for the first time:

```js
const magicNums = [1,2,3,4];

// ..
```

Isn't it at least possible that the reader of your code will assume (wrongly) that your intent is to never mutate the array? That seems like a reasonable inference to me. Imagine their confusion if you do in fact allow the array value referenced by `magicNums` to be mutated. That will create quite a surprise, won't it!?

Worse, what if you intentionally mutate `magicNums` in some way that turns out to not be obvious to the reader? Later in the code, they see a usage of `magicNums` and assume (again, wrongly) that it's still `[1,2,3,4]` because they read your intent as, "not gonna change this".

I think you should use `var` or `let` for declaring variables to hold values that you intend to mutate. I think that actually is a **much clearer signal** than using `const`.

But the troubles with `const` don't stop there. Remember we asserted at the top of the chapter that to treat values as immutable means that when our state needs to change, we have to create a new value instead of mutating it? What are you going to do with that new array once you've created it? If you declared your reference to it using `const`, you can't reassign it. So... what next?

In this light, I see `const` as actually making our efforts to adhere to FP harder, not easier. My conclusion: `const` is not all that useful. It creates unnecessary confusion and restricts us in inconvenient ways. I only use `const` for simple constants like:

```js
const PI = 3.141592;
```

The value `3.141592` is already immutable, and I'm clearly signaling, "this `PI` will be used as stand-in placeholder for this literal value." To me, that's what `const` is good for. And to be frank, I don't use many of those kinds of declarations in my typical coding.

I've written and seen a lot of JavaScript, and I just think it's an imagined problem that our bugs come from accidental reassignment.

The thing we need to worry about is not whether our variables get reassigned, but **whether our values get mutated**. Why? Because values are portable, lexical assignments are not. You can pass an array to a function, and it can be changed without you realizing it. But you cannot have a reassignment happen unexpectedly by some other part of your program.

### It's Freezing In Here

There's a cheap and simple way to turn a mutable object/array/function into an "immutable value" (of sorts):

```js
var x = Object.freeze( [2] );
```

The `Object.freeze(..)` utility goes through all the properties/indices of an object/array and marks them as read-only, so they themselves cannot be reassigned. It's sorta like declaring properties with a `const`, actually! It also marks the properties as non-reconfigurable, and it marks the object/array itself as non-extensible (no new properties can be added). In effect, it makes the top level of the object immutable.

Top level only, though. Be careful!

```js
var x = Object.freeze( [ 2, 3, [4, 5] ] );

// not allowed:
x[0] = 42;

// oops, still allowed:
x[2][0] = 42;
```

`Object.freeze(..)` is referred to as shallow immutability. You'll have to walk the entire object/array structure manually and apply `Object.freeze(..)` to each sub-object/array if you want a deeply immutable value.

But contrasted with `const` which can confuse you into thinking you're getting an immutable value when you aren't, `Object.freeze(..)` *actually* gives you an immutable value.

Recall the protection example from earlier:

```js
var arr = [1,2,3];
foo( Object.freeze( arr ) );
console.log( arr[0] );			// 1
```

Now `arr[0]` is quite reliably `1`.

This is important because it makes reasoning about our code much easier when we know we can trust that a value doesn't change when passed somewhere that we do not see or control.

## Performance

Whenever we start asserting that we should create new values instead of mutating existing ones, the obvious next question is: what does that mean for performance? If we have to reallocate a new array each time we need to add to it, that's not only churning CPU time and consuming extra memory, the old values (if de-referenced) are getting garbage collected, which is even more CPU burn.

// TODO

## Treatment

What if we receive a value to our function and we're not sure if it's mutable or immutable? Is it ever OK to just go ahead and try to mutate it? **No.** As we asserted at the beginning of this chapter, we should treat all received values as immutable -- to avoid side effects and remain pure -- regardless of whether they are or not.

// TODO

## Summary

The importance of value immutability is less in the inability to change a value, and more in the discipline to treat a value as immutable regardless.
