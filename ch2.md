# Functional-Light JavaScript
# Chapter 2: Managing Function Inputs

In Chapter 1 "Function Inputs", we talked about the basics of function parameters and arguments. We even looked at some syntactic tricks for easing their use such as the `...` operator and destructuring.

I recommended in that first chapter that you try to design functions with a single parameter if at all possible. The fact is, this won't always be possible, and you won't always be in control of function signatures that you need to work with.

We now want to turn our attention to more sophisticated and powerful patterns for wrangling function inputs in these occasions.

## Some Now, Some Later

If a function takes multiple arguments, it may be the case that you want to specify some of those upfront and leave the rest to be specified later.

Consider:

```js
function foo(x,y,z,w) {
	// ..
}
```
