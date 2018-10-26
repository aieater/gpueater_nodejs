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
var actions = [];
var argv = process.argv;
for (let k in common) { let v = common[k]; eval(`${k}=${v}`); }



function do_action(f) {
    if (f=="dummy") {
    } else if (f == '__________docker__________') { //@FUNC@ {}
    } else if (f == 'rocm_list') { //@FUNC@ {"description":"Listing rocm-docker images."}
        let rlist = execSync("curl -s http://install.aieater.com/rocm_docker_images").toString().split("\n");
        let index = 0;
        for (let v of rlist) {
            if (v.trim().length > 0) {
                print(`${index++} : ${v}`);
            }
        }
        let target = null;
        let n = ask(`Which docker image > `);
        target = rlist[n];
        if (!target) {
            for (let v of rlist) {
                if (n == v) {
                    target = v;
                    break;
                }
            }
        }
        if (target) {
            print(`docker run -it --device=/dev/kfd --device=/dev/dri ${target}`)
        }
    } else {
        return false;
    }
    return true;
}


if (require.main === module) {
    let lines = fs.readFileSync(__filename).toString().split("\n");
    let ret = "";
    let start = false;
    let descriptions = [];
    for (let line of lines) {
        let add = false;
        if (line.indexOf("@FUNC@") >= 0) {
            if (line.indexOf("//") >= 0) {
                let name = line.split("'")[1];
                let desc = JSON.parse(line.split("@FUNC@")[1]);
                desc.name = name;
                descriptions.push({key:name,value:desc});
            }
        }

        if (line.indexOf(" @@ DESCRPTIONS @@") >= 0) {
            if (line.indexOf("START") >= 0) {
                start = true;
                add = true;
            } else if (line.indexOf("END") >= 0) {
                start = false;
                add = true;
                let dstr = "const descriptions = [\n";
                for (let m of descriptions) {
                    dstr += `  ${util.inspect(m)}, \n`;
                }
                dstr += "];\n";
                ret += dstr;
            } else {
                add = true;
            }
        } else {
            if (start == false) {
                add = true;
            }
        }
        if (add) {
            ret += line + "\n";
        }
    }
    fs.writeFileSync(__filename,ret);
}

/* @@ DESCRPTIONS @@ START */
const descriptions = [
  { key: '__________extension__________',
  value: { name: '__________extension__________' } },
  { key: 'login',
  value: { description: 'Login to instance.', name: 'login' } },
  { key: 'get',
  value: { description: 'Get a file from host.', name: 'get' } },
  { key: 'put',
  value: { description: 'Put a file to host.', name: 'put' } },
  { key: 'cmd',
  value: { description: 'Do any command on instance.', name: 'cmd' } },
  { key: 'ls',
  value: { description: 'File list on remote.', name: 'ls' } },
  { key: 'sync',
  value: { description: 'Synchronize files via rsync.', name: 'sync' } },
  { key: 'tunnel',
  value:
   { description: 'Port forwarding local to remote.',
     name: 'tunnel' } },
  { key: 'jupyter',
  value:
   { description: 'Start jupyter and port forward.',
     name: 'jupyter' } },
  { key: 'version',
  value: { description: 'Version of client.', name: 'version' } },
  { key: 'help',
  value: { description: 'Display help.', name: 'help' } },
  { key: 'upgrade',
  value: { description: 'Upgrade API self.', name: 'upgrade' } },
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}
