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

### Mutual Recursion

When a function calls itself, specifically, this is referred to as direct recursion. Two or more functions can call each other in a recursive cycle, and this is referred to as mutual recursion.

These two functions are mutually exclusive:

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

This implementation is not intractable, but it's also not readily apparent what its nuances are. How obvious is it that `maxEven()`, `maxEven(1)`, and `maxEven(1,13)` all return `undefined`? Is it quickly clear why the final `if` statement is necessary?

Let's instead consider a recursive approach, to compare. We could notate the recursion this way:

```
maxEven(nums):
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

First off, the signature is a little different than before. I intentionally called out `num1` as the first argument name, collecting the rest of the arguments into `restNums`. But why? We could just have collected them all into a single `nums` array and then referred to `nums[0]`.

This function signature is an intentional hint at the recursive definition. It reads like this:

```
maxEven(...nums):
	maxEven(num1,...restNums):
		maxEven( num1, maxEven(...restNums) )
```

When we can make the recursive definition more apparent even in the function signature, we improve the declarativeness of the function. And if we can then mirror the recursive definition from the signature to the function body, it gets even better.

But I'd say the most obvious improvement is that the distraction of the imperativeness of the `for`-loop is suppressed. All The looping logic is abstracted into the recursive call stack, so that part doesn't clutter the code. We're free then to focus on the logic of finding a max-even by comparing two numbers at a time.

Mentally, what's happening is similar to when a mathematician uses a **Σ** summation in a larger equation. We're saying, "the max-even of the rest of the list is calculated by `maxEven(...restNums)`, so we'll just assume that part and move on."

Additionally, we reinforce that notion with the `restNums.length > 0` guard, because if there are no more numbers to consider, the natural result is that `maxRest` would have to be `undefined`. We don't need to devote any extra mental attention to that part of the reasoning. In addition, the base condition (no more numbers to consider) is clear in this usage.

Next, we turn our attention to checking `num1` against `maxRest` -- the main logic of the algorithm is how to determine a max-even from two numbers. If `num1` is not even (`num1 % 2 != 0`), or it's less than `maxRest`, then `maxRest` *has* to be `return`ed, even if it's `undefined`. Otherwise, `num1` is the answer.

The case I'm making is that this reasoning about an implementation is more straightforward, with fewer nuances or noise to distract us, than the imperative approach; in other words, it's **more declarative** than the `for`-loop with `-Infinity` approach.

**Tip:** We should point out that another (perhaps better!) way to model this besides manual iteration or recursion would be with list operations like we discussed in Chapter 7. The list of numbers could first be `filter(..)`ed to include only evens, and then finding the max is a `reduce(..)` that simply compares two numbers and returns the bigger of the two. We only used this example to illustrate the more declarative nature of recursion over manual iteration.

Here's another recursion example: calculating the depth of a binary tree. The depth of a binary tree is defined as the longest path down (either left or right) the nodes through the tree. Another way to define that is recursively: the depth of a tree at any node is 1 (the current node) plus the greater of depths of either its left or right child trees:

```
depth(node):
	1 + max( depth( node.left ), depth( node.right ) )
```

Translating that to a recursive function:

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

Not all problems are cleanly recursive. This is not some silver bullet that you should try to apply broadly. But recursion can be very effective at evolving the expression of a problem from imperative to more declarative.

## Stack

// TODO

### Proper Tail Calls (PTC)

// TODO

## Summary

Recursion is when a function recursively calls itself. Heh. Recursive definition of recursion. Get it!?

Direct recursion is a function that makes at least one call to itself, and it keeps dispatching to itself until it satisifies a base condition. Mutual recursion is when a two or more functions recursively loop by *mutually* calling each other, again until a base condition is met.
