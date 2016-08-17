# Functional-Light JavaScript
# Chapter 1: Functional Functions

Functional Programming (FP) is not a new concept by any means. It's been around almost as long as any programming has been around. I don't know if it's fair to say, but it sure hasn't seemed like as mainstream of a concept in the overall developer world until perhaps the last few years. I think FP has more been the realm of academics.

But that's all changing. There's a groundswell of interest growing around FP, not just at the languages level but even in libraries and frameworks. You very well might be reading this text because you've finally realized FP is something you can't ignore any longer. Or maybe you're like me and you've tried to learn FP many times before but struggled to wade through all the terms or mathematical notation.

Whatever your reason for reading this book, welcome to the party!

We're going to approach FP from the ground up, and uncover the basic foundational principles that I believe all formal FPers would admit are the framework for everything they do. But we'll stay arms length away from any of the intimidating terminology or notation that can so easily frustrate learners.

Functional Programming is not just programming with functions. Oh if only it was that easy, I could end the book right here! But in a way, the function *is* at the center of FP. And yet, how sure are you that you know what is meant by *function*?

## What Is A Function?

The most natural place I can think of to start tackling functional programming is with the *function*. That may seem too simplistic and too obvious, but I think our journey needs a solid first step, and this is it.

So... what is a function?

### Brief Math Review

I know I've promised we'd stay away from math notation as much as possible, but let's just quickly observe some simple things about funtions and graphs from basic algebra before we move on.

Do you remember learning anything about `f(x)` back in school? What about the equation `y = f(x)`?

Let's say an equation is defined like this: `f(x) = 2x^2 + 3`. What does that mean? What does it mean to graph that equation? Here's the graph:

<img src="fig1.png">

What you can notice is that for any value of `x`, say `2`, if you plug it into the equation, you get `11`. What is `11`, though? It's the *return value* of the `f(x)` function, which earlier we said represents a `y` value.

In other words, there's a point as `(2,11)` on that curve in the graph. And for every value of `x` we plug in, we get another `y` value that pairs with it as a coordinate for a point. Another is `(0,3)`, and another is `(-1,5)`. Put all those points together, and you have the graph of that parabolic curve as shown above.

So what's any of this got to do with FP?

In math, a function always takes input, and always gives an output. Those inputs and outputs are often interpreted as parts of coordinates to be graphed.

In our programs, however, we can define functions with all sorts of inputs and output(s), and they need not have any relationship to a curve on a graph.

### Function vs Procedure

So why all the talk of math and graphs? Because in a sense functional programming is about embracing using functions as *functions* in this mathematical sense.

You're probably most used to thinking of functions as general procedures. What is a procedure? An arbitrary collection of functionality. It may have inputs, it may not. It may have an output (`return` value), it may not.

But a function specifically takes input(s), and definitely has a `return` value.

So the first observation I'd make about functional programming is that you should be using functions as much as possible, and not procedures. Why? The answer to that will have many levels that we'll uncover throughout this book.




