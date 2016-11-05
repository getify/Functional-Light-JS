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

We'll now explore how we similarly can spread the synchronous FP operations from earlier in this book asynchronously over time.

## Eager vs Lazy

// TODO

## Summary

// TODO
