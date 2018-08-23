/* 
    A CLI utility for executing commands
    at runtime to control a server instance
*/

const stream = require('stream');
const events = require('events');

class Commander {
    constructor(cmdlistener) {
        if(!!!cmdlistener) throw new Error('A command listener has not been provided');
        this._cmdListener = cmdlistener;
        this._actionEmitter = new events.EventEmitter()
            .on('cmd', (cmd) => {
                this._cmdListener.emit('action', cmd);
            })
            .on('error', (err) => {
                process.stderr.write(err.message);
            });
        this._cmdStream = new stream.Writable({
            write: (chunk, encoding, cb) => {
                let cmds = chunk.toString().split('\n');
                for(let cmd of cmds) {
                    switch(cmd) {
                        case 'shutdown':
                            // shutdown server
                            this._actionEmitter.emit('cmd', 'shutdown');
                            break;
                        case 'print-log':
                            // print existing log
                            break;
                        case 'resource-stats':
                            // print resource stats
                            break;
                        default:
                            // emit error: wrong command
                            break;
                    }
                }
            }
        });
    }
}

module.exports.Commander = Commander;