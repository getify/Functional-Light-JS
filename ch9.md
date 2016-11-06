# Functional-Light JavaScript
# Chapter 9: Functional Async

At this point of the book, you now have all the raw concepts in place for the foundation of FP that I call "Functional-Light Programming". In this chapter, we're going to apply these concepts to a different context, but we won't really present particularly new ideas.

So far, almost everything we've done is synchronous, meaning that we call functions with immediate inputs and immediately get back output values. A lot of work can be done this way, but it's not nearly sufficient for the entirety of a modern JS application. To be truly ready for FP in the real world of JS, we need to understand async FP.

Our goal in this chapter is to expand our thinking about managing values with FP, to spread out such operations over time.

## Time As State

The most complicated state in your entire application is time. That is, it's far easier to manage state when the transition from one state to another is immediate and affirmatively in your control. When the state of your application changes implicitly in response to events spread out over time, management becomes exponentially more difficult.

Every part of how we've presented FP in this text has been about making code easier to read by making it more trustable and more predictable. When you introduce asynchrony to your program, those efforts take a big hit.

But let's be more explicit: it's not the mere fact that some operations don't finish synchronously that is concerning; firing off asynchronous behavior is easy. It's the coordination of the responses to these actions, each of which has the potential to change the state of your application, that requires so much extra effort.

So, is it better for you the author to take that effort, or should you just leave it to the reader of your code to figure out what the state of the program will be if A finishes before B, or vice versa? That's a rhetorical question but one with a pretty concrete answer from my perspective: to have any hope of making such complex code more readable, the author has to take a lot more concern than they normally would.

### Reducing Time

One of the most important outcomes of async programming patterns is simplifying state change management by abstracting out time from our sphere of concern.

To illustrate, let's first look at a scenario where a race condition (aka, time complexity) exists, and must be manually managed:

```js
var customerId = 42;
var customer;

lookupCustomer( customerId, function onCustomer(customerRecord){
	var orders = customer ? customer.orders : null;
	customer = customerRecord;
	if (orders) {
		customer.orders = orders;
	}
} );

lookupOrders( customerId, function onOrders(customerOrders){
	if (!customer) {
		customer = {};
	}
	customer.orders = customerOrders;
} );
```

The `onCustomer(..)` and `onOrders(..)` callbacks are in a binary race condition. Assuming they both run, it's possible that either might run first, and it's impossible to predict which will happen.

If we could embed the call to `lookupOrders(..)` inside of `onCustomer(..)`, we'd be sure that `onOrders(..)` was running after `onCustomer(..)`. But we can't do that, because we need the two lookups to occur concurrently.

So to normalize this time-based state complexity, we use a pairing of `if`-statement checks in the respective callbacks, along with an outer lexically-closed over variable `customer`. When each callback runs, it checks the state of `customer`, and thus determines its own relative ordering; if `customer` is unset for a callback, it's the first to run, otherwise it's the second.

This code works, but it's far from ideal in terms of readability. The time complexity makes this code harder to read.

Let's instead use a JS promise to factor time out of the picture:

```js
var customerId = 42;

var customerPromise = lookupCustomer( customerId );
var ordersPromise = lookupOrders( customerId );

customerPromise.then( function onCustomer(customer){
	ordersPromise.then( function onOrders(orders){
		customer.orders = orders;
	} );
} );
```

The `onOrders(..)` callback is now inside of the `onCustomer(..)` callback, so their relative ordering is guaranteed. The concurrency of the lookups is accomplished by making the `lookupCustomer(..)` and `lookupOrders(..)` calls separately before specifying the `then(..)` response handling.

It may not be obvious, but there would otherwise inherently be a race condition in this snippet, were it not for how promises are defined to behave. If the lookup of the `orders` finishes before the `ordersPromise.then(..)` is called to provide an `onOrders(..)` callback, *something* needs to be smart enough to keep that `orders` list around until `onOrders(..)` can be called. In fact, the same concern could apply to `record` being present before `onCustomer(..)` is specified to receive it.

That *something* is the same kind of time complexity logic we discussed with the previous snippet. But we don't have to worry about any of that complexity, either in the writing of this code or -- more importantly -- in the reading of it, because the promises take care of that time normalization for us.

A promise represents a single (future) value in a time-independent manner. Moreover, extracting the value from a promise is the asynchronous form of the synchronous assiginment (via `=`) of an immediate value. In other words, a promise spreads an `=` assignment operation out over time, but in a trustable (time-independent) fashion.

We'll now explore how we similarly can spread various synchronous FP operations from earlier in this book asynchronously over time.

## Eager vs Lazy

Eager and lazy in the realm of computer science aren't compliments or insults, but rather ways to describe whether an operation will finish right away or finish over time.

The FP operations that we've seen in this text can be characterized as eager because they operate synchronously (right now) on a discrete value or list of values.

For example:

```js
var a = [1,2,3]

var b = a.map( v => v * 2 );

b;			// [2,4,6]
```

This mapping is eager because it operates on all the values in the `a` array at that moment, and produces a new array we call `b`. If you later modify `a`, for example adding a new value to the end of it, nothing will change about the contents of `b`. That's eager FP.

But what would it look like to have a lazy FP operation? Consider something like this:

```js
var a = [];

var b = mapLazy( a, v => v * 2 );

a.push( 1 );

a[0];		// 1
b[0];		// 2

a.push( 2 );

a[1];		// 2
b[1];		// 4
```

The `mapLazy(..)` we've imagined here essentially "listens" to the `a` array, and every time a new value is added to the end of it (with `push(..)`), it runs the `v => v * 2` mapping function and pushes the transformed value to the `b` array.

Consider the benefits of being able to pair an `a` and `b` together, where any time you put a value into `a`, it's transformed and projected to `b`. That's the same kind of declarative FP power out of a `map(..)` operation, but now it can be stretched over time; you don't have to know all the values of `a` to set up the mapping.

**Note:** The implementation of `mapLazy(..)` has not been shown because this is a fictional illustration, not a real operation. To accomplish this kind of lazy operation pairing between `a` and `b`, these values will need to be smarter than simple arrays.

### Observables

// TODO

## Summary

// TODO
