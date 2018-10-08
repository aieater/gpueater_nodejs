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
const crypto = require("crypto");

const execSync = require('child_process').execSync;

const req = require('request'); // npm install request
const ssh2 = require('ssh2'); // npm install ssh2


const HOME = os.homedir();
const TMP = os.tmpdir();
const COOKIE_PATH = path.join(TMP,`gpueater_cookie.txt`);
const CONFIG_HASH_PATH = path.join(TMP,`gpueater_config_hash.txt`);
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
var alist=["raccoon", "dog", "wild boar", "rabbit", "cow", "horse", "wolf", "hippopotamus", "kangaroo", "fox", "giraffe", "bear", "koala", "bat", "gorilla", "rhinoceros", "monkey", "deer", "zebra", "jaguar", "polar bear", "skunk", "elephant", "raccoon dog", "animal", "reindeer", "rat", "tiger", "cat", "mouse", "buffalo", "hamster", "panda", "sheep", "leopard", "pig", "mole", "goat", "lion", "camel", "squirrel", "donkey"];
var blist=["happy", "glad", "comfortable", "pleased", "delighted", "relieved", "calm", "surprised", "exciting"];

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
		eater_config = obj;
	}
}

let stored_hash = "A";
let hash = "B";
try {stored_hash = fs.readFileSync(CONFIG_HASH_PATH);} catch (e) {}
hash = crypto.createHmac('sha256', 'dummy').update(JSON.stringify(eater_config)).digest('hex');

if (stored_hash == hash) {
	try { global_header['Cookie'] = fs.readFileSync(COOKIE_PATH);} catch (e) { }
} else {
	fs.writeFileSync(CONFIG_HASH_PATH,hash);
}



let login = function(func) {
	info(`POST URL:"${base}/api_login"`);
	req({url: base+"/api_login", method: 'POST', form: { email:eater_config.gpueater.email, password:eater_config.gpueater.password }, resolveWithFullResponse: true},function(error, response, body){
		if (error) {
			err(error);
			func(error);
		} else {
			if (response.headers['set-cookie']) {
				global_header['Cookie'] = response.headers['set-cookie'];
				fs.writeFileSync(COOKIE_PATH,global_header['Cookie']);
			}
			func(null,response.body);
		}
	});
}


var func_get = function(api,func,required_fields=[],query={}, e=null, try_cnt=2) {
	info(api);
    if (try_cnt <= 0) { func(`Request failed.`); return;}
	for (let k in required_fields) { if (!(required_fields[k] in query)) { func(`Required field => ${required_fields[k]}`); return; } }
	req({url: base+api, headers:global_header, qs:query, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) { func(e); }
		else {
			if (res.request.uri.path == "/") {
				func(`Could not access.`);
			} else if (res.request.uri.href.indexOf("session_timeout")>=0) {
				login((e,res)=>{
					if (e) func(e);
					else setTimeout(()=>{func_get(api,func,required_fields,query,e,try_cnt-1);},parseInt(Math.exp(-try_cnt)*5000));
				});
			} else {
				let j = {};
				try { j = JSON.parse(body); } catch (e) { info(api);dir(body);err(e); j.error = `Error`; }
				func(j.error,j.data);
			}
		}
	});
}
var func_post = function(api,func,required_fields=[],form={}, e=null, try_cnt=2) {
	info(api);
    if (try_cnt <= 0) { func(`Request failed.`); return;}
	for (let k in required_fields) { if (!(required_fields[k] in form)) { func(`Required field => ${required_fields[k]}`); return; } }
	req.post({url: base+api, headers:global_header, form:form, resolveWithFullResponse:true, forever:FOEVER },function(e, res, body) {
		if (e) { func(e); }
		else {
			if (res.request.uri.path == "/") {
				func(`Could not access.`);
			} else if (res.request.uri.href.indexOf("session_timeout")>=0) {
				login((e,res)=>{
					if (e) func(e);
					else setTimeout(()=>{func_post(api,func,required_fields,query,e,try_cnt-1);},parseInt(Math.exp(-try_cnt)*5000));
				});
			} else {
				let j = {};
				try { j = JSON.parse(body); } catch (e) { info(api);dir(body);err(e); j.error = `Error`; }
				func(j.error,j.data);
			}
		}
	});
}

let ResponseProduct = function(res) {
	if (!res) return null;
	res.find_ssh_key = function(name) {
		let ssh_keys = this.ssh_keys;
		let ret = null;
		for (let k in ssh_keys) {
			let p = ssh_keys[k];
			if (p.name == name) { ret = p; break;}
		}
		return ret;
	}

	res.find_image = function(name) {
		let images = this.images;
		let ret = null;
		for (let k in images) {
			let p = images[k];
			if (p.name == name) { ret = p; break;}
		}
		return ret;

	}

	res.find_product = function(name) {
		let products = this.products;
		let ret = null;
		for (let k in products) {
			let p = products[k];
			if (p.name == name && p.limited == false) { ret = p; break;}
		}
		return ret;
	}
	return res;
}

let InstancesResponse = function(res) {
	for (let k in res) {
		let ins = res[k];
		ins.ssh_command = `ssh root@${ins.ipv4} -p 22 -i ~/.ssh/${ins.ssh_key_file_name}.pem -o ServerAliveInterval=10`;
	}
	return res;
}





var ssh2_console = function(params) {
	let gs = null;
	const conn = new ssh2();
	conn.on('ready', function() {
	  console.log('>> Press enter key');
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
	  privateKey:params.privateKey,
	  keepaliveInterval:30*1000,
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


function _________ssh__________(func) {}
var check_public_key = function(form) { // TODO support other key type.
	return true;
	let s = form.public_key;
	if (s && s.indexOf('ssh-rsa ') == 0) {
		if (s.length < 1000) {
			if (s.replace(/\t|\r|\n/g, "").replace(/[a-zA-Z0-9]|\/|-|\+| |\.|@/g, "") == 0) {
				return true;
			}
		}
	}
	return false;
}


function ssh_key_list(func) { func_get("/console/servers/ssh_keys",(e,res)=>{func(e,res)}, [], {}); }
function generate_ssh_key(func) { func_get("/console/servers/ssh_key_gen",(e,res)=>{func(e,res)}, [], {}); }
function register_ssh_key(form,func) { if (!check_public_key()) { func(`Invalid key`);return;} func_post("/console/servers/register_ssh_key",(e,res)=>{func(e,res)}, ["name","public_key"], form); }
function delete_ssh_key(form,func) { func_post("/console/servers/delete_ssh_key",(e,res)=>{func(e,res)}, ["id"], form); }
var test_ssh_key = function() {
	const async = require('async');
	async.waterfall([
		function(callback) {
			ssh_key_list((e,s)=>{
				async.eachSeries(s,function(it,callback){
					if (it.name == "nodejs_ssh_key") {
						delete_ssh_key({id:it.id},(e,s)=>{callback(e)});
					} else {
						callback();
					}
				},function(e,s){
					callback(e);
				});
			});
		},
		function(callback) {
			generate_ssh_key((e,s)=>{
				dir([e,s]);
				if (!e) {
					let fpath = path.join(HOME,'.ssh','nodejs_ssh_key.pem');
					fs.writeFileSync(fpath,s.private_key);
					register_ssh_key({name:"nodejs_ssh_key", public_key:s.public_key},(e,s)=>{ callback(e||s.error); });
				} else {
					callback(e)
				}
			});
		},
		function(callback) {
			ssh_key_list((e,s)=>{dir([e,s]);callback(e)});
		},
	],function(e,s) {
		if (e) err(e);
	});
}

function _________image__________(func) {}
function image_list(func) { func_get("/console/servers/images",(e,res)=>{func(e,res)}, [], {}); }
function registered_image_list(func) { func_get("/console/servers/registered_image_list",(e,res)=>{func(e,res)}, [], {}); }
function snapshot_instance(form,func) { func_post("/console/servers/snapshot_instance",(e,res)=>{func(e,res)}, ["instance_id"], form); }
function delete_snapshot(form,func) { func_post("/console/servers/delete_snapshot",(e,res)=>{func(e,res)}, ["snapshot_id"], form); }
function snapshot_list(form,func) { func_get("/console/servers/snapshot_list",(e,res)=>{func(e,res)}, ["instance_id"], form); }
function restore_from_snapshot(form,func) { func_post("/console/servers/restore_from_snapshot",(e,res)=>{func(e,res)}, ["instance_id","snapshot_id"], form); }
function create_image(form,func) { func_post("/console/servers/create_user_defined_image",(e,res)=>{func(e,res)}, ["instance_id","image_name"], form); }
function register_image(form,func) { func_post("/console/servers/register_image",(e,res)=>{func(e,res)}, ["url","image_name"], form); }
function delete_image(form,func) { func_post("/console/servers/delete_user_defined_image",(e,res)=>{func(e,res)}, ["fingerprint"], form); }
var test_image = function() {
	image_list((e,s)=>{dir([e,s])});
}


function _________instance__________(func) {}
function ondemand_list(func) { func_get("/console/servers/ondemand_launch_list",(e,res)=>{func(e,ResponseProduct(res))}, [], {}); }
function launch_ondemand_instance(form,func) { func_post("/console/servers/launch_ondemand_instance",(e,res)=>{func(e,res)}, ["product_id","image","ssh_key_id","tag"], form); }
function subscription_list(func) { func_get("/console/servers/subscription_launch_list",(e,res)=>{func(e,ResponseProduct(res))}, [], {}); }
function launch_subcription_instance(form,func) { func_post("/console/servers/launch_subscription_instance",(e,res)=>{func(e,res)}, ["product_id","subscription_id","image","ssh_key_id","tag"], form); }
function instance_list(func) { func_get("/console/servers/instance_list",(e,res)=>{func(e,InstancesResponse(res))}, [], {}); }
function change_instance_tag(form,func) { func_post("/console/servers/change_instance_tag",(e,res)=>{func(e,res)}, ["instance_id","tag"], form); }
function start_instance(form,func) { func_post("/console/servers/start",(e,res)=>{func(e,res)}, ["instance_id","machine_resource_id"], form); }
function stop_instance(form,func) { func_post("/console/servers/stop",(e,res)=>{func(e,res)}, ["instance_id","machine_resource_id"], form); }
function restart_instance(form,func) { stop_instance(form,(e,s)=>{if (e) func(e); else {start_instance(form,func);} }); }
function terminate_instance(form,func) { func_post("/console/servers/force_terminate",(e,res)=>{func(e,res)}, ["instance_id","machine_resource_id"], form); }
function emergency_restart_instance(form,func) { func_post("/console/servers/emergency_restart",(e,res)=>{func(e,res)}, ["instance_id","machine_resource_id"], form); }
var test_instance = function() {
	const async = require('async');
	async.waterfall([
		function(callback) {
			instance_list((e,s)=>{
				async.eachSeries(s,(o,callback)=>{
					terminate_instance(o,(e,s)=>{callback(e)});
				},function(e,s) {
					callback(e,s)
				});
			});
		},
		function(s,callback) {
			ondemand_list((e,s)=>{
				callback(e,s);
			});
		},
		function(s,callback) {
			let ssh_key = s.find_ssh_key("nodejs_ssh_key");
			let image = s.find_image("Ubuntu16.04 x64");
			let product = s.find_product("n1.p400");
			let tag = "HogeHoge";
			dir(ssh_key);
			dir(image);
			dir(product);
			launch_ondemand_instance({ssh_key_id:ssh_key.id, image:image.alias, product_id:product.id, tag:tag},(e,s)=>{
				callback(e,s);
			});
		},
		function(s,callback) {
			instance_list((e,s)=>{callback(e,s)});
		},
		function(s,callback) {
			stop_instance(s[0],(e,res)=>{
				callback(e,s);
			});
		},
		function(s,callback) {
			start_instance(s[0],(e,res)=>{
				callback(e,s);
			});
		},
		function(s,callback) {
			instance_list((e,s)=>{callback(e,s)});
		},
	],function(e,s) {
		dir([e,s]);
	});
}
var test_instance2 = function() {
	instance_list((e,s)=>{
		dir([e,s]);
	});
}

function _________network__________(func) {}
function port_list(form,func) { func_get("/console/servers/port_list",(e,res)=>{func(e,res)}, ["instance_id","connection_id"], form); }
function open_port(form,func) { func_post("/console/servers/add_port",(e,res)=>{func(e,res)}, ["instance_id","connection_id","port"], form); }
function close_port(form,func) { func_post("/console/servers/delete_port",(e,res)=>{func(e,res)}, ["instance_id","connection_id","port"], form); }
function renew_ipv4(form,func) { func_post("/console/servers/renew_ipv4",(e,res)=>{func(e,res)}, ["instance_id"], form); }
function refresh_ipv4(form,func) { func_post("/console/servers/refresh_ipv4",(e,res)=>{func(e,res)}, ["instance_id"], form); }
function network_description(form,func) { func_get("/console/servers/instance_info",(e,res)=>{func(e,res)}, ["instance_id"], form); }
var test_network = function() {
	const async = require('async');
	async.waterfall([
		function(callback) {
			instance_list((e,s)=>{
				let ins = s[0];
				callback(e,ins);
			});
		},
		function(ins,callback) {
			port_list(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			ins.port = 9999;
			open_port(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			port_list(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			ins.port = 9999;
			close_port(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			port_list(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			network_description(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
	],function(e,s) {
		info("Done.");
	});
}
var test_network2 = function() {
	const async = require('async');
	async.waterfall([
		function(callback) {
			instance_list((e,s)=>{
				let ins = s[0];
				callback(e,ins);
			});
		},
		function(ins,callback) {
			renew_ipv4(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			network_description(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
	],function(e,s) {
		info("Done.");
	});
}
var test_network3 = function() {
	const async = require('async');
	async.waterfall([
		function(callback) {
			instance_list((e,s)=>{
				let ins = s[0];
				callback(e,ins);
			});
		},
		function(ins,callback) {
			refresh_ipv4(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
		function(ins,callback) {
			network_description(ins,(e,s)=>{
				dir(s);
				callback(e,ins);
			});
		},
	],function(e,s) {
		info("Done.");
	});
}

function _________storage__________(func) {}
function create_volume(form,func) { func_post("/console/servers/create_volume",(e,res)=>{func(e,res)}, ["region_id","storage_type","volume"], form); }
function delete_volume(form,func) { func_post("/console/servers/delete_volume",(e,res)=>{func(e,res)}, ["volume_id"], form); }
function attach_volume(form,func) { func_post("/console/servers/attach_volume",(e,res)=>{func(e,res)}, ["volume_id","instance_id"], form); }
function detach_volume(form,func) { func_post("/console/servers/detach_volume",(e,res)=>{func(e,res)}, ["volume_id"], form); }
function transfer_volume(form,func) { func_post("/console/servers/transfer_volume",(e,res)=>{func(e,res)}, ["volume_id","region_id"], form); }

function _________subscription__________(func) {}
function subscription_instance_list(func) { func_get("/console/servers/plan_list_v1",(e,res)=>{func(e,res)}, [], {}); }
function subscription_storage_list(func) { throw "Not supported yet"; }
function subscription_network_list(func) { throw "Not supported yet"; }
function subscribed_list(func) { func_get("/console/servers/subscribed_list",(e,res)=>{func(e,res)}, [], {}); }
function subscribe_instance(form,func) { func_post("/console/servers/subscribe",(e,res)=>{func(e,res)}, ["subscription_id"], form); }
function unsubscribe_instance(form,func) { func_post("/console/servers/unsubscribe_for_admin",(e,res)=>{func(e,res)}, ["subscription_id"], form); }
function subscribe_storage(func) { throw "Not supported yet"; }
function unsubscribe_storage(func) { throw "Not supported yet"; }
function subscribe_network(func) { throw "Not supported yet"; }
function unsubscribe_network(func) { throw "Not supported yet"; }

function _________special__________(func) {}
function live_migration(form,func) { func_post("/console/servers/live_migration",(e,res)=>{func(e,res)}, ["instance_id","connection_id","product_id","region_id","ssh_key_id","tag"], form); }
function live_migration_for_admin(form,func) { func_post("/console/servers/live_migration_for_admin",(e,res)=>{func(e,res)}, ["instance_id","connection_id","product_id","region_id","ssh_key_id","tag","machine_resource_id"], form); }
function cancel_transaction(form,func) { func_post("/console/servers/cancel_transaction",(e,res)=>{func(e,res)}, ["transaction_id"], form); }
function peak_transaction(form,func) { func_post("/console/servers/peak_transaction",(e,res)=>{func(e,res)}, ["transaction_id"], form); }

function _________payment__________(func) {}
function invoice_list(func) { func_get("/console/servers/charge_list",(e,res)=>{func(e,res)}, [], {}); }
function subscription_invoice_list(func) { func_get("/console/servers/invoice_list",(e,res)=>{func(e,res)}, [], {}); }
function card_list(func) { func_get("/console/servers/card_list",(e,res)=>{func(e,res)}, [], {}); }
function has_available_card(func) { func_get("/console/servers/has_available_card",(e,res)=>{func(e,res)}, [], {}); }
function register_card(form,func) { func_post("/console/servers/register_card",(e,res)=>{func(e,res)}, ["card_id","number","exp_month","exp_year","cvc"], form); }
function delete_card(form,func) { func_post("/console/servers/delete_card",(e,res)=>{func(e,res)}, ["card_id"], form); }
function make_invoice(form,func) { throw "Not supported yet"; }
var test_payment = function() {
	invoice_list((e,s)=>{dir([e,s]);});
}




function _________administrator__________(func) {}
function image_list_for_admin(func) { func_get("/console/servers/image_list_for_admin",(e,res)=>{func(e,res)}, [], {}); }
function machine_resource_list_for_admin(func) { func_get("/console/servers/machine_resource_list_for_admin",(e,res)=>{func(e,res)}, [], {}); }
function instance_list_for_admin(func) { func_get("/console/servers/instance_list_for_admin",(e,res)=>{func(e,res)}, [], {}); }
function products_for_admin(func) { func_get("/console/servers/product_list_for_admin",(e,res)=>{func(e,res)}, [], {}); }
function launch_as_admin(form,func) { func_post("/console/servers/launch_as_admin",(e,res)=>{func(e,res)}, ["product_id","ssh_key_id","image","tag"], form); }
function assign_instance_for_admin(form,func) { func_post("/console/servers/assign_instance_for_admin",(e,res)=>{func(e,res)}, ["instance_id","user_id"], form); }
function assign_network_for_admin(form,func) { func_post("/console/servers/assign_network_for_admin",(e,res)=>{func(e,res)}, ["instance_id","connection_id"], form); }
function create_distribution_image_for_admin(form,func) { func_post("/console/servers/assign_network_for_admin",(e,res)=>{func(e,res)}, ["instance_id","connection_id"], form); }
function distribute_image_for_admin(form,func) { func_post("/console/servers/assign_network_for_admin",(e,res)=>{func(e,res)}, ["instance_id","connection_id"], form); }
function login_nodes_for_admin(form,func) { func_post("/console/servers/assign_network_for_admin",(e,res)=>{func(e,res)}, ["instance_id","connection_id"], form); }
var test_admin = function() {
	//image_list_for_admin((e,s)=>{dir([e,s])});
	try { execSync(`cp ~/.ssh/config ~/.ssh/_bk_`); } catch (e) {}
	machine_resource_list_for_admin((e,s)=>{
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
}



function _________extensions__________(func) {}
var check_params = function(form,required_fields,func) { for (let k in required_fields) { if (!(required_fields[k] in form)) { func(`Required field => ${required_fields[k]}`); return false; } }  return true;}
var check_con_params = function(form,func) {
	if (!(form.host||form.ipv4||form.ipv6)) {func(`Required parameter => host or ipv4 or ipv6`);return false;}
	if (!(form.user||form.sshd_user)) {func(`Required parameter => user or sshd_user`);return false;}
	if (!(form.port||form.sshd_port)) {func(`Required parameter => port or sshd_port`);return false;}
	if (!(form.private_key||form.private_key_file||form.ssh_key_file_name)) {func(`Required parameter => private_key or private_key_file or ssh_key_file_name`);return false;}
	return true;
}
function copy_file(form,func) {
	if (!check_con_params(form,func)) return;
	if (!(form.src)) {func(`Required parameter => src`);return;}
	if (!(form.dst)) {func(`Required parameter => dst`);return;}
	try {
		let host = form.host||form.ipv4||form.ipv6; let user = form.user||form.sshd_user; let port = form.port||form.sshd_port;
		let private_key_file = form.private_key_file || (form.ssh_key_file_name?path.join(HOME,".ssh",`${form.ssh_key_file_name}.pem`):null);
		let action = form.action;
		let src = form.src||form.source;
		let dst = form.dst||form.destination;
		// dir(private_key_file)
		if (action == "put") {
			execSync(`scp -i "${private_key_file}" -r ${src} ${user}@${host}:${dst}`);
			func(null);
		} else if (action == "get") {
			execSync(`scp -i "${private_key_file}" -r ${user}@${host}:${src} ${dst}`);
			func(null);
		} else {
			func(`Invalid action => ${action}`);
		}
	} catch (e) {
		func(e);
	}
}
function delete_file(form,func) {
	if (!check_con_params(form,func)) return;
	if (!(form.src)) {func(`Required parameter => src`);return;}
	try {
		let host = form.host||form.ipv4||form.ipv6; let user = form.user||form.sshd_user; let port = form.port||form.sshd_port;
		let private_key_file = form.private_key_file || (form.ssh_key_file_name?path.join(HOME,".ssh",`${form.ssh_key_file_name}.pem`):null);
		let src = form.src||form.source;
		execSync(`ssh ${user}@${host} -p ${port} -i "${private_key_file}" "rm -f \"${src}\""`);
	} catch (e) {
		func(e);
	}
}
function make_directory(func) {
	if (!check_con_params(form,func)) return;
	if (!(form.src)) {func(`Required parameter => src`);return;}
	try {
		let host = form.host||form.ipv4||form.ipv6; let user = form.user||form.sshd_user; let port = form.port||form.sshd_port;
		let private_key_file = form.private_key_file || (form.ssh_key_file_name?path.join(HOME,".ssh",`${form.ssh_key_file_name}.pem`):null);
		let src = form.src||form.source;
		execSync(`ssh ${user}@${host} -p ${port} -i "${private_key_file}" "mkdir -p \"${src}\""`);
	} catch (e) {
		func(e);
	}
}
function file_list(func) {
	if (!check_con_params(form,func)) return;
	if (!(form.src)) {func(`Required parameter => src`);return;}
	try {
		let host = form.host||form.ipv4||form.ipv6; let user = form.user||form.sshd_user; let port = form.port||form.sshd_port;
		let private_key_file = form.private_key_file || (form.ssh_key_file_name?path.join(HOME,".ssh",`${form.ssh_key_file_name}.pem`):null);
		let src = form.src||form.source;
		execSync(`ssh ${user}@${host} -p ${port} -i "${private_key_file}" "ls \"${src}\""`);
	} catch (e) {
		func(e);
	}
}
function synchronize_files(func) {throw "Not implemented yet";}
function login_instance(form,func) {
	if (!check_con_params(form,func)) return;
	let host = form.host||form.ipv4||form.ipv6; let user = form.user||form.sshd_user; let port = form.port||form.sshd_port;
	let private_key_file = form.private_key_file || (form.ssh_key_file_name?path.join(HOME,".ssh",`${form.ssh_key_file_name}.pem`):null);
	ssh2_console({privateKey:fs.readFileSync(private_key_file),port:port,user:user,host:host});
}
function tunnel(func) {throw "Not implemented yet";}
var test_extention = function() {
	instance_list((e,s)=>{
		let ins = s[0];
		ins.src = "~/logo.png";
		delete_file(ins,(e,s)=>{dir([e,s])});

		login_instance(ins,(e,s)=>{dir([e,s])});
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
		fs.writeFileSync('./index.js',fstream);
		info(`Generated to index.js.`);
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
	registered_image_list: registered_image_list,
	snapshot_instance: snapshot_instance,
	delete_snapshot: delete_snapshot,
	snapshot_list: snapshot_list,
	restore_from_snapshot: restore_from_snapshot,
	create_image: create_image,
	register_image: register_image,
	delete_image: delete_image,
	_________instance__________: _________instance__________,
	ondemand_list: ondemand_list,
	launch_ondemand_instance: launch_ondemand_instance,
	subscription_list: subscription_list,
	launch_subcription_instance: launch_subcription_instance,
	instance_list: instance_list,
	change_instance_tag: change_instance_tag,
	start_instance: start_instance,
	stop_instance: stop_instance,
	restart_instance: restart_instance,
	terminate_instance: terminate_instance,
	emergency_restart_instance: emergency_restart_instance,
	_________network__________: _________network__________,
	port_list: port_list,
	open_port: open_port,
	close_port: close_port,
	renew_ipv4: renew_ipv4,
	refresh_ipv4: refresh_ipv4,
	network_description: network_description,
	_________storage__________: _________storage__________,
	create_volume: create_volume,
	delete_volume: delete_volume,
	attach_volume: attach_volume,
	detach_volume: detach_volume,
	transfer_volume: transfer_volume,
	_________subscription__________: _________subscription__________,
	subscription_instance_list: subscription_instance_list,
	subscription_storage_list: subscription_storage_list,
	subscription_network_list: subscription_network_list,
	subscribed_list: subscribed_list,
	subscribed_list: subscribed_list,
	subscribe_instance: subscribe_instance,
	unsubscribe_instance: unsubscribe_instance,
	subscribe_storage: subscribe_storage,
	unsubscribe_storage: unsubscribe_storage,
	subscribe_network: subscribe_network,
	unsubscribe_network: unsubscribe_network,
	_________special__________: _________special__________,
	live_migration: live_migration,
	live_migration_for_admin: live_migration_for_admin,
	cancel_transaction: cancel_transaction,
	peak_transaction: peak_transaction,
	_________payment__________: _________payment__________,
	invoice_list: invoice_list,
	subscription_invoice_list: subscription_invoice_list,
	card_list: card_list,
	has_available_card: has_available_card,
	register_card: register_card,
	delete_card: delete_card,
	make_invoice: make_invoice,
	_________administrator__________: _________administrator__________,
	image_list_for_admin: image_list_for_admin,
	machine_resource_list_for_admin: machine_resource_list_for_admin,
	instance_list_for_admin: instance_list_for_admin,
	products_for_admin: products_for_admin,
	launch_as_admin: launch_as_admin,
	assign_instance_for_admin: assign_instance_for_admin,
	assign_network_for_admin: assign_network_for_admin,
	create_distribution_image_for_admin: create_distribution_image_for_admin,
	distribute_image_for_admin: distribute_image_for_admin,
	login_nodes_for_admin: login_nodes_for_admin,
	_________extensions__________: _________extensions__________,
	copy_file: copy_file,
	delete_file: delete_file,
	make_directory: make_directory,
	file_list: file_list,
	synchronize_files: synchronize_files,
	login_instance: login_instance,
	tunnel: tunnel,
}
