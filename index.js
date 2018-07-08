const gutil = require('./util'); const util = require('util');
const u_logger = new gutil.logger(require('path').basename(__filename).replace('.js', ''));
const dir = u_logger.dir; const log = u_logger.log; const debug = u_logger.debug; const info = u_logger.info;
const notice = u_logger.notice; const warn = u_logger.warn; const err = u_logger.err; const crit = u_logger.crit; const alert = u_logger.alert; const emerg = u_logger.emerg;
function time() { return (new Date).getTime() / 1000.0; } function clone(s) { return JSON.parse(JSON.stringify(s)); }
if (require.main === module) { gutil.enable_console(); gutil.disable_backup(); }
{ let s = ` Load [ ${u_logger.MODNAME.replace('.js', '')} ] `; let slen = s.length; while (s.length < 100) { s = "@" + s + "@"; }; s = s.slice(0, 100); log(s); }



const fs = require('fs');
const os = require('os');
const path = require('path');
const req = require('request');
const HOME = os.homedir();
const TMP = os.tmpdir();
const COOKIE_PATH = path.join(TMP,`gpueater_cookie.txt`);



var base = process.env.GPUEATER_URL||"https://www.gpueater.com";
var global_header = {"User-Agent":"NodeJS-API"};
var eater_config = null;

try { eater_config = JSON.parse(fs.readFileSync(`.eater`).toString()); } catch (e) {
	try { eater_config = JSON.parse(fs.readFileSync(path.join(HOME,".eater")).toString()); } catch (e) {
		console.error(`You must prepare ${path.join(HOME,".eater")} or .eater file.`);
		console.info(`Setup GPUEater config to ${path.join(HOME,".eater")} file.`);
		const readlineSync = require('readline-sync');
		let email = readlineSync.question('email: ');
		let pass = readlineSync.question('password: ', {hideEchoBack: true});
		let obj = {gpueater:{email:email,password:pass}};
		fs.writeFileSync(path.join(HOME,".eater"),JSON.stringify(obj));
		console.info(`GPUEater config saved to ${path.join(HOME,".eater")}.`);
	} 	
} 
try { global_header['Cookie'] = fs.readFileSync(COOKIE_PATH);} catch (e) { }


function relogin(res,func) {
	console.info(`relogin`);
	info(`POST URL:"${base}/api_login"`);
	req({url: base+"/api_login", method: 'POST', form: { email:eater_config.gpueater.email, password:eater_config.gpueater.password }, resolveWithFullResponse: true},function(error, response, body){
		if (error) {
			err(error);
			func(error);
		} else {
			global_header['Cookie'] = response.headers['set-cookie'];
			fs.writeFileSync(COOKIE_PATH,global_header['Cookie']);
			dir(response.body);
			func(null,response.body);
		}
	});
}


function login_check(res,func) {
	try { func(null,JSON.parse(res.body)); } catch (e) {
		if (res.body.indexOf(`<title>GPUEater:  Login</title>`)>=0 || res.body.indexOf('/login?state=session_timeout')>=0) {
			info(`-------------`);
			relogin(res,(e)=>{
				if (e) { err(`Could not login`); throw `Could not login`;}
				else { info(`Logged in`);func(`Logged in`); }
			});
		} else { throw e; }
	}
}

function ssh_keys(func) {
	info(`ssh_keys`);
	let self_callback = ()=>{ssh_keys(func);};
	req({url: base+"/console/servers/ssh_keys", headers:global_header, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(null,j)} });
		}
	});
}

function gen(func) {
	info(`register_ssh_key`);
	let self_callback = ()=>{register_ssh_key(func);};
	
}

function register_ssh_key(func) {
	info(`register_ssh_key`);
	let self_callback = ()=>{register_ssh_key(func);};
	
}

function delete_ssh_key(func) {
	info(`delete_ssh_key`);
	let self_callback = ()=>{delete_ssh_key(func);};
	
}

function image_list(func) {
	info(`image_list`);
	let self_callback = ()=>{image_list(func);};
	req({url: base+"/console/servers/images", headers:global_header, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(null,j)} });
		}
	});
	
}

function launch_ondemand_instance(form,func) {
	info(`launch_ondemand_instance`);
	let self_callback = ()=>{launch_ondemand_instance(func);};
	
	if (!form.product_id) { throw (`product_id is required.`);return;}
	if (!form.image) { throw (`image is required.`);return;}
	if (!form.ssh_key_id) { throw (`ssh_key_id is required.`);return;}
	if (!form.tag) { form.tag = ""; }
		
	req.post({url: base+"/console/servers/launch_ondemand_instance", headers:global_header, form:form, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(null,j)} });
		}
	});
}



function find_ssh_key(name,res) {
	let ssh_keys = res.data.ssh_keys;
	let ret = null;
	for (let k in ssh_keys) {
		let p = ssh_keys[k];
		if (p.name == name) { ret = p; break;}
	}
	return ret;
}

function find_image(name,res) {
	let images = res.data.images;
	let ret = null;
	for (let k in images) {
		let p = images[k];
		if (p.name == name) { ret = p; break;}
	}
	return ret;
	
}

function find_product(name,res) {
	let products = res.data.products;
	let ret = null;
	for (let k in products) {
		let p = products[k];
		if (p.name == name && p.limited == false) { ret = p; break;}
	}
	return ret;
}

function instance_list(func) {
	info(`instance_list`);
	let self_callback = ()=>{instance_list(func);};
	req({url: base+"/console/servers/instance_list", headers:global_header, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {
				for (let k in j.data) {
					let ins = j.data[k];
					ins.ssh_command = `ssh root@${ins.ipv4} -p 22 -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10`;
				}
				func(null,j);
			} });
		}
	});
	
	
}

function start_instance(func) {
	info(`start_instance`);
	let self_callback = ()=>{start_instance(func);};
	
}

function stop_instance(func) {
	info(`stop_instance`);
	let self_callback = ()=>{stop_instance(func);};
	
}

function restart_instance(func) {
	info(`restart_instance`);
	let self_callback = ()=>{restart_instance(func);};
	
}

function terminate_instance(ins,func) {
	info(`terminate_instance`);
	let self_callback = ()=>{terminate_instance(func);};
	let instances = [];
	
	if (!ins.instance_id) { throw (`instance_id is required.`);return;}
	if (!ins.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:ins.instance_id,machine_resource_id:ins.machine_resource_id});
	
	req.post({url: base+"/console/servers/force_terminate", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {func(null,j);} });
		}
	});
	
}

function port_forwards(func) {
	info(`port_forwards`);
	let self_callback = ()=>{port_forwards(func);};
	
}

function open_port(func) {
	info(`open_port`);
	let self_callback = ()=>{open_port(func);};
	
}

function close_port(func) {
	info(`close_port`);
	let self_callback = ()=>{close_port(func);};
}

function ondemand_list(func) {
	info(`ondemand_list`);
	let self_callback = ()=>{ondemand_list(func);};
	req({url: base+"/console/servers/ondemand_launch_list", headers:global_header, resolveWithFullResponse:true, forever:true },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {
				j.find_ssh_key = (name)=>{return find_ssh_key(name,j);}
				j.find_image = (name)=>{return find_image(name,j);}
				j.find_product = (name)=>{return find_product(name,j);}
				func(null,j);
			} });
		}
	});
}


module.exports = {
	ondemand_list:ondemand_list,
	launch_ondemand_instance:launch_ondemand_instance,
	ssh_keys:ssh_keys,
	image_list:image_list,
	instance_list:instance_list,
	terminate_instance:terminate_instance,
}