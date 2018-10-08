const gutil = require('./util'); const util = require('util');
const u_logger = new gutil.logger(require('path').basename(__filename).replace('.js', ''));
const dir = u_logger.dir; const log = u_logger.log; const debug = u_logger.debug; const info = u_logger.info;
const notice = u_logger.notice; const warn = u_logger.warn; const err = u_logger.err; const crit = u_logger.crit; const alert = u_logger.alert; const emerg = u_logger.emerg;
function time() { return (new Date).getTime() / 1000.0; } function clone(s) { return JSON.parse(JSON.stringify(s)); }
//if (require.main === module) { gutil.enable_console(); gutil.disable_backup(); }
{ let s = ` Load [ ${u_logger.MODNAME.replace('.js', '')} ] `; let slen = s.length; while (s.length < 100) { s = "@" + s + "@"; }; s = s.slice(0, 100); log(s); }



const fs = require('fs');
const os = require('os');
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const net = require('net');
const path = require('path');
const HOME = os.homedir();
const TMP = os.tmpdir();
const readlineSync = require('readline-sync');
const request = require('request');
const GPUEATER_ADMINISTRATOR = process.env.GPUEATER_ADMINISTRATOR;
const g = require('./gpueater');
const print = console.log;
const printe = console.error;

const common = require('./common');
var actions = [
	require('./ssh'),
	require('./image'),
	require('./instance'),
	require('./network'),
	require('./payment'),
	require('./extension'),
	require('./admin'),
];
for (let k in common) { let v = common[k]; eval(`${k}=${v}`); }


var argv = process.argv;
argv.shift()
argv.shift()
var f = argv.shift()

function main(f) {

	if (f) {
		let hit = false;
		for (let obj of actions) {
			if (obj.do_action(f)) {
				hit = true;
				break;
			}
		}
		if (!hit) {
			display_help();
			let actions = action_list();
			let n = ask(` Action > `);
			let action = null;
			if (isNaN(parseInt(n))) {
				for (let k in actions) { let v = actions[k]; if (v.name == n) { action = v;break; } }
			} else {
				for (let k in actions) { let v = actions[k]; if (v.index == n) { action = v;break; } }
			}
			print(``);
			if (!action) { printe(`Invalid action.`);process.exit(9); }
			print(``);
			main(action.name);
		}
	} else {
		display_help();
		let actions = action_list();
		let n = ask(` Action > `);
		let action = null;
		if (isNaN(parseInt(n))) {
			for (let k in actions) { let v = actions[k]; if (v.name == n) { action = v;break; } }
		} else {
			for (let k in actions) { let v = actions[k]; if (v.index == n) { action = v;break; } }
		}
		print(``);
		if (!action) { printe(`Invalid action.`);process.exit(9); }
		print(``);
		main(action.name);
	}
}


main(f);
