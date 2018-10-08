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
    } else if (f == '__________network__________') { //@FUNC@ {}
    } else if (f == 'port_list') { //@FUNC@ {"description":"Listing port maps of instance."}
        select_instance_auto((e,ins)=>{
            g.port_list(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    for (let k in res) {
                        print(` TCP: ${res[k].port}`);
                    }
                    print('');
                }
            });
        });
    } else if (f == 'open_port') { //@FUNC@ {"description":"Register port map."}
        select_instance_auto((e,ins)=>{
            ins.port = ask('Open port > ');
            print('');
            g.open_port(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    g.port_list(ins,(e,res)=>{
                        if (e) printe(e);
                        else {
                            for (let k in res) {
                                print(` TCP: ${res[k].port}`);
                            }
                            print('')
                        }
                    });
                }
            });
        });

    } else if (f == 'close_port') { //@FUNC@ {"description":"Delete port map."}
        select_instance_auto((e,ins)=>{
            ins.port = ask('Close port > ');
            print('');
            g.close_port(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    g.port_list(ins,(e,res)=>{
                        if (e) printe(e);
                        else {
                            for (let k in res) {
                                print(` TCP: ${res[k].port}`);
                            }
                            print('')
                        }
                    });
                }
            });
        });

    } else if (f == 'network_description') { //@FUNC@ {"description":"Get a network information of instance."}
        select_instance_auto((e,ins)=>{
            g.network_description(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    print(` tag: ${res.instance_status.tag}`);
                    print('');
                    print(`  ${PL("private_ipv4:",20)} ${res.instance_status.private_ipv4}`);
                    print(`  ${PL("global_ipv4:",20)} ${res.instance_status.global_ipv4}`);
                    print(`  ${PL("global_ipv6:",20)} ${res.instance_status.global_ipv6}`);
                    print('');
                    print(`  ${PL("bytes_received:",20)} ${PL(res.instance_status.bytes_received/1024/1024/1024,10)}GB`);
                    print(`  ${PL("bytes_sent:",20)} ${PL(res.instance_status.bytes_sent/1024/1024/1024 ,10)}GB`);
                    print('');
                    print(`  ${PL("packets_received:",20)} ${res.instance_status.packets_received}`);
                    print(`  ${PL("packets_sent:",20)} ${res.instance_status.packets_sent}`);
                    print('');
                    print(`  ${PL("root_storage_usage:",20)} ${PL(res.instance_status.root_storage_usage/1024/1024/1024,10)}GB`);

                    print('');
                    for (let k in res.port_list) {
                        print(`   tcp:  ${res.port_list[k].port}`);
                    }
                    print('');
                }
            });
        });
    } else if (f == 'renew_ipv4') { //@FUNC@ {"description":"Assign a new IPv4."}
        select_instance((e,ins)=>{
            print('');
            g.renew_ipv4(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    instance_list();
                }
            });
        });
    } else if (f == 'refresh_ipv4') { //@FUNC@ {"description":"Refresh IPv4 map of instance."}
        select_instance((e,ins)=>{
            print('');
            g.refresh_ipv4(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    instance_list();
                }
            });
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
  { key: '__________network__________',
  value: { name: '__________network__________' } }, 
  { key: 'port_list',
  value: 
   { description: 'Listing port maps of instance.',
     name: 'port_list' } }, 
  { key: 'open_port',
  value: { description: 'Register port map.', name: 'open_port' } }, 
  { key: 'close_port',
  value: { description: 'Delete port map.', name: 'close_port' } }, 
  { key: 'network_description',
  value: 
   { description: 'Get a network information of instance.',
     name: 'network_description' } }, 
  { key: 'renew_ipv4',
  value: { description: 'Assign a new IPv4.', name: 'renew_ipv4' } }, 
  { key: 'refresh_ipv4',
  value: 
   { description: 'Refresh IPv4 map of instance.',
     name: 'refresh_ipv4' } }, 
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}

