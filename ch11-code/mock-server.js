function connectToServer() {
	// faking an event emitter attached to a server-event stream
	return evtEmitter;
}


// ***********************************
// MOCK SERVER
// ***********************************

// simple/mock event emitter
var evtEmitter = {
	handlers: {},
	on(evtName,cb) {
		this.handlers[evtName] = this.handlers[evtName] || [];
		this.handlers[evtName][this.handlers[evtName].length] = cb;
	},
	addEventListener(...args) {
		return this.on( ...args );
	},
	removeEventListener(){},
	emit(evtName,...args) {
		for (let handler of (this.handlers[evtName] || [])) {
			handler(...args);
		}
	}
};

var stocks = {
	"AAPL": { price: 121.95, change: 0.01 },
	"MSFT": { price: 65.78, change: 1.51 },
	"GOOG": { price: 821.31, change: -8.84 },
};

setTimeout( function initialStocks(){
	for (let id in stocks) {
		// !!SIDE EFFECTS!!
		evtEmitter.emit( "stock", Object.assign( { id }, stocks[id] ) );
	}
}, 100 );

setTimeout( function randomStockUpdate(){
	var stockIds = Object.keys( stocks );
	var stockIdx = randInRange( 0, stockIds.length - 1 );
	var change = (randInRange( 1, 10 ) > 7 ? -1 : 1) *
		(randInRange( 1, 10 ) / 1E2);

	var newStock = Object.assign( stocks[stockIds[stockIdx]] );
	newStock.price += change;
	newStock.change += change;

	// !!SIDE EFFECTS!!
	stocks[stockIdx[stockIdx]] = newStock;
	evtEmitter.emit( "stock-update", Object.assign( { id: stockIds[stockIdx] }, newStock ) );

	setTimeout( randomStockUpdate, randInRange( 300, 1500 ) );
}, 1000 );


// !!SIDE EFFECTS!!
function randInRange(min = 0,max = 1E9) {
	return (Math.round(Math.random() * 1E4) % (max - min)) + min;
}
