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
    } else if (f == '____________image____________') {  //@FUNC@ {"administrator":false}
    } else if (f == 'images') { //@FUNC@ {"description":"Listing default OS images."}
        g.image_list((e,res)=>{
            if (e) printe(e);
            else { plot_images(res); }
        });
    } else if (f == 'registered_images') { //@FUNC@ {"description":"Listing all user defined OS images."}
        g.registered_image_list((e,res)=>{
            if (e) printe(e);
            else { plot_images(res); }
        });
    } else if (f == 'create_image') { //@FUNC@ {"description":"Adding an user defined OS image."}
        select_instance_auto((e,ins)=>{
            if (e) printe(e);
            else {
                ins.image_name = ask(`Image name > `);
                g.create_image(ins,(e,res)=>{
                    if (e) printe(e);
                    else { g.image_list((e,res)=>{ if (e) printe(e); else { plot_images(res); } }); }
                });
            }
        });
    } else if (f == 'delete_image') { //@FUNC@ {"description":"Deleting an OS image."}
        g.registered_image_list((e,res)=>{
            if (e) printe(e);
            else {
                plot_images(res);
                let n = ask(`Delete > `);
                let img = res[n];
                g.delete_image(img,(e,res)=>{
                    if (e) printe(e);
                    else { g.image_list((e,res)=>{ if (e) printe(e); else { plot_images(res); } }); }
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
  { key: '____________image____________',
  value: { administrator: false, name: '____________image____________' } }, 
  { key: 'images',
  value: { description: 'Listing default OS images.', name: 'images' } }, 
  { key: 'registered_images',
  value: 
   { description: 'Listing all user defined OS images.',
     name: 'registered_images' } }, 
  { key: 'create_image',
  value: 
   { description: 'Adding an user defined OS image.',
     name: 'create_image' } }, 
  { key: 'delete_image',
  value: { description: 'Deleting an OS image.', name: 'delete_image' } }, 
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}

