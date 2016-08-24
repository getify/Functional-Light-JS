# Functional-Light JavaScript
# Chapter 5: Composing Functions

// TODO:

```js
function compose(...fns) {
	return function composed(result) {
		while (fns.length > 0) {
			result = fns.pop()( result );
		}
		return result;
	};
}
```

// TODO: use reverse() and array destructuring here

```js
function compose(...fns) {
	if (fns.length == 2) {
		return compose2( fns[0], fns[1] );
	}

	return compose(
		...fns.slice( 0, fns.length - 2),
		compose2( ...fns.slice( fns.length - 2 ) )
	);

	function compose2(fn1,fn2) {
		return function composed(...args){
			return fn1( fn2( ...args ) );
		};
	}
}
```

// TODO: implement with `reduce(..)`
