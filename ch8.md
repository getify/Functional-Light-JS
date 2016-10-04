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

Eh, that definition sucks in the written form. We can do better. Consider this recursive function:

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

But where someone may often get tripped up is what happens in step 4. Once we've satisifed the base condition where `x` (value `4`) is `x < 5`, we no longer make any more recursive calls, and just (effectively) do `return 4`. Specifically the dotted line return of `4` in this figure simplifies what's happening there, so let's dig into that last step and visualize it as these four sub-steps:

<p align="center">
	<img src="fig14.png" width="850">
</p>

Once a base condition is satisified, the returned value cascades back through all of the calls in the call stack, eventually returning the value back out.

### Mutual Recursion

When a function calls itself, specifically, this is referred to as direct recursion. Two or more functions can call each other in a recursive cycle, and this is referred to as mutual recursion.

## Summary

Recursion is when a function recursively calls itself. Heh. Recursive definition of recursion. Get it!?

Direct recursion is a function that makes at least one call to itself, and it keeps dispatching to itself until it satisifies a base condition. Mutual recursion is when a two or more functions recursively loop by *mutually* calling each other, again until a base condition is met.
