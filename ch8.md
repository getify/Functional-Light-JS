# Functional-Light JavaScript
# Chapter 8: Recursion

On the next page, we're going to jump into the topic of recursion.

<hr>

*(rest of the page intentionally left blank)*

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

<div style="page-break-after: always;"></div>

Let's talk about recursion. Before we dive in, consult the previous page for the formal definition.

Weak joke, I know. :)

Recursion is one of those programming techniques that most developers admit can be very powerful, but also most of them don't like to use it. I'd put it in the same category as regular expressions, in that sense. Powerful, but confusing, and thus seen as *not worth the effort*.

I'm a big fan of recursion, and you can, too! My goal in this chapter is to convince you that recursion is an important tool that you should bring with you in your FP approach to code. When used properly, recursion is powerfully declarative for complex problems.

## Definition

Recursion is when a function calls itself, and that call does the same, and this cycle continues until a base condition is satisfied and the call loop unwinds.

**Warning:** If you don't ensure that a base condition is *eventually* met, recursion will run forever, and crash or lock up your program; the base condition is pretty important to get right!

But... that definition is too confusing in its written form. We can do better. Consider this recursive function:

```js
function foo(x) {
	if (x < 5) return x;
	return foo( x / 2 );
}
```

Let's visualize what happens with this function when we call `foo( 16 )`:

<p align="center">
	<img src="fig13.png" width="850">
</p>

In step 2, `x / 2` produces `8`, and that's passed in as the argument so a recursive `foo(..)` call. In step 3, same thing, `x / 2` produces `4`, and that's passed in as the argument to yet another `foo(..)` call. That part is hopefully fairly straightforward.

But where someone may often get tripped up is what happens in step 4. Once we've satisifed the base condition where `x` (value `4`) is `< 5`, we no longer make any more recursive calls, and just (effectively) do `return 4`. Specifically the dotted line return of `4` in this figure simplifies what's happening there, so let's dig into that last step and visualize it as these three sub-steps:

<p align="center">
	<img src="fig14.png" width="850">
</p>

Once the base condition is satisified, the returned value cascades back through all of the calls (and thus `return`s) in the call stack, eventually `return`ing the final result out.

Another recursion example:

```js
function isPrime(num,divisor = 2){
	if (num < 2 || (num > 2 && num % divisor == 0)) {
		return false;
	}
	if (divisor <= Math.sqrt( num )) {
		return isPrime( num, divisor + 1 );
	}

	return true;
}
```

One of the most famous examples of recursion is calculating a Fibonacci number, where the sequence is defined as:

```
Fib( 0 ): 0
Fib( 1 ): 1
Fib( n ):
	Fib( n - 2 ) + Fib( n - 1 )
```

Expressed directly in code:

```js
function fib(n) {
	if (n <= 1) return n;
	return fib( n - 2 ) + fib( n - 1 );
}
```

`fib(..)` calls itself recursively twice, which is typically referred to as binary recursion. We'll talk more about binary recursion later.

### Mutual Recursion

When a function calls itself, specifically, this is referred to as direct recursion. That's what we saw in the previous section with `foo(..)`, `isPrime(..)`, and `fib(..)`. Two or more functions can call each other in a recursive cycle, and this is referred to as mutual recursion.

These two functions are mutually recursive:

```js
function isOdd(v) {
	if (v === 0) return false;
	return isEven( Math.abs( v ) - 1 );
}

function isEven(v) {
	if (v === 0) return true;
	return isOdd( Math.abs( v ) - 1 );
}
```

Yes, this is a silly way to calculate if a number is odd or even. But it illustrates the idea that certain algorithms can be defined in terms of mutual recursion.

Recall the binary recursive `fib(..)` from the previous section; we could instead have expressed it with mutual recursion:

```js
function fib_(n) {
	if (n == 1) return 1;
	else return fib( n - 2 );
}

function fib(n) {
	if (n == 0) return 0;
	else return fib( n - 1 ) + fib_( n );
}
```

**Note:** This mutually recursive `fib(..)` implementation is adapted from research presented in "Fibonacci Numbers Using Mutual Recursion" (https://www.researchgate.net/publication/246180510_Fibonacci_Numbers_Using_Mutual_Recursion).

While these mutual recursion examples shown are rather contrived, there are more complex use cases where mutual recursion can be very helpful.

### Why Recursion?

Now that we've defined and illustrated recursion, we should examine why recursion is useful.

The most commonly cited reason that recursion fits the spirit of FP is because it trades (much of) the explicit tracking of state with implicit state on the call stack. Typically, recursion is most useful when the problem requires conditional branching and back-tracking, and managing that kind of state in a purely iterative environment can be quite tricky; at a minimum, the code is highly imperative and harder to read and verify. But tracking each level of branching as its own scope on the call stack often significantly cleans up the readability of the code.

Simple iterative algorithms can trivially be expressed as recursion:

```js
function sum(total,...nums) {
	for (let i = 0; i < nums.length; i++) {
		total = total + nums[i];
	}

	return total;
}

// vs

function sum(total,...nums) {
	if (nums.length == 0) return total;
	return total + sum( ...nums );
}
```

It's not just that the `for`-loop is eliminated in favor of the call stack, but that the incremental partial sums (the intermittent state of `total`) are tracked implicitly across the `return`s of the call stack instead of reassigning `total` each iteration. FPers will often prefer to avoid reassignment of local variables where it's possible to avoid.

In a basic algorithm like this kind of summation, this difference is minor and nuanced. But the more sophisticated your algorithm, the more you will likely see the payoff of recursion instead of imperative state tracking.

## Declarative Recursion

Mathematicians use the **Σ** symbol as a placeholder to represent the summation of a list of numbers. The primary reason they do that is because it's more cumbersome (and less readable!) if they're working with more complex formulas and they have to write out the summation manually, like `1 + 3 + 5 + 7 + 9 + ..`. Using the notation is declarative math!

Recursion is declarative for algorithms in the same sense that **Σ** is declarative for mathematics. Recursion expresses that a problem solution exists, but doesn't necessarily require the reader of the code to understand how that solution works. Let's consider two approaches to finding the highest even number passed as an argument:

```js
function maxEven(...nums) {
	var num = -Infinity;

	for (let i = 0; i < nums.length; i++) {
		if (nums[i] % 2 == 0 && nums[i] > num) {
			num = nums[i];
		}
	}

	if (num !== -Infinity) {
		return num;
	}
}
```

This implementation is not particulary intractable, but it's also not readily apparent what its nuances are. How obvious is it that `maxEven()`, `maxEven(1)`, and `maxEven(1,13)` all return `undefined`? Is it quickly clear why the final `if` statement is necessary?

Let's instead consider a recursive approach, to compare. We could notate the recursion this way:

```
maxEven( nums ):
	maxEven( nums.0, maxEven( ...nums.1 ) )
```

In other words, we can define the max-even of a list of numbers as the max-even of the first number compared to the max-even of the rest of the numbers. For example:

```
maxEven( 1, 10, 3, 2 ):
	maxEven( 1, maxEven( 10, maxEven( 3, maxEven( 2 ) ) )
```

To implement this recursive definition in JS, one approach is:

```js
function maxEven(num1,...restNums) {
	var maxRest = restNums.length > 0 ?
			maxEven( ...restNums ) :
			undefined;

	return (num1 % 2 != 0 || num1 < maxRest) ?
		maxRest :
		num1;
}
```

So what advantages does this approach have?

First, the signature is a little different than before. I intentionally called out `num1` as the first argument name, collecting the rest of the arguments into `restNums`. But why? We could just have collected them all into a single `nums` array and then referred to `nums[0]`.

This function signature is an intentional hint at the recursive definition. It reads like this:

```
maxEven( num1, ...restNums ):
	maxEven( num1, maxEven( ...restNums ) )
```

Do you see the symmetry between the signature and the recursive definition?

When we can make the recursive definition more apparent even in the function signature, we improve the declarativeness of the function. And if we can then mirror the recursive definition from the signature to the function body, it gets even better.

But I'd say the most obvious improvement is that the distraction of the imperative `for`-loop is suppressed. All the looping logic is abstracted into the recursive call stack, so that stuff doesn't clutter the code. We're free then to focus on the logic of finding a max-even by comparing two numbers at a time -- the important part anyway!

Mentally, what's happening is similar to when a mathematician uses a **Σ** summation in a larger equation. We're saying, "the max-even of the rest of the list is calculated by `maxEven(...restNums)`, so we'll just assume that part and move on."

Additionally, we reinforce that notion with the `restNums.length > 0` guard, because if there are no more numbers to consider, the natural result is that `maxRest` would have to be `undefined`. We don't need to devote any extra mental attention to that part of the reasoning. This base condition (no more numbers to consider) is clearly evident.

Next, we turn our attention to checking `num1` against `maxRest` -- the main logic of the algorithm is how to determine which of two numbers, if any, is a max-even. If `num1` is not even (`num1 % 2 != 0`), or it's less than `maxRest`, then `maxRest` *has* to be `return`ed, even if it's `undefined`. Otherwise, `num1` is the answer.

The case I'm making is that this reasoning while reading an implementation is more straightforward, with fewer nuances or noise to distract us, than the imperative approach; it's **more declarative** than the `for`-loop with `-Infinity` approach.

**Tip:** We should point out that another (likely better!) way to model this besides manual iteration or recursion would be with list operations like we discussed in Chapter 7. The list of numbers could first be `filter(..)`ed to include only evens, and then finding the max is a `reduce(..)` that simply compares two numbers and returns the bigger of the two. We only used this example to illustrate the more declarative nature of recursion over manual iteration.

Here's another recursion example: calculating the depth of a binary tree. The depth of a binary tree is the longest path down (either left or right) through the nodes of the tree. Another way to define that is recursively: the depth of a tree at any node is 1 (the current node) plus the greater of depths from either its left or right child trees:

```
depth( node ):
	1 + max( depth( node.left ), depth( node.right ) )
```

Translating that straightforwardly to a binary recursive function:

```js
function depth(node) {
	if (node) {
		let depthLeft = depth( node.left );
		let depthRight = depth( node.right );
		return 1 +
			(depthLeft > depthRight ? depthLeft : depthRight);
	}

	return 0;
}
```

I'm not going to list out the imperative form of this algorithm, but trust me, it's a lot messier and more imperative. This recursive approach is nicely and gracefully declarative. It follows the recursive definition of the algorithm very closely with very little distraction.

Not all problems are cleanly recursive. This is not some silver bullet that you should try to apply broadly. But recursion can be very effective at evolving the expression of a problem from more imperative to more declarative.

## Stack

// TODO

### Proper Tail Calls (PTC)

// TODO

## Rearranging Recursion

// TODO

### Replacing The Stack

// TODO

### Continuation Passing Style (CPS)

// TODO

```js
function fib(n,c = v => v) {
	if (n <= 1) return c( n );
	return fib( n - 2, v => fib( n - 1, w => c( v + w ) ) );
}
```

### Trampolines

// TODO

## Summary

Recursion is when a function recursively calls itself. Heh. Recursive definition of recursion. Get it!?

Direct recursion is a function that makes at least one call to itself, and it keeps dispatching to itself until it satisifies a base condition. Mutual recursion is when a two or more functions recursively loop by *mutually* calling each other, again until a base condition is met.
