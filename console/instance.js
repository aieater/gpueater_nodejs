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
    } else if (f == '___________instance___________') { //@FUNC@ {}
    } else if (f == 'products') { //@FUNC@ {"description":"Listing on-demand products."}
        display_ondemand_list();
    } else if (f == 'instances') { //@FUNC@ {"description":"Listing launched on-demand instances."}
        instance_list();
    } else if (f == 'subscription_list') { //@FUNC@ {"description":"This API will be implemented on v2.0.","hide":true,"administrator":true}
        print(`Not supported yet.`);
    } else if (f == 'launch_subcription_instance') { //@FUNC@ {"description":"This API will be implemented on v2.0.","hide":true,"administrator":true}
        print(`Not supported yet.`);
    } else if (f == 'change_instance_tag') { //@FUNC@ {"description":"Change instance tag."}
        select_instance_auto((e,ins)=>{
            ins.tag = ask('Tag > ');
            print('');
            g.change_instance_tag(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    instance_list();
                }
            });
        });
    } else if (f == 'launch') { //@FUNC@ {"description":"Launch an on-demand instance."}
        ondemand_list((e,res)=>{
            display(`Products`,res.product_list);
            let n = 0;
            print(``)
            n = ask(`Product > `);
            let p = res.product_list[n];
            if (!p) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
            if (p.pool.length == 0) { printe(` Error: "Out of stock" => "${p.view.trim()}"`) }
            print(``)
            selected(p);
            print(``)
            print(``)
            display(`Images`,res.image_list);
            print(``)
            n = ask(`Image > `);
            let img = res.image_list[n];
            if (!img) { printe(` Error: "Invalid image number" => "${n}"`);process.exit(9); }
            print(``)
            selected(img);
            print(``)
            print(``)

            display(`SSH Keys`,res.ssh_key_list);
            print(``)
            n = ask(`SSH Key > `);
            let ssh_key = res.ssh_key_list[n];
            if (!ssh_key) { printe(` Error: "Invalid ssh key number" => "${n}"`);process.exit(9); }
            print(``)
            selected(ssh_key);
            print(``)
            print(``)
            let tag = ask(`Tag > `);
            print(``)
            print(`Launching...`)
            let tm = setInterval(()=>{print(".")},5000);
            g.launch_ondemand_instance({product_id:p.id,image:img.alias,ssh_key_id:ssh_key.id,tag:tag},(e,res)=>{
                if (e) { printe(e); }
                else { print(res); }
                clearInterval(tm);
            });

        });
    } else if (f == 'terminate') {  //@FUNC@ {"description":"Terminate an instance."}
        instance_list((e,res)=>{
            if (e) printe(e);
            else {
                if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}

                let n = ask(`Terminate > `);
                let ins = res[n];
                if (!ins) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
                g.terminate_instance(ins,(e,res)=>{
                    if (e) printe(e);
                    else print(res);
                });
            }
        });

    } else if (f == 'start') { //@FUNC@ {"description":"Start an instance."}
        select_instance((e,ins)=>{
            print('');
            g.start_instance(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    instance_list();
                }
            });
        });
    } else if (f == 'restart') { //@FUNC@ {"description":"Restart an instance."}
        select_instance((e,ins)=>{
            print('');
            g.restart_instance(ins,(e,res)=>{
                if (e) printe(e);
                else {
                    instance_list();
                }
            });
        });
    } else if (f == 'emergency_restart_instance') { //@FUNC@ {"description":"Force restart an instance."}
        select_instance((e,ins)=>{
            print('');
            g.emergency_restart_instance(ins,(e,res)=>{
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
  { key: '___________instance___________',
  value: { name: '___________instance___________' } }, 
  { key: 'products',
  value: { description: 'Listing on-demand products.', name: 'products' } }, 
  { key: 'instances',
  value: 
   { description: 'Listing launched on-demand instances.',
     name: 'instances' } }, 
  { key: 'subscription_list',
  value: 
   { description: 'This API will be implemented on v2.0.',
     hide: true,
     administrator: true,
     name: 'subscription_list' } }, 
  { key: 'launch_subcription_instance',
  value: 
   { description: 'This API will be implemented on v2.0.',
     hide: true,
     administrator: true,
     name: 'launch_subcription_instance' } }, 
  { key: 'change_instance_tag',
  value: 
   { description: 'Change instance tag.',
     name: 'change_instance_tag' } }, 
  { key: 'launch',
  value: { description: 'Launch an on-demand instance.', name: 'launch' } }, 
  { key: 'terminate',
  value: { description: 'Terminate an instance.', name: 'terminate' } }, 
  { key: 'start',
  value: { description: 'Start an instance.', name: 'start' } }, 
  { key: 'restart',
  value: { description: 'Restart an instance.', name: 'restart' } }, 
  { key: 'emergency_restart_instance',
  value: 
   { description: 'Force restart an instance.',
     name: 'emergency_restart_instance' } }, 
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}

