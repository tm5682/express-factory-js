const express = require('express');
const Factory = require('./factory').ExpressFactory;

const instance = Factory(express);

const aLoggingMiddleware = function(req, res, next) {
    console.log(`Incoming from ${req.url}`);
    next();
};

instance.addMiddleware(aLoggingMiddleware);

instance.addRoute('get', '/', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /');
    res.write('\n');
    res.end();
});
instance.addRoute('get', '/room', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /room');
    res.write('\n');
    res.end();
});
instance.addRoute('get', '/window', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /window');
    res.write('\n');
    res.end();
});
instance.addRoute('get', '/balcony', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /balcony');
    res.write('\n');
    res.end();
});
instance.addRoute('get', '/kitchen', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /kitchen');
    res.write('\n');
    res.end();
}, true);
instance.addRoute('get', '/guestroom', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.write('Server reply: ')
    res.write('At /guestroom');
    res.write('\n');
    res.end();
}, true, true);
instance.removeRoute('/window');

instance.bootstrap();

instance.start();