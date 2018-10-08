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
    } else if (f == '__________extensions__________') { //@FUNC@ {}
    } else if (f == 'login') { //@FUNC@ {"description":"Login to instance."}
        instance_list((e,res)=>{
            if (e) printe(e);
            else {
                if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}
                let n = 0;
                if (res.length != 1) { n = ask(`Login > `); }

                let ins = res[n];
                if (!ins) for (let v of res) { if (v.tag == n) { ins = v;break;}}
                ssh2_console({privateKey:path.join(HOME,'.ssh',`${ins.ssh_key_file_name}.pem`),port:ins.sshd_port,user:ins.sshd_user,host:ins.ipv4});
            }
        });
    } else if (f == 'get') { //@FUNC@ {"description":"Get a file from host."}
        let second = argv.shift();
        if (second) {
            print(` Path => "${second}"`);
            print(``);
            let source = second;
            let dest = argv.shift();
            if (!dest) dest = ".";
            instance_list((e,res)=>{
                if (e) printe(e);
                else {
                    if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}
                    print(``);
                    let n = 0;
                    if (res.length != 1) {
                        n = ask(`Which instance? > `);
                    }
                    print(``);
                    let ins = res[n];
                    if (!ins) { printe(` Error: "Invalid instance number" => "${n}"`);process.exit(9); }
                    let cmd = `scp -i ~/.ssh/${ins.ssh_key_file_name}.pem -P ${ins.sshd_port} -r ${ins.sshd_user}@${ins.ipv4}:${source} ${dest} \n`;
                    print(``);
                    print(execSync(cmd).toString());
                    print(`remote: "${source}" => local: "${dest}"`);
                    print(``);
                }
            });

        } else {
            print(`Error: Invalid arguments`)
            print(`[Command] get [path]`)
        }
    } else if (f == 'put') { //@FUNC@ {"description":"Put a file to host."}
        let second = argv.shift();
        if (second) {
            print(` Path => "${second}"`);
            print(``);
            let source = second;
            let dest = argv.shift();
            if (!dest) dest = ".";
            instance_list((e,res)=>{
                if (e) printe(e);
                else {
                    if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}
                    print(``);
                    let n = 0;
                    if (res.length != 1) {
                        n = ask(`Which instance? > `);
                    }
                    print(``);
                    let ins = res[n];
                    if (!ins) { printe(` Error: "Invalid instance number" => "${n}"`);process.exit(9); }
                    let cmd = `scp -i ~/.ssh/${ins.ssh_key_file_name}.pem -P ${ins.sshd_port} -r ${source} ${ins.sshd_user}@${ins.ipv4}:${dest} \n`;
                    print(``);
                    print(execSync(cmd).toString());
                    print(`local: "${source}" => remote: "${dest}"`);
                    print(``);
                }
            });

        } else {
            print(`Error: Invalid arguments`)
            print(`[Command] put [path]`)
        }
    } else if (f == 'cmd') { //@FUNC@ {"description":"Do any command on instance."}
        select_instance_auto((e,ins)=>{
            let icmd = argv.length > 0 ? argv.join(" ") : ask(" Command > ");
            let cmd = `ssh ${ins.sshd_user}@${ins.ipv4} -p ${ins.sshd_port} -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10 '${icmd}'\n`;
            print(``);
            print(execSync(cmd).toString());
        });
    } else if (f == 'ls') { //@FUNC@ {"description":"File list on remote."}
        let second = argv.shift();
        if (!second) second = "~/";
        if (second) {
            print(` Source path => "${second}"`);
            print(``);
            let dpath = second;

            instance_list((e,res)=>{
                if (e) printe(e);
                else {
                    if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}
                    print(``);
                    let n = 0;
                    if (res.length != 1) {
                        n = ask(`Which instance? > `);
                    }
                    print(``);
                    let ins = res[n];
                    if (!ins) { printe(` Error: "Invalid instance number" => "${n}"`);process.exit(9); }

                    let cmd = `ssh ${ins.sshd_user}@${ins.ipv4} -p ${ins.sshd_port} -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10 'ls -la ${dpath}'\n`;
                    print(``);
                    print(execSync(cmd).toString());
                }
            });

        } else {
            print(`Error: Invalid arguments`)
            print(`[Command] ls [Path]`)
        }
    } else if (f == 'sync') { //@FUNC@ {"description":"Synchronize files via rsync."}
    } else if (f == 'tunnel') { //@FUNC@ {"description":"Port forwarding local to remote."}
        instance_list((e,res)=>{
            if (e) printe(e);
            else {
                print(``);
                let n = 0;
                if (res.length != 1) {
                    n = ask(`Which instance? > `);
                }
                print(``);
                let ins = res[n];
                if (!ins) { printe(` Error: "Invalid instance number" => "${n}"`);process.exit(9); }

                let port = ask(`Tunnel port > `);
                let mm = ins;
                let param = {privateKey:path.join(HOME,'.ssh',`${ins.ssh_key_file_name}.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.ipv4?mm.ipv4:mm.ipv6,tunnel_port:port};
                print(param);
                tunnel(param);
            }
        });
    } else if (f == 'jupyter') { //@FUNC@ {"description":"Start jupyter and port forward."}
        select_instance_auto((e,ins)=>{
            let mm = ins;
            let param = {privateKey:path.join(HOME,'.ssh',`${ins.ssh_key_file_name}.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.ipv4?mm.ipv4:mm.ipv6};
            param.initial_command = "jupyter notebook --allow-root\n";
            let buf = "";
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
        });
    } else if (f == 'jupyter_as_admin') { //@FUNC@ {"description":"Start jupyter and port forward.","administrator":true}

        g.machine_resource_list_for_admin((e,res)=>{
            if (e) printe(e);
            else {
                if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}

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
                if (!ins) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }

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

    } else if (f == 'version') { //@FUNC@ {"description":"Version of client."}
        /*@@VERSION_START@@*/print("07/27/2018 20:59")/*@@VERSION_END@@*/
    } else if (f == 'help') { //@FUNC@ {"description":"Display help."}
        display_help();
    } else if (f == 'upgrade') { //@FUNC@ {"description":"Upgrade API self."}
        request('http://install.aieater.com/setup_gpueater_client', function (e, res, body) {
            if (e) { printe(e); process.exit(9);}
            else {
                let script = path.join(TMP,"setup_gpueater_client");
                fs.writeFileSync(script,body)

                let p1 = spawn('bash', [script]);
                p1.stdout.on('data', (d) => {
                    util.print(d.toString());
                });
                p1.stderr.on('data', (d) => {
                    util.print(d.toString())
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
  { key: '__________extensions__________',
  value: { name: '__________extensions__________' } }, 
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
  { key: 'jupyter_as_admin',
  value: 
   { description: 'Start jupyter and port forward.',
     administrator: true,
     name: 'jupyter_as_admin' } }, 
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



