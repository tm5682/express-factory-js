const events = require('events');
const Commander = require('./commander').Commander;

function factory(express) {
    /*
        * A factory for creating Express instances
        * Can be used for controlling the use of Express
        * directly by a client. All middleware are 
        * mounted before the server is started.
        * MWs can be removed besides routes 
        * Similar to a Proxy in this particular used case
    */
    function _express(e) {
        this._express = e();
        this._routeMap = []; // { route: url, handler: callback (req, res, next) }
        this._mws = []; // a list of middleware; insertion order enforced
        this._cmdListener = new events.EventEmitter()
            .on('action', (action) => {
                switch(action) {
                    case 'shutdown':
                        this._express = null;
                        this._routeMap = null;
                        this._mws = null;
                        process.stdout.write('\nShutting down server....\n');
                        process.exit(0);
                }
            });
        this._cmdr = new Commander(this._cmdListener);
    }
    _express.prototype.addMiddleware = function(mw) {
        this._mws.push({
            name: mw.constructor.name, // index using ctor name
            mw: mw,
            args: Array.prototype.splice.call(arguments, 1) // exclude mw
        });
    };
    _express.prototype.removeMiddleware = function(ctorName) {
        // remove a middleware by constructor name
        let i = this._mws.findIndex((o) => {
            return o.name === ctorName;
        });
        if(i < 0) return false;
        this._mws.splice(i, 1);
        return true; 
    };
    _express.prototype.addRoute = function(method, route, cb, isAsync=false, excludeNext=false) {
        // add a new route to map; if isasync, when use promise/async await
        this._routeMap.push({
            method: method,
            route: route,
            cb: cb,
            isAsync: isAsync,
            excludeNext: false
        });
    };
    _express.prototype.removeRoute = function(route) {
        // remove a route handler using the route url; removes the first one if found
        // else returns false
        let i = this._routeMap.findIndex((o => o.route === route));
        if(i < 0) return false;
        else this._routeMap.splice(i, 1);
        return true;
    };
    _express.prototype.bootstrap = function() {
        if(!!!this._express) throw new Error('_express is not defined');
        if(!!!this._routeMap || this._routeMap.length < 1) throw new Error('At least one route must be defined');
        if(!!this._mws && this._mws.length > 0) {
            for(let mwo of this._mws) {
                // mount all middleware
                this._express.use(mwo.mw, mwo.args);
            }
        }
        for(let rmo of this._routeMap) {
            // get the correct http method
            let fn = this._express[rmo.method];
            if(rmo.isAsync) {
                fn.call(this._express, rmo.route, async(req, res, next) => {
                    // explicitly control flow by restricting next
                    if(rmo.excludeNext) rmo.cb(req, res);
                    else rmo.cb(req, res, next);
                });
            }
            else {
                fn.call(this._express, rmo.route, (req, res, next) => {
                    if(rmo.excludeNext) rmo.cb(req, res);
                    else rmo.cb(req, res, next)
                });
            }
        }
    };
    _express.prototype.start = function(port=4200, startCb) {
        startCb = !!!startCb ? (() => {
            console.log('Express server started at port: ' + port);
            process.stdin.pipe(this._cmdr._cmdStream, { end: false });
        }) : startCb;
        this._express.listen(port, startCb);
    };
    _express.prototype.testFn = function() {
        process.stdout.write("testFn was run ok\n");
    }
    return new _express(express);
}

module.exports.ExpressFactory = factory;