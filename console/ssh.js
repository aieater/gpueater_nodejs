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
    } else if (f == '___________ssh_key___________') { //@FUNC@ {}
    } else if (f == 'ssh_keys') { //@FUNC@ {"description":"Listing registered SSH keys."}
        g.ssh_key_list((e,res)=>{
            if (e) printe(e);
            else { plot_ssh_keys(res); }
        });
    } else if (f == 'generate_ssh_key') { //@FUNC@ {"description":"Generating Key Pair."}
        g.generate_ssh_key((e,res)=>{
            if (e) printe(e);
            else {
                print('Private Key');
                print(res.private_key);
                print('Public Key');
                print(res.public_key);
            }
        });
    } else if (f == 'register_ssh_key') { //@FUNC@ {"description":"Registering an SSH key."}
    } else if (f == 'delete_ssh_key') { //@FUNC@ {"description":"Deleting an SSH key."}
        g.ssh_key_list((e,res)=>{
            if (e) printe(e);
            else {
                plot_ssh_keys(res);
                print('');
                let n = ask("Select SSH key > ");
                print('');
                let key = res[n];
                if (!key) { for (let v of res) { if (v.name == n) { key = v;break; } } }
                if (!key) { printe(` Error: "Invalid selected item." => "${n}"`);process.exit(9); }
                g.delete_ssh_key(key,(e,res)=>{
                    if (e) printe(e);
                    else {
                        g.ssh_key_list((e,res)=>{
                            if (e) printe(e);
                            else {
                                plot_ssh_keys(res);
                            }
                        });
                    }
                });
            }
        });
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
  { key: '___________ssh_key___________',
  value: { name: '___________ssh_key___________' } }, 
  { key: 'ssh_keys',
  value: 
   { description: 'Listing registered SSH keys.',
     name: 'ssh_keys' } }, 
  { key: 'generate_ssh_key',
  value: 
   { description: 'Generating Key Pair.',
     name: 'generate_ssh_key' } }, 
  { key: 'register_ssh_key',
  value: 
   { description: 'Registering an SSH key.',
     name: 'register_ssh_key' } }, 
  { key: 'delete_ssh_key',
  value: { description: 'Deleting an SSH key.', name: 'delete_ssh_key' } }, 
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}

