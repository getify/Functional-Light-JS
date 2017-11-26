"use strict";

// curried list operators
var map = unboundMethod( "map", 2 );
var filter = unboundMethod( "filter", 2 );
var filterIn = filter;
var reduce = unboundMethod( "reduce", 3 );
var each = unboundMethod( "forEach", 2 );
var flatMap = curry( function flatMap(mapperFn,arr) {
	return arr.reduce( function reducer(list,v) {
		return list.concat( mapperFn( v ) );
	}, [] );
} );


// ************************************

function filterOut(predicateFn,arr) {
	return filterIn( not( predicateFn ), arr );
}

function not(predicate) {
	return function negated(...args){
		return !predicate( ...args );
	};
}

function reverseArgs(fn) {
	return function argsReversed(...args){
		return fn( ...args.reverse() );
	};
}

function spreadArgs(fn) {
	return function spreadFn(argsArr) {
		return fn( ...argsArr );
	};
}

function partial(fn,...presetArgs) {
	return function partiallyApplied(...laterArgs){
		return fn( ...presetArgs, ...laterArgs );
	};
}

function partialRight(fn,...presetArgs) {
	return function partiallyApplied(...laterArgs) {
		return fn( ...laterArgs, ...presetArgs );
	};
}

function curry(fn,arity = fn.length) {
	return (function nextCurried(prevArgs){
		return function curried(nextArg){
			var args = [ ...prevArgs, nextArg ];

			if (args.length >= arity) {
				return fn( ...args );
			}
			else {
				return nextCurried( args );
			}
		};
	})( [] );
}

function uncurry(fn) {
	return function uncurried(...args){
		var ret = fn;

		for (let i = 0; i < args.length; i++) {
			ret = ret( args[i] );
		}

		return ret;
	};
}

function zip(arr1,arr2) {
	var zipped = [];
	arr1 = arr1.slice();
	arr2 = arr2.slice();

	while (arr1.length > 0 && arr2.length > 0) {
		zipped.push( [ arr1.shift(), arr2.shift() ] );
	}

	return zipped;
}

function compose(...fns) {
	return function composed(result){
		// copy the array of functions
		var list = fns.slice();

		while (list.length > 0) {
			result = list.pop()( result );
		}

		return result;
	};
}

function pipe(...fns) {
	return function piped(result){
		var list = fns.slice();

		while (list.length > 0) {
			result = list.shift()( result );
		}

		return result;
	};
}

function prop(name,obj) {
	return obj[name];
}

function setProp(name,obj,val) {
	var o = Object.assign( {}, obj );
	o[name] = val;
	return o;
}

function unboundMethod(methodName,argCount = 2) {
	return curry(
		(...args) => {
			var obj = args.pop();
			return obj[methodName]( ...args );
		},
		argCount
	);
}
