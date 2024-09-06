const cluster = require('cluster');
const EventEmitter = require('events').EventEmitter;
const cpuCount = require('os').cpus().length;

const DEFAULT_OPTIONS = {
	workers: cpuCount,
	lifetime: Infinity,
	grace: 5000,
};

const NOOP = () => {};

function manageWorkers(options, startFunction) {
	options = options || {};
	let startFn = options.start || startFunction || options;
	let masterFn = options.master || NOOP;

	if (typeof startFn !== 'function') {
		throw new Error('Start function required');
	}

	if (cluster.isWorker) {
		return startFn(cluster.worker.id);
	}

	let opts =
		typeof options === 'number'
			? {...DEFAULT_OPTIONS, workers: options}
			: {...DEFAULT_OPTIONS, ...options};
	let emitter = new EventEmitter();
	let running = true;
	let runUntil = Date.now() + opts.lifetime;

	listen();
	masterFn();
	fork();

	function listen() {
		cluster.on('exit', revive);
		emitter.once('shutdown', shutdown);
		process.on('SIGINT', proxySignal).on('SIGTERM', proxySignal);
	}

	function fork() {
		for (let i = 0; i < opts.workers; i++) {
			cluster.fork();
		}
	}

	function proxySignal() {
		emitter.emit('shutdown');
	}

	function shutdown() {
		running = false;
		for (let id in cluster.workers) {
			if (cluster.workers[id]) {
				cluster.workers[id].process.kill();
			}
		}
		setTimeout(forceKill, opts.grace).unref();
	}

	function revive(worker, code, signal) {
		if (running && Date.now() < runUntil) {
			cluster.fork();
		}
	}

	function forceKill() {
		for (let id in cluster.workers) {
			if (cluster.workers[id]) {
				cluster.workers[id].kill();
			}
		}
		process.exit();
	}
}

module.exports = manageWorkers;
