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
const GPUEATER_ADMINISTRATOR = process.env.GPUEATER_ADMINISTRATOR;

const request = require('request');

const g = require('./gpueater');



var argv = process.argv;


const print = console.log;
const printe = console.error;

argv.shift() // node
argv.shift() // app

const f = argv.shift()

function display_help() {
	print('')
	print(`[Command] [Action] [Args...]`);
	print(`  `)
	print(`  Example`)
	print(`   > gpueater products`)
	print(`  `)
	let actions = action_list();
	print(``);
	for (let v of actions) {
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

function action_list() {
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


function main(f) {

	if (f) {
		if (f  == 'dummy') {
		} else if (f == '__________images__________') {
		} else if (f == 'images') { // {"description":"Listing default OS images."}
			g.image_list((e,res)=>{
				if (e) printe(e);
				else { plot_images(res); }
			});
		} else if (f == 'images_for_admin') { // {"description":"Listing default all OS images.","administrator":true}
			g.image_list_for_admin((e,res)=>{
				if (e) printe(e);
				else { plot_images(res); }
			});
		} else if (f == 'registered_images') { // {"description":"."}
			g.registered_image_list((e,res)=>{
				if (e) printe(e);
				else { plot_images(res); }
			});
		} else if (f == 'create_image') { // {"description":"Implementing."}
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
		} else if (f == 'create_image_for_admin') { // {"description":"Implementing.","administrator":true}
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
		} else if (f == 'delete_image') { // {"description":"Implementing."}
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
		} else if (f == 'image_list_on_instance') { // {"description":"Implementing.","administrator":true}
			g.image_list_on_machine_resource_for_admin(ins,(e,res)=>{
				if (e) printe(e);
				else {
					plot_images(res);
				}
			});
		} else if (f == 'distribute_image_for_admin') { // {"description":"Implementing.","administrator":true}
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
		} else if (f == 'publish_image') { // {"description":"Implementing.","administrator":true}
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
		} else if (f == '__________ssh_key__________') {
		} else if (f == 'ssh_keys') { // {"description":"Listing registered SSH keys."}
			g.ssh_key_list((e,res)=>{
				if (e) printe(e);
				else { plot_ssh_keys(res); }
			});
		} else if (f == 'generate_ssh_key') { // {"description":"Just generate RSA key. You have to register after this."}
			g.generate_ssh_key((e,res)=>{
				if (e) printe(e);
				else {
					print('Private Key');
					print(res.private_key);
					print('Public Key');
					print(res.public_key);
				}
			});
		} else if (f == 'register_ssh_key') { // {"description":"Register ssh key."}
		} else if (f == 'delete_ssh_key') { // {"description":"Delete a registered ssh key."}
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
		} else if (f == '__________instance__________') {
		} else if (f == 'products') { // {"description":"Listing on-demand products."}
			display_ondemand_list();
		} else if (f == 'instances') { // {"description":"Listing launched on-demand instances."}
			instance_list();
		} else if (f == 'subscription_list') { // {"description":"This API will be implemented on v2.0.","hide":true,"administrator":true}
			print(`Not supported yet.`);
		} else if (f == 'launch_subcription_instance') { // {"description":"This API will be implemented on v2.0.","hide":true,"administrator":true}
			print(`Not supported yet.`);
		} else if (f == 'change_instance_tag') { // {"description":"Change instance tag."}
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
		} else if (f == 'launch') { // {"description":"Launch an on-demand instance."}
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
		} else if (f == 'terminate') {  // {"description":"Terminate an instance."}
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
		
		} else if (f == 'start') { // {"description":"Start an instance."}
			select_instance((e,ins)=>{
				print('');
				g.start_instance(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});
		} else if (f == 'stop') { // {"description":"Stop an instance."}
			select_instance((e,ins)=>{
				print('');
				g.stop_instance(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});
		} else if (f == 'restart') { // {"description":"Restart an instance."}
			select_instance((e,ins)=>{
				print('');
				g.restart_instance(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});
		} else if (f == 'emergency_restart_instance') { // {"description":"Force restart an instance."}
			select_instance((e,ins)=>{
				print('');
				g.emergency_restart_instance(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});
		} else if (f == '__________network__________') {
		} else if (f == 'port_list') { // {"description":"Listing port maps of instance."}
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
		} else if (f == 'open_port') { // {"description":"Register port map."}
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
			
		} else if (f == 'close_port') { // {"description":"Delete port map."}
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
			
		} else if (f == 'network_description') { // {"description":"Get a network information of instance."}
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
		} else if (f == 'renew_ipv4') { // {"description":"Assign a new IPv4."}
			select_instance((e,ins)=>{
				print('');
				g.renew_ipv4(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});
		} else if (f == 'refresh_ipv4') { // {"description":"Refresh IPv4 map of instance."}
			select_instance((e,ins)=>{
				print('');
				g.refresh_ipv4(ins,(e,res)=>{
					if (e) printe(e);
					else {
						instance_list();
					}
				});
			});

		} else if (f == '__________administrator__________') {  // {"administrator":true}
		} else if (f == 'compute_nodes') {  // {"description":"Listing only computing nodes.","administrator":true}
			node_login(1,'C');
		} else if (f == 'proxy_nodes') {  // {"description":"Listing only proxy nodes.","administrator":true}
			node_login(3,'P');
		} else if (f == 'front_nodes') {  // {"description":"Listing only front nodes.","administrator":true}
			node_login(0,'F');
		} else if (f == 'nodes') {  // {"description":"Listing all nodes.","administrator":true}
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
		} else if (f == 'instances_for_admin') { // {"description":"Listing all instances.","administrator":true}
		} else if (f == 'products_for_admin') { // {"description":"Listing all on-demand products.","administrator":true}
			products_for_admin((e,res)=>{
				if (e) printe(e);
				else {
					display(`Products`,res.product_list);
				}
			});
		} else if (f == 'launch_as_admin') { // {"description":"Force launch an instance.","administrator":true}
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
		} else if (f == 'login_multi_node') {  // {"description":"Multiple login to machine resources.","administrator":true}
			machine_resource_list_for_admin((e,s)=>{
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
		} else if (f == '__________extensions__________') {
		} else if (f == 'invoices') { // {"description":"Listing invoices."}
			g.invoice_list((e,res)=>{
				if (e) printe(e);
				else {
					print(res); // TODO
				} 
			});
		} else if (f == '__________extensions__________') {
		} else if (f == 'login') { // {"description":"Login to instance."}
			instance_list((e,res)=>{
				if (e) printe(e);
				else {
					if (res.length == 0) { printe(`There is no instance.\n`);process.exit(9);} 
					let n = 0;
					if (res.length != 1) { n = ask(`Login > `); }
					
					let ins = res[n];
					if (!ins) for (let v of res) { if (v.tag == n) { ins = v;break;}}
					// execSync(ins.ssh_command);
					ssh2_console({privateKey:path.join(HOME,'.ssh',`${ins.ssh_key_file_name}.pem`),port:ins.sshd_port,user:ins.sshd_user,host:ins.ipv4});
				}
			});
		} else if (f == 'get') { // {"description":"Get a file from host."}
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
		} else if (f == 'put') { // {"description":"Put a file to host."}
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
		} else if (f == 'cmd') { // {"description":"Do any command on instance."}
			select_instance_auto((e,ins)=>{
				let icmd = argv.length > 0 ? argv.join(" ") : ask(" Command > ");
				let cmd = `ssh ${ins.sshd_user}@${ins.ipv4} -p ${ins.sshd_port} -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10 '${icmd}'\n`;
				print(``);
				print(execSync(cmd).toString());
			});
		} else if (f == 'ls') { // {"description":"File list on remote."}
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
		} else if (f == 'sync') { // {"description":"Synchronize files via rsync."}
		} else if (f == 'tunnel') { // {"description":"Port forwarding local to remote."}
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
		} else if (f == 'jupyter') { // {"description":"Start jupyter and port forward."}
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
		} else if (f == 'jupyter_as_admin') { // {"description":"Start jupyter and port forward.","administrator":true}
			
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
			
		} else if (f == 'version') { // {"description":"Version of client."}
			/*@@VERSION_START@@*/print("07/27/2018 20:59")/*@@VERSION_END@@*/
		} else if (f == 'help') { // {"description":"Display help."}
			display_help();
		} else if (f == 'upgrade') { // {"description":"Upgrade API self."}
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
			print(``);
			print(`Invalid action => ${f}`);
			print(``);
			setTimeout(()=>{
				display_help();
			},1000);
		}
	} else {
		display_help();
		let actions = action_list();
		let n = ask(` Action > `);
		let action = null;
		if (isNaN(parseInt(n))) {
			for (let v of actions) { if (v.name == n) { action = v;break; } }
		} else {
			for (let v of actions) { if (v.index == n) { action = v;break; } }
		}
		print(``);
		if (!action) { printe(`Invalid action.`);process.exit(9); }
		print(``);
		main(action.name);
	}
}


main(f);











