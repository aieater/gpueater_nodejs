const gutil = require('./util'); const util = require('util');
const u_logger = new gutil.logger(require('path').basename(__filename).replace('.js', ''));
const dir = u_logger.dir; const log = u_logger.log; const debug = u_logger.debug; const info = u_logger.info;
const notice = u_logger.notice; const warn = u_logger.warn; const err = u_logger.err; const crit = u_logger.crit; const alert = u_logger.alert; const emerg = u_logger.emerg;
function time() { return (new Date).getTime() / 1000.0; } function clone(s) { return JSON.parse(JSON.stringify(s)); }
//if (require.main === module) { gutil.enable_console(); gutil.disable_backup(); }
{ let s = ` Load [ ${u_logger.MODNAME.replace('.js', '')} ] `; let slen = s.length; while (s.length < 100) { s = "@" + s + "@"; }; s = s.slice(0, 100); log(s); }



const fs = require('fs');
const os = require('os');
const path = require('path');
const HOME = os.homedir();
const TMP = os.tmpdir();
const readlineSync = require('readline-sync');
const g = require('./gpueater');

var argv = process.argv;


const print = console.log;
const printe = console.error;

argv.shift() // node
argv.shift() // app

const f = argv.shift()

function display_help() {
	print(` --- GPUEater console API help --- `);
	print(` [Command] [Action] [Args...]`);
	print(``);
	print(` Command`);
	print(`   - instances`);
	print(`   - products`);
	print(`   - images`);
	print(`   - ssh_keys`);
	print(`   - start`);
	print(`   - stop`);
	print(`   - restart`);
	print(`   - launch`);
	print(`   - terminate`);
}


function PL(s,w,p=" ") {
	if (s == null) return "null";
	s = s + "";
	let ret = s;
	if (s.length < w) {
		for (let i = s.length;i<w;i++) {
			ret += p;
		}
	}
	return ret.slice(0,w);
}
function PR(s,w,p=" ") {
	if (s == null) return "null";
	s = s + "";
	let ret = s;
	if (s.length < w) {
		for (let i = s.length;i<w;i++) {
			ret = p + ret;
		}
	}
	return ret;
}



function ask(s) { return readlineSync.question(s); }

function plot_images(datas, display = true) {
	if (display) print(`-----------------------------------------------------`);
	if (display) print(` ---- Images ----`);
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
	datas.sort((a,b)=>{
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
	for (let k in datas) {
		let v = datas[k];
		ret.push(v);
		v.view =  ` ${index++}: ${PL(v.name,10)} InStock(${v.pool.length>0?"OK":"NG"}) CPU(${PR(v.cpu,2)})  MEM(${PR(v.memory,5)})MB  SSD(${PR(v.root_storage,4)})GB  $${PR(v.price,6)}/h  ${PL(v.device_desc,40)}`;
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
		v.view =  ` ${index++}: Tag(${PL(v.tag,10)}) ${PL(v.product_name,10)} CPU(${PR(v.cpu,2)})  MEM(${PR(v.memory,5)})MB  SSD(${PR(v.root_storage,4)})GB  $${PR(v.price,6)}/h  ${PL(v.device_desc,40)}\n    ${v.ssh_command}`;
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
			let image_list 		= plot_images(res.data.images);
			let ssh_key_list 	= plot_ssh_keys(res.data.ssh_keys);
			let product_list 	= plot_products(res.data.products);
			print(`-----------------------------------------------------`);
			if (func) func(null,{image_list:image_list,ssh_key_list:ssh_key_list,product_list:product_list});
		}
	});
}
function instance_list(func) {
	g.instance_list((e,res)=>{
		if (e) { printe(e) }
		else {
			plot_instances(res.data);
			print('')
			if (func) func(null, res.data);
		}
	});
}
function ondemand_list(func) {
	g.ondemand_list((e,res)=>{
		if (e) { printe(e) }
		else {
			let image_list 		= plot_images(res.data.images,false);
			let ssh_key_list 	= plot_ssh_keys(res.data.ssh_keys,false);
			let product_list 	= plot_products(res.data.products,false);
			if (func) func(null,{image_list:image_list,ssh_key_list:ssh_key_list,product_list:product_list});
		}
	});
}

function selected(v) { print(` Selected => "${v.view.trim()}"`); }

function ssh2_console(params) {
	const Connection = require('ssh2'); // npm install ssh2
	let gs = null;
	const conn = new Connection();
	conn.on('ready', function() {
	  console.log('>> Push enter');
	    conn.shell(function(err, stream) {
	      if (err) throw err;
	      stream.on('close', function() {
	        console.log('Stream :: close');
	        conn.end();
	        process.exit(1);
	      }).on('data', function(data) {
	        if (!gs) gs = stream;
	        if (gs._writableState.sync == false) process.stdout.write(''+data);
	      }).stderr.on('data', function(data) {
	        console.log('STDERR: ' + data);
	        process.exit(1);
	    });
	  });
	}).connect({
	  host: params.host,
	  port: params.port,
	  privateKey:require('fs').readFileSync(params.privateKey),
	  keepaliveInterval:30,
	  username: params.user,
	});

	let stdin = process.stdin;
	stdin.setRawMode( true );
	stdin.resume();
	stdin.setEncoding( 'utf8' );
	stdin.on( 'data', function( key ) {
	  if ( key === '\u0003' ) {
	    process.exit();
	  }
	  if (gs) gs.write('' + key); 
	});
}

if (f) {
	if (f == 'instances') {
		instance_list();
	} else if (f == 'products') {
		display_ondemand_list();
	} else if (f == 'images') {
	} else if (f == 'ssh_keys') {
	} else if (f == 'login') {
		instance_list((e,res)=>{
			if (e) printe(e);
			else {
				let n = ask(`Login > `);
				let ins = res[n];
				ssh2_console({user:'root',privateKey:path.join(HOME,'.ssh',`${ins.ssh_key_file_name}.pem`),port:ins.sshd_port,user:ins.sshd_user,host:ins.ipv4});
			}
		});
		
	} else if (f == 'start') {
	} else if (f == 'stop') {
	} else if (f == 'restart') {
	} else if (f == 'launch') {
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
			if (!img) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
			print(``)
			selected(img);
			print(``)
			print(``)
			
			display(`SSH Keys`,res.ssh_key_list);
			print(``)
			n = ask(`SSH Key > `);
			let ssh_key = res.ssh_key_list[n];
			if (!ssh_key) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
			print(``)
			selected(ssh_key);
			print(``)
			print(``)
			
			g.launch_ondemand_instance({product_id:p.id,image:img.alias,ssh_key_id:ssh_key.id},(e,res)=>{
				if (e) { printe(e); }
				else { print(res); }
			});
			
		});
	} else if (f == 'terminate') {
		instance_list((e,res)=>{
			if (e) printe(e);
			else {
				let n = ask(`Terminate > `);
				let ins = res[n];
				if (!ins) { printe(` Error: "Invalid product number" => "${n}"`);process.exit(9); }
				g.terminate_instance(ins,(e,res)=>{
					if (e) printe(e);
					else print(res);
				});
			}
		});
		
	} else {
		
	}
} else {
	print('')
	print(`[Command] [Action] [Args...]`);
	print(`  instnaces/products/launch/terminate/login`)
	print(`  `)
	print(`  Example`)
	print(`   > gpueater products`)
	instance_list();
}
