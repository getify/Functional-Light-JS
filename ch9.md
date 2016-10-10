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

To a large extent, I'd argue the main purpose of async programming patterns is to manage state change where time is abstracted or flat out removed from our sphere of concern.

// TODO

## Lazy vs Eager

// TODO

## Summary

// TODO
