const BLACK   = '';
const RED     = '';
const GREEN   = '';
const YELLO   = '';
const BLUE   = '';
const MAGENTA   = '';
const CYAN    = '';
const WHITE   = '';
const RESET   = '';

function time() { return (new Date).getTime() / 1000.0; } function clone(s) { return JSON.parse(JSON.stringify(s)); }
const fs = require('fs');
const os = require('os');
const util = require('util');
const config = {};
const stage = process.env.NODE_ENV || config.stage;
const console_logger = { debug: (s) => { console.log(s); }, info: (s) => { console.log('\033[32m' + s + '\033[0m'); }, warn: (s) => { console.log('\033[31m' + s + '\033[0m'); }, notice: (s) => { console.log('\033[31m' + s + '\033[0m'); }, error: (s) => { console.error('\033[31m' + s + '\033[0m'); }, crit: (s) => { console.error('\033[31m' + s + '\033[0m'); }, alert: (s) => { console.error('\033[31m' + s + '\033[0m'); }, emerg: (s) => { console.error('\033[31m' + s + '\033[0m'); } };
var stblogger = { debug: (s) => { }, info: (s) => { }, warn: (s) => { }, notice: (s) => { }, error: (s) => { }, crit: (s) => { }, alert: (s) => { }, emerg: (s) => { } };
var clogger = stblogger;
var flogger = stblogger;
var logger = stblogger;
var DISPLAY_STACK = false;
const MAX_STACK = 50;
var latest_errors = []; function add_latest_errors(e){if(latest_errors.length>100){latest_errors.shift();}latest_errors.push(e);};
var latest_error_logger = { debug: (s) => { }, info: (s) => { }, warn: (s) => { }, notice: (s) => { }, error: (s) => { add_latest_errors(s); }, crit: (s) => { add_latest_errors(s); }, alert: (s) => { add_latest_errors(s); }, emerg: (s) => { add_latest_errors(s); } };
var memory_state = {}; function log_state(k, v) { if (v) memory_state[k] = v; else delete memory_state[k]; } function log_state_clear() { memory_state = {}; }
var stack_list = []; function stack_log(s) { if (MAX_STACK < stack_list.length) stack_list.shift(); stack_list.push("    - STACK: " + s); }
var log_level = 0; const log_level_t = { 'debug': 0, 'info': 1, 'warn': 2, 'notice': 3, 'error': 4, 'crit': 5, 'alert': 6, 'emerg': 7 };
var network_logger = null;
var file_logger = null;


function line_number(num = 0) {
	const original = Error.prepareStackTrace; Error.prepareStackTrace = function (error, structuredStackTrace) { return structuredStackTrace[num].getLineNumber(); }
	const error = {}; Error.captureStackTrace(error, line_number); const lineNumber = error.stack; Error.prepareStackTrace = original; return lineNumber;
}


function source_filename(num = 0) {
	const original = Error.prepareStackTrace;
	Error.prepareStackTrace = function (error, structuredStackTrace) { return structuredStackTrace[num].getFileName(); }
	const error = {};
	Error.captureStackTrace(error, source_filename);
	const ret = error.stack;
	Error.prepareStackTrace = original;
	return ret;
}

function source_line(num = 0) {
	const original = Error.prepareStackTrace;
	Error.prepareStackTrace = function (error, structuredStackTrace) { return structuredStackTrace[num].getLineNumber(); }
	const error = {};
	Error.captureStackTrace(error, source_line);
	const ret = error.stack;
	Error.prepareStackTrace = original;
	return parseInt(ret);
}
var source_table = {};
function source_from_stack(num = 0) {
	let l = source_line(num);
	let f = source_filename(num);
	let name = f.split("/").pop();
	if (source_table[name] == null) {
		source_table[name] = fs.readFileSync(f, 'utf8').split("\n");
	}
	let ll = source_table[name][parseInt(l) - 1];
	return `${name}(${l}):${ll}`;
}



function enable_console() { if(!(clogger===console_logger)){ clogger = console_logger; console.log(source_from_stack(2));console.log("\033[32m\tCONSOLE-LOG-OUTPUT: ENABLED\033[0m"); } }
function disable_console() { if(!(clogger===stblogger)){ clogger = stblogger; console.log(source_from_stack(2));console.log("\033[32m\tCONSOLE-LOG-OUTPUT: DISABLED\033[0m"); } }
function enable_local_log_file() { if(!(flogger===file_logger)){ flogger = file_logger; console.log(source_from_stack(2));console.log("\033[32m\tFILE-LOG-OUTPUT: ENABLED => log/app.log\033[0m"); } }
function disable_local_log_file() { if(!(flogger===stblogger)){ flogger = stblogger; console.log(source_from_stack(2));console.log("\033[32m\tFILE-LOG-OUTPUT: DISABLED\033[0m"); } }
function enable_backup() { if(!(logger===network_logger)){ logger = network_logger; console.log(source_from_stack(2));console.log("\033[32m\tAWS-S3-LOG-OUTPUT: ENABLED => s3://pegara/log/*\033[0m"); } }
function disable_backup() {if(!(logger===stblogger)){  logger = stblogger; console.log(source_from_stack(2));console.log("\033[32m\tAWS-S3-LOG-OUTPUT: DISABLED\033[0m"); } }



var G_log_prefix = "";

const tlog = function (s, t = 'debug', modname, ee) {
	let e = modname + "(" + ("   " + line_number(2)).substr(-4) + "): "; let c = ("                          " + e).substr(-20); let sp = ("" + s).split("\n");
	if (log_level > log_level_t[t]) { return; }
	let l_logger = logger[t];
	let l_clogger = clogger[t];
	let f_clogger = flogger[t];
	let l_elogger = latest_error_logger[t];
	if (ee) {
		let hd = s.slice(0, 15);
		if (DISPLAY_STACK) {
			let dlm = c + `"${hd}...:"` + "    - STACK: --------------------------------------------------------";
			l_logger(dlm);
			l_clogger(dlm);
			f_clogger(dlm);
			for (let i in stack_list) {
				let line = c + `"${hd}...:"` + stack_list[i];
				l_logger(line);
				l_clogger(line);
				f_clogger(line);
			}
			l_logger(dlm);
			l_clogger(dlm);
			f_clogger(dlm);
		}

		for (let k in memory_state) {
			let mmsp = util.inspect(memory_state[k], { depth: 20 }).split("\n");
			for (let kk in mmsp) {
				let line = c + `"${hd}...: MEMORY: ${k} => ${mmsp[kk]}"`;
				l_logger(line);
				l_clogger(line);
				f_clogger(line);
			}
		}

	}
	for (let k in sp) {
		let ss = G_log_prefix + c + sp[k];
		l_logger(ss);
		l_clogger(ss);
		f_clogger(ss);
		l_elogger(ss);
		stack_log(ss);
	}
};
function ULogger(modname) {
	this.MODNAME = modname;
	this.dir = function (s) { tlog(util.inspect(s, { depth: 4 }), 'debug', modname, false); };
	this.log = function (s) { tlog(s, 'debug', modname, false); };
	this.info = function (s) { tlog(s, 'info', modname, false); };
	this.notice = function (s) { tlog(util.inspect(s, { depth: 4 }), 'notice', modname, false); };
	this.warn = function (s) { tlog(util.inspect(s, { depth: 4 }), 'warn', modname, false); };
	this.err = function (s) { tlog(util.inspect(s, { depth: 20 }), 'error', modname, true); };
	this.crit = function (s) { tlog(util.inspect(s, { depth: 20 }), 'crit', modname, true); };
	this.alert = function (s) { tlog(util.inspect(s, { depth: 20 }), 'alert', modname, true); };
	this.emerg = function (s) { tlog(util.inspect(s, { depth: 20 }), 'emerg', modname, true); };
}
const u_logger = new ULogger(require('path').basename(__filename).replace('.js', ''));
const dir = u_logger.dir; const log = u_logger.log; const debug = u_logger.debug; const info = u_logger.info;
const notice = u_logger.notice; const warn = u_logger.warn; const err = u_logger.err; const crit = u_logger.crit; const alert = u_logger.alert; const emerg = u_logger.emerg;
{ let s = ` Load [ ${u_logger.MODNAME.replace('.js', '')} ] `; let slen = s.length; while (s.length < 100) { s = "@" + s + "@"; }; s = s.slice(0, 100); info(s); }

module.exports = {
	logger: ULogger,
	enable_console: enable_console,
	disable_console: disable_console,
	enable_backup: enable_backup,
	disable_backup: disable_backup,
	enable_local_log_file: enable_local_log_file,
	disable_local_log_file: disable_local_log_file,
	log_state: log_state,
	log_state_clear: log_state_clear,
	source_from_stack: source_from_stack,
	latest_errors:latest_errors,
	stack_list:stack_list,
	set_log_prefix:function(s) { G_log_prefix = s; },
	environments: function () {
		return {
			memory_state: memory_state,
			stage: stage,
			config: process.env.NODE_CONFIG ? process.env.NODE_CONFIG : "./config.json",
			console_logger: clogger == console_logger,
			file_logger: flogger == file_logger,
			network_logger: logger == network_logger,
			front_host: process.env.NODE_FRONT_HOST,
			front_port: process.env.NODE_FRONT_PORT,
		};
	}
};
