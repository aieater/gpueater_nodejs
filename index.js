const gutil = require('./util'); const util = require('util');
const u_logger = new gutil.logger(require('path').basename(__filename).replace('.js', ''));
const dir = u_logger.dir; const log = u_logger.log; const debug = u_logger.debug; const info = u_logger.info;
const notice = u_logger.notice; const warn = u_logger.warn; const err = u_logger.err; const crit = u_logger.crit; const alert = u_logger.alert; const emerg = u_logger.emerg;
const time = function(){ return (new Date).getTime() / 1000.0; }; function clone(s) { return JSON.parse(JSON.stringify(s)); }
if (require.main === module) { gutil.enable_console(); gutil.disable_backup(); }
{ let s = ` Load [ ${u_logger.MODNAME.replace('.js', '')} ] `; let slen = s.length; while (s.length < 100) { s = "@" + s + "@"; }; s = s.slice(0, 100); log(s); }



const fs = require('fs');
const os = require('os');
const path = require('path');
const req = require('request');
const HOME = os.homedir();
const TMP = os.tmpdir();
const COOKIE_PATH = path.join(TMP,`gpueater_cookie.txt`);
const FOEVER = false;

Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__function', {get: function() { return __stack[1].getFunctionName();}});


var base = process.env.GPUEATER_URL||"https://www.gpueater.com";
var global_header = {"User-Agent":"NodeJS-API"};
var eater_config = null;
var administrator_api = process.env.GPUEATER_ADMINISTRATOR;

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


let login = (res,func) => {
	info(`POST URL:"${base}/api_login"`);
	req({url: base+"/api_login", method: 'POST', form: { email:eater_config.gpueater.email, password:eater_config.gpueater.password }, resolveWithFullResponse: true},function(error, response, body){
		if (error) {
			err(error);
			func(error);
		} else {
			global_header['Cookie'] = response.headers['set-cookie'];
			fs.writeFileSync(COOKIE_PATH,global_header['Cookie']);
			func(null,response.body);
		}
	});
}

let login_check = (res,func) => {
	try { func(null,JSON.parse(res.body)); } catch (e) {
		if (res.body.indexOf(`<title>GPUEater:  Login</title>`)>=0 || res.body.indexOf('/login?state=session_timeout')>=0) {
			info(`-------------`);
			login(res,(e)=>{
				if (e) { err(`Could not login`); throw `Could not login`;}
				else { info(`Logged in`);func(`Logged in`); }
			});
		} else { throw e; }
	}
}


let find_ssh_key = (name,res) => {
	let ssh_keys = res.data.ssh_keys;
	let ret = null;
	for (let k in ssh_keys) {
		let p = ssh_keys[k];
		if (p.name == name) { ret = p; break;}
	}
	return ret;
}

let find_image = (name,res) => {
	let images = res.data.images;
	let ret = null;
	for (let k in images) {
		let p = images[k];
		if (p.name == name) { ret = p; break;}
	}
	return ret;
	
}

let find_product = (name,res) => {
	let products = res.data.products;
	let ret = null;
	for (let k in products) {
		let p = products[k];
		if (p.name == name && p.limited == false) { ret = p; break;}
	}
	return ret;
}




function _________ssh__________(func) {}

function ssh_key_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/ssh_keys", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function generate_ssh_key(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/ssh_key_gen", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}

function register_ssh_key(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.name) { throw (`name is required.`);return;}
	if (!form.public_key) { throw (`public_key is required.`);return;}
	form.register_ssh_key_name = form.name;
	form.register_ssh_key_public_key = form.public_key;
	
	let valid = false;
	let s = form.public_key;
	if (s && s.indexOf('ssh-rsa ') == 0) {
		if (s.length < 1000) {
			if (s.replace(/\t|\r|\n/g, "").replace(/[a-zA-Z0-9]|\/|-|\+| |\.|@/g, "") == 0) {
				valid = true;;
			}
		}
	}
	if (!valid) {throw `Invalid public key.`; return;}
	
	
	req.post({url: base+"/console/servers/register_ssh_key", headers:global_header, resolveWithFullResponse:true,form:form, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}

function delete_ssh_key(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.id) { throw (`id is required.`);return;}
	req.post({url: base+"/console/servers/delete_ssh_key", headers:global_header, resolveWithFullResponse:true,form:form, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {console.dir(j);info(`OK`);func(j.error,j.data)} });
		}
	});
}

function _________image__________(func) {}

function image_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/images", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}



function _________instance__________(func) {}


function ondemand_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/ondemand_launch_list", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
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

function subscription_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/subscription_launch_list", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
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


function launch_ondemand_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	
	if (!form.product_id) { throw (`product_id is required.`);return;}
	if (!form.image) { throw (`image is required.`);return;}
	if (!form.ssh_key_id) { throw (`ssh_key_id is required.`);return;}
	if (!form.tag) { form.tag = ""; }
	
	req.post({url: base+"/console/servers/launch_ondemand_instance", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function launch_subcription_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	
	if (!form.product_id) { throw (`product_id is required.`);return;}
	if (!form.image) { throw (`image is required.`);return;}
	if (!form.ssh_key_id) { throw (`ssh_key_id is required.`);return;}
	if (!form.tag) { form.tag = ""; }
	
	req.post({url: base+"/console/servers/launch_subscription_instance", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function instance_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/instance_list", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {
				for (let k in j.data) {
					let ins = j.data[k];
					ins.ssh_command = `ssh root@${ins.ipv4} -p 22 -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10`;
				}
				func(j.error,j.data);
			} });
		}
	});
}

function instance_description(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	req({url: base+"/console/servers/instance_info", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function start_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	let instances = [];
	
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:form.instance_id,machine_resource_id:form.machine_resource_id});
	
	req.post({url: base+"/console/servers/start", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}

function stop_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	let instances = [];
	
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:form.instance_id,machine_resource_id:form.machine_resource_id});
	
	req.post({url: base+"/console/servers/stop", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}

function restart_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	let instances = [];
	
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:form.instance_id,machine_resource_id:form.machine_resource_id});
	
	req.post({url: base+"/console/servers/restart", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}


function emergency_restart_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	let instances = [];
	
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:form.instance_id,machine_resource_id:form.machine_resource_id});
	
	req.post({url: base+"/console/servers/emergency_restart", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}


function terminate_instance(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	let instances = [];
	
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.machine_resource_id) { throw (`machine_resource_id is required.`);return;}
	
	instances.push({instance_id:form.instance_id,machine_resource_id:form.machine_resource_id});
	
	req.post({url: base+"/console/servers/force_terminate", headers:global_header, form:{instances:JSON.stringify(instances)}, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function change_instance_tag(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	if (!form.tag) { throw (`tag is required.`);return;}
	
	req.post({url: base+"/console/servers/change_instance_tag", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}


function _________port__________(func) {}

function port_list(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/port_list", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function open_port(form, func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!ins.connection_id) { throw (`connection_id is required.`);return;}
	if (!ins.instance_id) { throw (`instance_id is required.`);return;}
	if (!ins.port) { throw (`port is required.`);return;}
	
	req.post({url: base+"/console/servers/add_port", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
	
}

function close_port(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!ins.connection_id) { throw (`connection_id is required.`);return;}
	if (!ins.instance_id) { throw (`instance_id is required.`);return;}
	if (!ins.port) { throw (`port is required.`);return;}
	req.post({url: base+"/console/servers/delete_port", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function renew_ipv4(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	req.post({url: base+"/console/servers/renew_ipv4", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function refresh_ipv4(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	if (!form.instance_id) { throw (`instance_id is required.`);return;}
	req.post({url: base+"/console/servers/refresh_ipv4", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}



function _________administrator__________(func) {}

function machine_resource_list_for_admin(func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(func);};
	req({url: base+"/console/servers/machine_resource_list_for_admin", headers:global_header, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function instance_list_for_admin(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	req.post({url: base+"/console/servers/instance_list_for_admin", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function products_for_admin(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	req.post({url: base+"/console/servers/products_for_admin", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}

function launch_as_admin(form,func) {
	let _fnc_ = eval(__function); info(__function); let self_callback = ()=>{_fnc_(form,func);};
	
	if (!form.product_id) { throw (`product_id is required.`);return;}
	if (!form.image) { throw (`image is required.`);return;}
	if (!form.ssh_key_id) { throw (`ssh_key_id is required.`);return;}
	if (!form.tag) { form.tag = ""; }
	
	req.post({url: base+"/console/servers/launch_as_admin", headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) {
			func(e);
		} else {
			login_check(res,(e,j)=>{ if (e) {self_callback();} else {info(`OK`);func(j.error,j.data)} });
		}
	});
}





if (require.main === module) {
	function generate_source() {
		let lines = fs.readFileSync('./index.js').toString().split("\n");
		let ret = [];
		let funcs = [];
		for (let line of lines) {
			ret.push(line);
			if (line.indexOf("function ") == 0) {
				funcs.push(line.split('function ')[1].split('(')[0]);
			}
			if (line.indexOf("//@@ GEN @@//") == 0) {
				break;
			}
		}
		let exports = "module.exports = {\n";
		for (let f of funcs) {
			exports += `	${f}: ${f},\n`; 
		}
		exports += "}\n";
		let fstream = ret.join("\n")+"\n"+exports;
		log(fstream);
		fs.writeFileSync('./index.js',fstream);
	}
	generate_source();
}

//@@ GEN @@//
module.exports = {
	_________ssh__________: _________ssh__________,
	ssh_key_list: ssh_key_list,
	generate_ssh_key: generate_ssh_key,
	register_ssh_key: register_ssh_key,
	delete_ssh_key: delete_ssh_key,
	_________image__________: _________image__________,
	image_list: image_list,
	_________instance__________: _________instance__________,
	ondemand_list: ondemand_list,
	subscription_list: subscription_list,
	launch_ondemand_instance: launch_ondemand_instance,
	launch_subcription_instance: launch_subcription_instance,
	instance_list: instance_list,
	instance_description: instance_description,
	start_instance: start_instance,
	stop_instance: stop_instance,
	restart_instance: restart_instance,
	terminate_instance: terminate_instance,
	change_instance_tag: change_instance_tag,
	_________port__________: _________port__________,
	port_list: port_list,
	open_port: open_port,
	close_port: close_port,
	renew_ipv4: renew_ipv4,
	refresh_ipv4: refresh_ipv4,
	_________administrator__________: _________administrator__________,
	machine_resource_list_for_admin: machine_resource_list_for_admin,
	instance_list_for_admin: instance_list_for_admin,
	products_for_admin: products_for_admin,
	launch_as_admin: launch_as_admin,
}
