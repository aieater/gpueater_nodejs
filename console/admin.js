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
    } else if (f == '__________administrator__________') {  //@FUNC@ {"administrator":true}
    } else if (f == 'compute_nodes') {  //@FUNC@ {"description":"Listing only computing nodes.","administrator":true}
        node_login(1,'C');
    } else if (f == 'proxy_nodes') {  //@FUNC@ {"description":"Listing only proxy nodes.","administrator":true}
        node_login(3,'P');
    } else if (f == 'front_nodes') {  //@FUNC@ {"description":"Listing only front nodes.","administrator":true}
        node_login(0,'F');
    } else if (f == 'nodes') {  //@FUNC@ {"description":"Listing all nodes.","administrator":true}
        g.machine_resource_list_for_admin((e,res)=>{
            if (e) printe(e);
            else {
                let index = 0;
                let clist = [];
                for (let k in res) {
                    let m = res[k];
                    let alive = m.elapsed_time > 60 ? 'DEAD' : 'ALIVE';
                    let N = '';
                    N = m.node_type == 0 ? 'F' : N;
                    N = m.node_type == 1 ? 'C' : N;
                    N = m.node_type == 3 ? 'P' : N;
                    N = m.node_type == 5 ? 'M' : N;
                    N = m.node_type == 6 ? 'J' : N;
                    print(`${PR(index++,2)} : ${N} : ${PL(alive,5)} : ${PR(m.server_label,22)} : ssh ${m.sshd_user}@${m.network_ipv6?m.network_ipv6:m.network_ipv4} -p ${m.sshd_port} -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10`);
                    clist.push(m);
                }
                let n = ask(`Login > `);
                let mm = clist[n];
                print({privateKey:path.join(HOME,'.ssh',`brain_master_key.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.network_ipv6?mm.network_ipv6:mm.network_ipv4});
                ssh2_console({privateKey:path.join(HOME,'.ssh',`brain_master_key.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.network_ipv6?mm.network_ipv6:mm.network_ipv4});
            }
        });
    } else if (f == 'instances_for_admin') { //@FUNC@ {"description":"Listing all instances.","administrator":true}
    } else if (f == 'products_for_admin') { //@FUNC@ {"description":"Listing all on-demand products.","administrator":true}
        products_for_admin((e,res)=>{
            if (e) printe(e);
            else {
                display(`Products`,res.product_list);
            }
        });
    } else if (f == 'launch_as_admin') { //@FUNC@ {"description":"Force launch an instance.","administrator":true}
        products_for_admin((e,res)=>{
            display(`Products`,res.product_list);
            let n = 0;
            print(``)
            n = ask(`Product > `);
            let p = res.product_list[n];
            if (!p) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
            if (p.pool.length == 0) { printe(` Error: "Out of stock" => "${p.view.trim()}"`); process.exit(9); }
            print(``)
            selected(p);
            print(``)
            print(``)

            g.machine_resource_list_for_admin((e,res2)=>{
                let index = 0;
                let clist = [];
                for (let k in res2) {
                    let m = res2[k];
                    if (m.node_type == 1) {
                        let alive = m.elapsed_time > 60 ? 'DEAD' : 'ALIVE';
                        if (m.from_mq) {
                            let dv = (m.from_mq.device_info && m.from_mq.device_info.devices[0] && m.from_mq.device_info.devices[0].name) ? m.from_mq.device_info.devices[0].name : "CPU";
                            print(`${PR(index++,2)} : ${PL(alive,5)} : ${PR(m.server_label,22)} : ${dv}`);
                            clist.push(m);
                        }
                    }
                }
                n = ask(`MachineResource > `);
                let target = clist[n];
                if (!target) for (let v of clist) { if (v.server_label == n) {target = v;break;} }
                if (!target) { printe(` Error: "Invalid number" => "${n}"`);process.exit(9); }
                print(``);
                print(`${target.server_label} => ${target.unique_id}`)



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
                g.launch_as_admin({machine_resource_id:target.unique_id,product_id:p.id,image:img.alias,ssh_key_id:ssh_key.id,tag:tag},(e,res)=>{
                    if (e) { printe(e); }
                    else { print(res); }
                    clearInterval(tm);
                });
            });



        });
    } else if (f == 'login_multi_node') {  //@FUNC@ {"description":"Multiple login to machine resources.","administrator":true}
        g.machine_resource_list_for_admin((e,s)=>{
            print(``);
            let ntypes = {'0':'front','1':'compute','3':'proxy','9':'all'};
            for (let k in ntypes) { print(`${k} : ${ntypes[k]}`); }
            let n = ask(`NodeType > `);
            print(``);
            let target = ntypes[n];
            if (!target) for (let k in s) { if (s[k].node_type == n) { ins = s[k];break;}}
            if (!target) { printe(` Error: "Invalid number" => "${n}"`);process.exit(9); }
            print(``);


            let st = "#@@GEN@@#\n";
            let index = 0;
            let cmd = "csshX ";
            for (let k in s) {
                let m = s[k];
                if (m.node_type == 1) {
                    cmd += ` _cc_${index}`;
                    st += `Host _cc_${index}\n`;
                    st += `HostName ${m.network_ipv6||m.network_ipv4}\n`;
                    st += `User ${m.sshd_user}\n`;
                    st += `Port ${m.sshd_port}\n`;
                    st += `IdentityFile ~/.ssh/brain_master_key.pem\n`;
                    st += `ServerAliveInterval 15\n`;
                    st += `\n`;
                    index++;
                }
            }
            let cnf = fs.readFileSync(HOME+"/.ssh/config").toString();
            cnf = cnf.split("#@@GEN@@#")[0];
            cnf += st;
            fs.writeFileSync(HOME+"/.ssh/config",cnf);
            console.dir(cmd);
            execSync(cmd);
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
  { key: '__________administrator__________',
  value: 
   { administrator: true,
     name: '__________administrator__________' } }, 
  { key: 'compute_nodes',
  value: 
   { description: 'Listing only computing nodes.',
     administrator: true,
     name: 'compute_nodes' } }, 
  { key: 'proxy_nodes',
  value: 
   { description: 'Listing only proxy nodes.',
     administrator: true,
     name: 'proxy_nodes' } }, 
  { key: 'front_nodes',
  value: 
   { description: 'Listing only front nodes.',
     administrator: true,
     name: 'front_nodes' } }, 
  { key: 'nodes',
  value: 
   { description: 'Listing all nodes.',
     administrator: true,
     name: 'nodes' } }, 
  { key: 'instances_for_admin',
  value: 
   { description: 'Listing all instances.',
     administrator: true,
     name: 'instances_for_admin' } }, 
  { key: 'products_for_admin',
  value: 
   { description: 'Listing all on-demand products.',
     administrator: true,
     name: 'products_for_admin' } }, 
  { key: 'launch_as_admin',
  value: 
   { description: 'Force launch an instance.',
     administrator: true,
     name: 'launch_as_admin' } }, 
  { key: 'login_multi_node',
  value: 
   { description: 'Multiple login to machine resources.',
     administrator: true,
     name: 'login_multi_node' } }, 
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}

