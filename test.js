const gpueater = require('./index');

const async = require('async');



// async.waterfall([
// 	(callback)=>{
// 		image_list
// 	},
// 	(callback)=>{
//
// 	}
// ],(e,s)=>{
// 	console.log("done");
// });
//

function func(){}
//instance_description
gpueater.load_config({intaractive:false});
gpueater.invoice_list((e,res)=>{
    if (e) console.error(e);
    else {
    	console.dir(res);
    }
});


// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) { // Stop all
// 			gpueater.renew_ipv4(m,(e,res)=>{
// 			    if (e) console.error(e);
// 			    else {
// 					console.dir(res);
// 			    }
// 				func();
// 			});
// 		}
//     }
// 	func();
// });

// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) {
// 			gpueater.network_description(m,(e,res)=>{
// 			    if (e) console.error(e);
// 				else console.dir(res);
// 			});
// 		}
//     }
// 	func();
// });


// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) { // Open all
// 			m.port = 12345;
// 			gpueater.close_port(m,(e,res)=>{
// 			    if (e) console.error(e);
// 			    else {
// 					console.dir(res);
// 			    }
// 				func();
// 			});
// 		}
//     }
// 	func();
// });

// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) { // Open all
// 			m.port = 12345;
// 			gpueater.open_port(m,(e,res)=>{
// 			    if (e) console.error(e);
// 			    else {
// 					console.dir(res);
// 			    }
// 				func();
// 			});
// 		}
//     }
// 	func();
// });
// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) { // Stop all
// 			gpueater.port_list(m,(e,res)=>{
// 			    if (e) console.error(e);
// 			    else {
// 					console.dir(res);
// 			    }
// 				func();
// 			});
// 		}
//     }
// 	func();
// });


// gpueater.instance_list((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		console.dir(res);
// 		for (let m of res) { // Stop all
// 			gpueater.restart_instance(m,(e,res)=>{
// 			    if (e) console.error(e);
// 				else console.dir(res);
// 			});
// 		}
//     }
// 	func();
// });





// gpueater.machine_resource_list_for_admin((e,res)=>{
//     if (e) console.error(e);
//     else {
// 		for (let m of res) {
// 			console.log(`${m.node_type} : ${m.server_label} : ssh ${m.sshd_user}@${m.network_ipv6?m.network_ipv6:m.network_ipv4} -p ${m.sshd_port} -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10`);
// 		}
// 		// console.dir(res);
//     }
// 	func();
// });


function test() {
	let tasks = [];
	tasks.push((func)=>{
		gpueater.generate_ssh_key((e,res)=>{
		    if (e) { console.error(e); func(e); }
		    else {
				let new_ssh_key_name = 'my_ssh_key';
				let private_key = res.private_key;
				let public_key = res.public_key;
				let homedir = require('os').homedir();
				let key_path = require('path').join(homedir,'.ssh',new_ssh_key_name+".pem");

				require('fs').writeFileSync(key_path,private_key);

				gpueater.register_ssh_key({name:new_ssh_key_name,public_key:public_key},(e,res)=>{
				    if (e) { console.error(e); }
					else {
						console.dir(res);
					}
					func();
				});

		    }
		});
	});
	
	tasks.push((func)=>{
		gpueater.image_list((e,res)=>{
		    if (e) console.error(e);
		    else {
				console.dir(res);
		    }
			func();
		});
	});
	
	tasks.push((func)=>{
		gpueater.ssh_key_list((e,res)=>{
		    if (e) console.error(e);
		    else {
				console.dir(res);
		    }
			func();
		});
	});
	
	tasks.push((func)=>{
		gpueater.ondemand_list((e,res)=>{
		    if (e) { console.error(e); func();}
		    else {
		        let image = res.find_image('Ubuntu16.04 x64');
		        let ssh_key = res.find_ssh_key(MY_SSH_KEY);
		        let product = res.find_product('n1.p400');

		        if (!image) { console.error(`No available image`);return;}
		        if (!ssh_key) { console.error(`No available ssh-key`);return;}
		        if (!product) { console.error(`No available product`);return;}

		        let form = {
		            product_id:product.id,
		            image:image.alias,
		            ssh_key_id:ssh_key.id,
		            tag:`HappyGPUProgramming`,
		        };
		        gpueater.launch_ondemand_instance(form,(e,res)=>{
		            if (e) console.error(e);
		            else {
		                console.dir(res);
		            }
					func();
		        });
		    }
		});
	});
	tasks.push((func)=>{
		gpueater.ssh_key_list((e,res)=>{
		    if (e) console.error(e);
		    else {
				for (let k of res) {
					if (k.name == 'my_ssh_key') {
						gpueater.delete_ssh_key({id:k.id},(e,res)=>{
							if (e) { console.error(e); }
							else { console.dir(res); }
						});
					}
				}
		    }
			func();
		});
	});
	
	// tasks.push((func)=>{
	// 	gpueater.subscription_list((e,res)=>{
	// 	    if (e) console.error(e);
	// 	    else {
	// 			console.dir(res);
	// 	    }
	// 		func();
	// 	});
	// });
	
	function do_test() {
		let t = tasks.shift();
		if (t) {
			t(do_test);
		}
	}
	//do_test();
}


