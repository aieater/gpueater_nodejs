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

    if (f == 'dummy') {
        // pass
    } else if (f == '__________administrator__________') {  //@FUNC@ {"administrator":true}
        // pass
    } else if (f == 'compute_nodes_for_admin') {  //@FUNC@ {"description":"Listing only computing nodes.","administrator":true}
        node_login(1,'C');
    } else if (f == 'proxy_nodes_for_admin') {  //@FUNC@ {"description":"Listing only proxy nodes.","administrator":true}
        node_login(3,'P');
    } else if (f == 'front_nodes_for_admin') {  //@FUNC@ {"description":"Listing only front nodes.","administrator":true}
        node_login(0,'F');
    } else if (f == 'nodes_for_admin') {  //@FUNC@ {"description":"Listing all nodes.","administrator":true}
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
    } else if (f == 'mlogin_for_admin') {  //@FUNC@ {"description":"Multiple login to machine resources.","administrator":true}
        g.machine_resource_list_for_admin((e,s)=>{
            print(``);
            let ntypes = {0:'front',1:'compute',3:'proxy',9:'all'};
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

    } else if (f == 'images_for_admin') { //@FUNC@ {"description":"Listing default all OS images.","administrator":true, "hide":true}
        g.image_list_for_admin((e,res)=>{
            if (e) printe(e);
            else { plot_images(res); }
        });
    } else if (f == 'create_image_for_admin') { //@FUNC@ {"description":".","administrator":true, "hide":true}
        instance_list((e,res)=>{
            if (e) printe(e);
            else {
                let n = ask(`Source instance > `);
                let ins = res[n];
                if (!ins) { printe(` Error: "Invalid number" => "${n}"`);process.exit(9); }
                ins.image_name = ask(`Image name > `);
                ins.distribute_flag = ask(`Distribute (y/n) > `).toString().toLowerCase() == "y";
                if (ins.distribute_flag) {
                    ins.publish_flag = ask(`Publish (y/n) > `).toString().toLowerCase() == "y";
                } else {
                    ins.publish_flag = false;
                }

                print("Creating....")
                let tm = setInterval(()=>{print(".")},3000);
                g.create_image_for_admin(ins,(e,res)=>{
                    clearTimer(tm);
                    if (e) printe(e);
                    else { g.image_list((e,res)=>{ if (e) printe(e); else {
                        plot_images(res);
                        if (ins.publish_flag) {
                            print("The published image is stil not completed.")
                            print("It will take a few hours to done.")
                        }
                    } });}
                });
            }
        });
    } else if (f == 'images_on_host_for_admin') { //@FUNC@ {"description":".","administrator":true, "hide":true}
        g.image_list_on_machine_resource_for_admin(ins,(e,res)=>{
            if (e) printe(e);
            else {
                plot_images(res);
            }
        });
    } else if (f == 'distribute_image_for_admin') { //@FUNC@ {"description":".","administrator":true, "hide":true}
        g.distribute_image_for_admin(ins,(e,res)=>{
            if (e) printe(e);
            else {
                plot_images(res);
                let n = ask(`Publish > `);
                let img = res[n];
                g.delete_image(img,(e,res)=>{
                    if (e) printe(e);
                    else { g.image_list((e,res)=>{ if (e) printe(e); else { plot_images(res); } }); }
                });
            }
        });
    } else if (f == 'publish_image') { //@FUNC@ {"description":"Implementing.","administrator":true, "hide":true}
        g.image_list((e,res)=>{
            if (e) printe(e);
            else {
                plot_images(res);
                let n = ask(`Publish > `);
                let img = res[n];
                g.delete_image(img,(e,res)=>{
                    if (e) printe(e);
                    else { g.image_list((e,res)=>{ if (e) printe(e); else { plot_images(res); } }); }
                });
            }
        });

    } else if (f == 'mflags') { // @FUNC@ {"description":"Flag management.","administrator":true, "hide":true}
        let NTS={0:'F',1:'C',3:'P',5:'M',6:'J',9:'S'};
        let RESET="\x1b[0m";let RED="\x1b[31m";let GREEN="\x1b[32m";
        let STRIKE=["\x1b[93m",""];
        let MARK=[`${RED}(~_~)${RESET}`,`${GREEN}(@A@)${RESET}`]; let DS='['; let DE=']';
        let MARK2=[`${RED}(;´༎ຶД༎ຶ\`)${RESET}`,`${GREEN}ᕙ(⇀‸↼‶)ᕗ${RESET}`];

        function mflag_list(params={display:true},func) {
            g.machine_resource_list_for_admin((e,res)=>{
                if (e) {func(e);}
                else {
                    if (res.length == 0) { printe(`There is no resources.\n`);process.exit(9);}
                    let index = 0;

                    let tbl = {};
                    for (let k in res) {
                        let m = res[k];
                        if (!tbl[m.node_type]) tbl[m.node_type] = [];
                        tbl[m.node_type].push(m);
                    }
                    if (params.display) print(`-----------------------------------------------------------------------------------------------------------------------`);
                    let slist = [];
                    for (let j in tbl) {
                        let res = tbl[j];
                        for (let k in res) {
                            let m = res[k];
                            slist.push(m);
                            if (params.display) print(`${PR(index++,2)} ${PR(m.server_label,25)}: ${PR(MARK2[m.elapsed_time<5*60?1:0],10)} NT(${NTS[m.node_type]?NTS[m.node_type]:m.node_type}) : Active${DS}${MARK[m.active]}${DE} : SP${DS}${MARK[m.special_node]}${DE} : Buf${DS}${MARK[m.buffer_flag]}${DE} : Subsc${DS}${MARK[m.subscription_flag]}${DE} : Dev${DS}${MARK[m.development_flag]}${DE} : Cry${DS}${MARK[m.managed_mining_flag]}${DE} : ${STRIKE[m.special_node]}${m.device01?m.device01:''}${RESET}`);
                        }
                        if (params.display) print(`-----------------------------------------------------------------------------------------------------------------------`);
                    }
                    func(null,slist);
                }
            });
        }
        mflag_list({display:true},(e,slist)=>{
            if (e) printe(e);
            else {
                let n = ask(` Select a host > `);
                if (!slist[n]) { printe(`Invalid number.\n`);process.exit(9);}
                let m = slist[n];
                print(` Selected => ${m.server_label}`);
                let flags = ['active','special_node','buffer_flag','subscription_flag','development_flag','managed_mining_flag', 'delete'];
                let index = 0;
                print(` Status : ${PR(MARK2[m.elapsed_time<5*60?1:0],10)}`);
                for (let k in flags) { print(`${PR(index++,2)} : ${PL(flags[k],20)} : ${MARK[m[flags[k]]]==null?"":MARK[m[flags[k]]]}`);}
                n = ask(`Which flag > `);
                if (!flags[n]) { printe(`Invalid number.\n`);process.exit(9);}
                if (flags[n] == 'delete') {
                    console.dir(m);
                    g.delete_machine_resource_for_admin({unique_id:m.unique_id},(e,s)=>{
                        if (e) printe(e);
                        else {
                            print(`Deleted ${util.inspect(s)}`);
                        }
                    });
                }  else {
                    m[flags[n]] = m[flags[n]] ? 0 : 1;
                    let bk_m = m;
                    g.update_machine_resource_flags(m,(e,res)=>{
                        if (e) printe(e);
                        mflag_list({display:false},(e,slist)=>{
                            for (let k in slist) {
                                let m = slist[k];
                                if (bk_m.unique_id == m.unique_id) {
                                    print(`${PR(m.server_label,25)}: ${PR(MARK2[m.elapsed_time<5*60?1:0],10)} NT(${NTS[m.node_type]?NTS[m.node_type]:m.node_type}) : Active${DS}${MARK[m.active]}${DE} : SP${DS}${MARK[m.special_node]}${DE} : Buf${DS}${MARK[m.buffer_flag]}${DE} : Subsc${DS}${MARK[m.subscription_flag]}${DE} : Dev${DS}${MARK[m.development_flag]}${DE} : Cry${DS}${MARK[m.managed_mining_flag]}${DE} : ${STRIKE[m.special_node]}${m.device01?m.device01:''}${RESET}`);
                                    break;
                                }
                            }
                        });
                    });
                }
            }
        });
    } else if (f == 'change_mflags') { //@FUNC@ {"description":"Change flag.","administrator":true, "hide":true}
        g.machine_resource_list_for_admin((e,res)=>{
            if (e) printe(e);
            else {
                if (res.length == 0) { printe(`There is no resources.\n`);process.exit(9);}
            }
        });
    } else if (f == 'jupyter_as_admin') { //@FUNC@ {"description":"For latest GPU driver and deep learning test.","administrator":true}
        g.machine_resource_list_for_admin((e,res)=>{
            if (e) printe(e);
            else {
                if (res.length == 0) { printe(`There is no resources.\n`);process.exit(9);}

                let index = 0;
                let clist = [];
                let node_type_display = 1;
                for (let k in res) {
                    let m = res[k];
                    if (m.node_type == 1) {
                        let alive = m.elapsed_time > 60 ? 'DEAD' : 'ALIVE';
                        print(`${PR(index++,2)} : ${node_type_display} : ${PL(alive,5)} : ${PR(m.server_label,22)} : ssh ${m.sshd_user}@${m.network_ipv6?m.network_ipv6:m.network_ipv4} -p ${m.sshd_port} -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10`);
                        clist.push(m);
                    }
                }


                let arg = argv.shift();
                let n = null;
                let ins = null;
                if (arg) {
                    for (let k in clist) {
                        if (clist[k].tag == arg) { ins = clist[k];break;}
                    }
                } else {
                    if (argv.length == 0 && clist.length == 1) {
                        ins = clist[0];
                    } else {
                        n = ask(`Select instance > `);
                        ins = clist[n];
                    }
                }
                if (!ins) { printe(` Error: Invalid item => "${n}"`);process.exit(9); }

                let mm = ins;
                let param = {privateKey:path.join(HOME,'.ssh',`brain_master_key.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.network_ipv6?mm.network_ipv6:mm.network_ipv4};
                param.initial_command = "jupyter notebook --allow-root\n";
                let buf = "";
                print(`ssh ${param.user}@${param.host} -p ${param.port} -i "${param.privateKey}" -o ServerAliveInterval=10`);

                param.on_data = (data)=>{
                    buf += data;
                    let sp = buf.split("\n");
                    buf = sp.pop();
                    for (let k in sp) {
                        let line = sp[k];
                        if (line.indexOf("http://localhost:")>=0) {
                            let port = line.split("http://localhost:")[1].split("/")[0];
                            param.tunnel_port = 8888;
                            param.on_opened = ()=>{ execSync(`open ${line}`) };
                            tunnel(param);
                            break;
                        }
                    }
                };
                param.exit_key = '\u0003';
                ssh2_console(param);
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
  { key: '__________administrator__________',
  value:
   { administrator: true,
     name: '__________administrator__________' } },
  { key: 'compute_nodes_for_admin',
  value:
   { description: 'Listing only computing nodes.',
     administrator: true,
     name: 'compute_nodes_for_admin' } },
  { key: 'proxy_nodes_for_admin',
  value:
   { description: 'Listing only proxy nodes.',
     administrator: true,
     name: 'proxy_nodes_for_admin' } },
  { key: 'front_nodes_for_admin',
  value:
   { description: 'Listing only front nodes.',
     administrator: true,
     name: 'front_nodes_for_admin' } },
  { key: 'nodes_for_admin',
  value:
   { description: 'Listing all nodes.',
     administrator: true,
     name: 'nodes_for_admin' } },
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
  { key: 'mlogin_for_admin',
  value:
   { description: 'Multiple login to machine resources.',
     administrator: true,
     name: 'mlogin_for_admin' } },
  { key: 'images_for_admin',
  value:
   { description: 'Listing default all OS images.',
     administrator: true,
     hide: true,
     name: 'images_for_admin' } },
  { key: 'create_image_for_admin',
  value:
   { description: '.',
     administrator: true,
     hide: true,
     name: 'create_image_for_admin' } },
  { key: 'images_on_host_for_admin',
  value:
   { description: '.',
     administrator: true,
     hide: true,
     name: 'images_on_host_for_admin' } },
  { key: 'distribute_image_for_admin',
  value:
   { description: '.',
     administrator: true,
     hide: true,
     name: 'distribute_image_for_admin' } },
  { key: 'publish_image',
  value:
   { description: 'Implementing.',
     administrator: true,
     hide: true,
     name: 'publish_image' } },
  { key: 'mflags',
  value:
   { description: 'Flag management.',
     administrator: true,
     hide: true,
     name: 'mflags' } },
  { key: 'change_mflags',
  value:
   { description: 'Change flag.',
     administrator: true,
     hide: true,
     name: 'change_mflags' } },
  { key: 'jupyter_as_admin',
  value:
   { description: 'For latest GPU driver and deep learning test.',
     administrator: true,
     name: 'jupyter_as_admin' } },
];
/* @@ DESCRPTIONS @@ END */



module.exports = {
    do_action:do_action,
    descriptions:descriptions
}
