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


var argv = process.argv;

function display_help() {
	print('')
	print(`[Command] [Action] [Args...]`);
	print(`  `)
	print(`  Example`)
	print(`   > gpueater products`)
	print(`  `)
	let actions = action_list();
	print(``);
    print(actions);
	for (let k in actions) {
        let v = actions[k];
		if (GPUEATER_ADMINISTRATOR || v.administrator == false) {
			if (v.name.indexOf("____")==0) {
				print(` ${PR(v.index != null?v.index:"",2)}   ${PR(v.name,30)}`);
			} else {
				print(` ${PR(v.index != null?v.index:"",2)} : ${PR(v.name,30)} : ${PL(v.description,80).trim()}`);
			}
		}
	}
	print(``);
}

Date.prototype.full_time = function() {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();
  let hr = this.getHours();
  let mn = this.getMinutes();
  return [
          (mm>9 ? '' : '0') + mm,
	  "/",
          (dd>9 ? '' : '0') + dd,
	  "/",
		  this.getFullYear(),
	  " ",
          (hr>9 ? '' : '0') + hr,
	  ":",
          (mn>9 ? '' : '0') + mn,
         ].join('');
};


function charcount(str) {
  let len = 0;
  str = escape(str);
  for (let i=0;i<str.length;i++,len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

function PL(s,w,p=" ") {
	if (s == null) return "null";
	s = s + "";
	let ret = s;
	let slen = charcount(s);
	if (slen < w) {
		for (let i = slen;i<w;i++) {
			ret += p;
		}
	}
	return ret.slice(0,w);
}
function PR(s,w,p=" ") {
	if (s == null) return "null";
	s = s + "";
	let ret = s;
	let slen = charcount(s);
	if (slen < w) {
		for (let i = slen;i<w;i++) {
			ret = p + ret;
		}
	}
	return ret;
}



function ask(s) { let arg = argv.shift();if (arg) { print(` Arg => ${arg}`);return arg; } return readlineSync.question(s); }

function plot_images(datas, display = true) {
	if (display) print(`-----------------------------------------------------`);
	if (display) print(` ---- Images ----`);
	let index = 0;
	let ret = [];
	for (let k in datas) {
		let v = datas[k];
		ret.push(v);
		if (v.user_defined) {
			//fingerprint,name,alias,description,volume,created_at,status,progress,error_description
			function none(s){return s?s:"-";}
			v.view = ` ${index++}: ${PL(v.name,20)} : ${PL(v.status,10)} : ${PL(v.created_at,10)} : ${PL(none(v.progress),10)} : ${PL(none(v.error_description),20)}`;
		} else {
			v.view = ` ${index++}: ${PL(v.name,50)}`;
		}
		if (display) print(v.view);
	}
	return ret;
}
function plot_ssh_keys(datas, display = true) {
	if (display) print(`-----------------------------------------------------`);
	if (display) print(` ---- SSH Keys ----`);
	let index = 0;
	let ret = [];
	for (let k in datas) {
		let v = datas[k];
		ret.push(v);
		v.view = ` ${index++}: ${v.name}`;
		if (display) print(v.view);
	}
	return ret;
}

function plot_products(datas, display = true) {
	if (display) print(`-----------------------------------------------------`);
	if (display) print(` ---- Products ----`);
	let index = 0;
	let ret = [];
	let arr = [];
	for (let k in datas) {
		arr.push(datas[k]);
	}
	arr.sort((a,b)=>{
		if (a.name.split(".")[0] < b.name.split(".")[0]) return -1;
		if (a.name.split(".")[0] > b.name.split(".")[0]) return 1;
		if (a.price < b.price) return -1;
		if (a.price > b.price) return 1;
		if (a.memory < b.memory) return -1;
		if (a.memory > b.memory) return 1;
		if (a.cpu < b.cpu) return -1;
		if (a.cpu > b.cpu) return 1;
		if (a.root_storage < b.root_storage) return -1;
		if (a.root_storage > b.root_storage) return 1;
		if (a.name > b.name) return -1;
		if (a.name < b.name) return 1;

		return 0;
	});
	for (let k in arr) {
		let v = arr[k];
		ret.push(v);
		v.view =  ` ${PR(index++,2)}: ${PL(v.name,20)} InStock(${v.pool.length>0?"OK":"NG"}) CPU(${PR(v.cpu,2)})  MEM(${PR(v.memory,5)})MB  SSD(${PR(v.root_storage,4)})GB  ${PR("$"+v.price,7)}/h  ${PL(v.device_desc.replace(/\n/g," "),40).trim()}`;
		if (display) print(v.view);
	}
	return ret;
}

function plot_instances(datas, display = true) {
	if (display) print(`-----------------------------------------------------`);
	if (display) print(` ---- Instances ----`);
	let index = 0;
	let ret = [];
	datas.sort((a,b)=>{
		if (a.created_at < b.created_at) return -1;
		if (a.created_at > b.created_at) return -1;
		return 0;
	});
	for (let k in datas) {
		let v = datas[k];
		ret.push(v);
		v.view =  ` ${index++}: "${PL(v.tag,10)}" : ${PR(v.state,10)} : ${PR(v.product_name,10)} : CPU${PR(v.cpu,2)} : MEM${PR(v.memory,5)}MB : SSD${PR(v.root_storage,4)}GB : "${PL(v.device_desc,40).trim()}"\n    ${v.ssh_command}\n`;

		if (GPUEATER_ADMINISTRATOR) {
			// console.dir(v);
			v.view += `    ssh ${v.h_user}@${v.h_network_ipv6||v.h_network_ipv4} -p ${v.h_port} -i ~/.ssh/${v.h_key} -o ServerAliveInterval=10\n`;
		}
		if (display) print(v.view);
	}
	return ret;
}

function display(s,list) {
	print(`-----------------------------------------------------`);
	print(` ---- ${s} ----`);
	for (let k in list) {let v = list[k]; print(v.view); }
}

function display_ondemand_list(func) {
	g.ondemand_list((e,res)=>{
		if (e) { printe(e) }
		else {
			let image_list 		= plot_images(res.images);
			let ssh_key_list 	= plot_ssh_keys(res.ssh_keys);
			let product_list 	= plot_products(res.products);
			print(`-----------------------------------------------------`);
			if (func) func(null,{image_list:image_list,ssh_key_list:ssh_key_list,product_list:product_list});
		}
	});
}
function instance_list(func) {
	g.instance_list((e,res)=>{
		if (e) { printe(e) }
		else {
			plot_instances(res);
			print('')
			if (func) func(null, res);
		}
	});
}
function ondemand_list(func) {
	g.ondemand_list((e,res)=>{
		if (e) { printe(e) }
		else {
			let image_list 		= plot_images(res.images,false);
			let ssh_key_list 	= plot_ssh_keys(res.ssh_keys,false);
			let product_list 	= plot_products(res.products,false);
			if (func) func(null,{image_list:image_list,ssh_key_list:ssh_key_list,product_list:product_list});
		}
	});
}
function products_for_admin(func) {
	g.products_for_admin((e,res)=>{
		if (e) { printe(e) }
		else {
			let image_list 		= plot_images(res.images,false);
			let ssh_key_list 	= plot_ssh_keys(res.ssh_keys,false);
			let product_list 	= plot_products(res.products,false);
			if (func) func(null,{image_list:image_list,ssh_key_list:ssh_key_list,product_list:product_list});
		}
	});
}


function selected(v) { print(` Selected => '${v.view.split("\n")[0].trim()}'`); }
function select_instance(func) {
	instance_list((e,res)=>{
		if (e) printe(e);
		else {
			if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}
			let arg = argv.shift();
			let n = null;
			let ins = null;
			if (arg) {
				for (let k in res) {
					if (res[k].tag == arg) { ins = res[k];break;}
				}
			} else {
				n = ask(`Select instance > `);
				ins = res[n];
			}
			if (!ins) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
			print('');
			selected(ins);
			print('');
			func(null,ins);
		}
	});
}

function select_instance_auto(func) {
	instance_list((e,res)=>{
		if (e) printe(e);
		else {
			if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);}

			let arg = argv.shift();
			let n = null;
			let ins = null;
			if (arg) {
				for (let k in res) {
					if (res[k].tag == arg) { ins = res[k];break;}
				}
			} else {
				if (argv.length == 0 && res.length == 1) {
					ins = res[0];
				} else {
					n = ask(`Select instance > `);
					ins = res[n];
				}
			}
			if (!ins) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
			print('');
			selected(ins);
			print('');
			func(null,ins);
		}
	});
}

function ssh2_console(params) {
	const ssh2 = require('ssh2');
	let gs = null;
	const conn = new ssh2();
	conn.on('ready', function() {
	    conn.shell(function(err, stream) {
	      if (err) throw err;
	      stream.on('close', function() {
	        util.print('Stream :: close\n');
	        conn.end();
	        process.exit(1);
	      }).on('data', function(data) {
	        if (!gs) {
				gs = stream;
		  	    if (gs) gs.write(params.initial_command ? params.initial_command : '');
	        }
	        if (gs._writableState.sync == false) process.stdout.write(''+data);
			if (params.on_data) { params.on_data(''+data); }
	      }).stderr.on('data', function(data) {
	        util.print('STDERR: ' + data);
	        process.exit(1);
	    });
	  });
	}).connect({
	  host: params.host,
	  port: params.port,
	  privateKey:require('fs').readFileSync(params.privateKey),
	  keepaliveInterval:30*1000,
	  username: params.user,
	});

	let stdin = process.stdin;
	stdin.setRawMode( true );
	stdin.resume();
	stdin.setEncoding( 'utf8' );
	stdin.on( 'data', function( key ) {
		if (params.exit_key) {
	  	  if ( key === params.exit_key ) {
	  	    process.exit();
	  	  }
		}
		if (gs) gs.write('' + key);
	});
}

function tunnel(params){
	const Client = require('ssh2').Client;
	const conn = new Client();
	conn.on('ready', function() {
	  console.log('Tunneling :: ready');

	const server = net.createServer(function (socket) {
		const remote = new net.Socket();
		socket.bufferSize = 1 << 14;
		remote.bufferSize = 1 << 14;
		socket.setKeepAlive(true, 10 * 1000);
		remote.setKeepAlive(true, 10 * 1000);

  	  	conn.forwardOut('0.0.0.0', params.tunnel_port,'localhost',params.tunnel_port, function(err, remote) {
  	    	if (err) throw err;
			remote.pipe(socket).pipe(remote);
			remote.on("error", function (e) {
				try { socket.end(); } catch (e) { log(e); }
				try { remote.end(); } catch (e) { log(e); }
			});
			socket.on("error", function (e) {
				try { socket.end(); } catch (e) { log(e); }
				try { remote.end(); } catch (e) { log(e); }
			});
		});
	});

	server.on('error', function (e) {
		if (e.code == "EADDRINUSE" || e.code == "EACCES") {
			try { server.close(); } catch (e) { log(e) }
			print('server socket error.');
		}
		print("ServerError:" + e);
	});
	server.on('listening', function () {
		console.log(`listening: 0.0.0.0:${params.tunnel_port}`);
		if (params.on_opened) params.on_opened();
	});

	server.listen(params.tunnel_port);

	}).connect({
	  host: params.host,
	  port: params.port,
	  privateKey:require('fs').readFileSync(params.privateKey),
	  keepaliveInterval:30*1000,
	  username: params.user,
	});
}


var actions = [];
function action_list() {
    {
        let funcs = [];
        let index = 0;
        for (let k in actions) {
            let obj = actions[k];
            for (let k in obj.descriptions) {
                let f = obj.descriptions[k].value;
                if (GPUEATER_ADMINISTRATOR || f.administrator == false) {
                    if (f.name.indexOf("_")==0) {
                        // print("");
                        // print(` ${PR("  ",2)}   ${PL(f.name,30)}   ${f.description}`);
                    } else {
                        if (GPUEATER_ADMINISTRATOR || !f.hide) {
                            //print(` ${PR(index,2)} : ${PL(f.name,30)} : ${f.description}`);
                            f.index = index;
                            f.visible = true;
                            index++;
                        }
                    }
                }
                funcs.push(f);
            }
        }

        return funcs;

    }


    return;


	let funcs = [];
	if (require.main === module && false) {
		let lines = fs.readFileSync(__filename).toString().split("\n");
		for (let line of lines) {
			if (line.indexOf("f == ")>=0) {
				if (line.indexOf("else if") >= 0) {
					let j = {description:"",administrator:false};
					try{j=Object.assign(j,JSON.parse(line.split("//")[1]));}catch(e){}
					let obj = {
						name:line.split("'")[1],
						description:j.description,
						administrator:j.administrator,
						hide:j.hide
					};
					funcs.push(obj);
				}
			}
		}
		{
			let s = "";
			let g_add = true;
			for (let line of lines) {
				let add = true;
				if (line.indexOf("@@ACTIONS@@")>=0) {
					if (line.indexOf("@@START@@")>=0) {
						s += "		/* @@ACTIONS@@ ";
						s += "@@START@@ */\n";
						s += "		funcs=[\n";
						for (let f of funcs) {
							s += `			{name:'${f.name}',description:'${f.description}',administrator:${f.administrator},hide:${f.hide}},\n`;
						}
						s += "		];\n";
						//let ss = "funcs='"+JSON.stringify(funcs)+"';\n";
						//s += ss.split("\n").join() + "\n";
						add = false;
						g_add = false;
					} else if (line.indexOf("@@END@@")>=0) {
						s += "		/* @@ACTIONS@@ ";
						s += "@@END@@ */\n";
						add = false;
						g_add = true;
					}
				}
				if (add && g_add) s += line+"\n";
			}
			lines = s.split("\n");
			let ns = [];

			for (let line of lines) {
				if (line.indexOf("/*@@VERSION_START@@*/") >= 0) {
					if (line.indexOf("/*@@VERSION_END@@*/") >= 0) {
						let nline = "			/*@@VERSION_START@@*/";
						nline += `print("${new Date().full_time()}")`;
						nline += "/*@@VERSION_END@@*/";
						ns.push(nline);
						continue;
					}
				}
				ns.push(line);
			}
			fs.writeFileSync(__filename,ns.join("\n"));
		}
	} else {
		/* @@ACTIONS@@ @@START@@ */
		funcs=[
			{name:'__________images__________',description:'',administrator:false,hide:undefined},
			{name:'images',description:'Listing default OS images.',administrator:false,hide:undefined},
			{name:'images_for_admin',description:'Listing default all OS images.',administrator:true,hide:undefined},
			{name:'registered_images',description:'.',administrator:false,hide:undefined},
			{name:'create_image',description:'Implementing.',administrator:false,hide:undefined},
			{name:'create_image_for_admin',description:'Implementing.',administrator:true,hide:undefined},
			{name:'delete_image',description:'Implementing.',administrator:false,hide:undefined},
			{name:'image_list_on_instance',description:'Implementing.',administrator:true,hide:undefined},
			{name:'distribute_image_for_admin',description:'Implementing.',administrator:true,hide:undefined},
			{name:'publish_image',description:'Implementing.',administrator:true,hide:undefined},
			{name:'__________ssh_key__________',description:'',administrator:false,hide:undefined},
			{name:'ssh_keys',description:'Listing registered SSH keys.',administrator:false,hide:undefined},
			{name:'generate_ssh_key',description:'Just generate RSA key. You have to register after this.',administrator:false,hide:undefined},
			{name:'register_ssh_key',description:'Register ssh key.',administrator:false,hide:undefined},
			{name:'delete_ssh_key',description:'Delete a registered ssh key.',administrator:false,hide:undefined},
			{name:'__________instance__________',description:'',administrator:false,hide:undefined},
			{name:'products',description:'Listing on-demand products.',administrator:false,hide:undefined},
			{name:'instances',description:'Listing launched on-demand instances.',administrator:false,hide:undefined},
			{name:'subscription_list',description:'This API will be implemented on v2.0.',administrator:true,hide:true},
			{name:'launch_subcription_instance',description:'This API will be implemented on v2.0.',administrator:true,hide:true},
			{name:'change_instance_tag',description:'Change instance tag.',administrator:false,hide:undefined},
			{name:'launch',description:'Launch an on-demand instance.',administrator:false,hide:undefined},
			{name:'terminate',description:'Terminate an instance.',administrator:false,hide:undefined},
			{name:'start',description:'Start an instance.',administrator:false,hide:undefined},
			{name:'stop',description:'Stop an instance.',administrator:false,hide:undefined},
			{name:'restart',description:'Restart an instance.',administrator:false,hide:undefined},
			{name:'emergency_restart_instance',description:'Force restart an instance.',administrator:false,hide:undefined},
			{name:'__________network__________',description:'',administrator:false,hide:undefined},
			{name:'port_list',description:'Listing port maps of instance.',administrator:false,hide:undefined},
			{name:'open_port',description:'Register port map.',administrator:false,hide:undefined},
			{name:'close_port',description:'Delete port map.',administrator:false,hide:undefined},
			{name:'network_description',description:'Get a network information of instance.',administrator:false,hide:undefined},
			{name:'renew_ipv4',description:'Assign a new IPv4.',administrator:false,hide:undefined},
			{name:'refresh_ipv4',description:'Refresh IPv4 map of instance.',administrator:false,hide:undefined},
			{name:'__________administrator__________',description:'',administrator:true,hide:undefined},
			{name:'compute_nodes',description:'Listing only computing nodes.',administrator:true,hide:undefined},
			{name:'proxy_nodes',description:'Listing only proxy nodes.',administrator:true,hide:undefined},
			{name:'front_nodes',description:'Listing only front nodes.',administrator:true,hide:undefined},
			{name:'nodes',description:'Listing all nodes.',administrator:true,hide:undefined},
			{name:'instances_for_admin',description:'Listing all instances.',administrator:true,hide:undefined},
			{name:'products_for_admin',description:'Listing all on-demand products.',administrator:true,hide:undefined},
			{name:'launch_as_admin',description:'Force launch an instance.',administrator:true,hide:undefined},
			{name:'login_node',description:'Login to machine resource.',administrator:true,hide:undefined},
			{name:'login_multi_node',description:'Multiple login to machine resources.',administrator:true,hide:undefined},
			{name:'__________payment__________',description:'',administrator:false,hide:undefined},
			{name:'invoices',description:'Listing invoices.',administrator:false,hide:undefined},
			{name:'__________extensions__________',description:'',administrator:false,hide:undefined},
			{name:'login',description:'Login to instance.',administrator:false,hide:undefined},
			{name:'get',description:'Get a file from host.',administrator:false,hide:undefined},
			{name:'put',description:'Put a file to host.',administrator:false,hide:undefined},
			{name:'cmd',description:'Do any command on instance.',administrator:false,hide:undefined},
			{name:'ls',description:'File list on remote.',administrator:false,hide:undefined},
			{name:'sync',description:'Synchronize files via rsync.',administrator:false,hide:undefined},
			{name:'tunnel',description:'Port forwarding local to remote.',administrator:false,hide:undefined},
			{name:'jupyter',description:'Start jupyter and port forward.',administrator:false,hide:undefined},
			{name:'version',description:'Version of client.',administrator:false,hide:undefined},
			{name:'help',description:'Display help.',administrator:false,hide:undefined},
			{name:'upgrade',description:'Upgrade API self.',administrator:false,hide:undefined},
		];
		/* @@ACTIONS@@ @@END@@ */
	}
	let index = 0;
	for (let k in funcs) {
		let f = funcs[k];
		if (GPUEATER_ADMINISTRATOR || f.administrator == false) {
			if (f.name.indexOf("_")==0) {
				// print("");
				// print(` ${PR("  ",2)}   ${PL(f.name,30)}   ${f.description}`);
			} else {
				if (GPUEATER_ADMINISTRATOR || !f.hide) {
					//print(` ${PR(index,2)} : ${PL(f.name,30)} : ${f.description}`);
					f.index = index;
					f.visible = true;
					index++;
				}
			}
		}
	}

	return funcs;
}

function node_login(node_type,node_type_display) {
	g.machine_resource_list_for_admin((e,res)=>{
		if (e) printe(e);
		else {
			let index = 0;
			let clist = [];
			for (let k in res) {
				let m = res[k];
				if (m.node_type == node_type) {
					let alive = m.elapsed_time > 60 ? 'DEAD' : 'ALIVE';
					print(`${PR(index++,2)} : ${node_type_display} : ${PL(alive,5)} : ${PR(m.server_label,22)} : ssh ${m.sshd_user}@${m.network_ipv6?m.network_ipv6:m.network_ipv4} -p ${m.sshd_port} -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10`);
					clist.push(m);
				}
			}
			let n = ask(`Login > `);
			let mm = clist[n];
			print({privateKey:path.join(HOME,'.ssh',`brain_master_key.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.network_ipv6?mm.network_ipv6:mm.network_ipv4});
			ssh2_console({privateKey:path.join(HOME,'.ssh',`brain_master_key.pem`),port:mm.sshd_port,user:mm.sshd_user,host:mm.network_ipv6?mm.network_ipv6:mm.network_ipv4});
		}
	});
}


if (require.main === module) {
    let lines = fs.readFileSync(__filename).toString().split("\n");
    let ret = "";
    let start = false;
    let functions = [];
    for (let line of lines) {
        let add = false;
        if (line.indexOf("function") == 0) {
            functions.push(line.replace("function ","").split("(")[0]);
        }

        if (line.indexOf(" @@ MODULE EXPORTS @@") >= 0) {
            if (line.indexOf("START") >= 0) {
                start = true;
                add = true;
            } else if (line.indexOf("END") >= 0) {
                start = false;
                add = true;
                let function_str = "module.exports = {\n";
                for (let v of functions) {
                    function_str += `  ${v}:${v}, \n`;
                }
                function_str += "}\n";
                ret += function_str;
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
    console.log(ret);
}



/* @@ MODULE EXPORTS @@ START */
module.exports = {
  display_help:display_help,
  charcount:charcount,
  PL:PL,
  PR:PR,
  ask:ask,
  plot_images:plot_images,
  plot_ssh_keys:plot_ssh_keys,
  plot_products:plot_products,
  plot_instances:plot_instances,
  display:display,
  display_ondemand_list:display_ondemand_list,
  instance_list:instance_list,
  ondemand_list:ondemand_list,
  products_for_admin:products_for_admin,
  selected:selected,
  select_instance:select_instance,
  select_instance_auto:select_instance_auto,
  ssh2_console:ssh2_console,
  tunnel:tunnel,
  action_list:action_list,
  node_login:node_login,
}
/* @@ MODULE EXPORTS @@ END */
