# GPUEater Console API




## Getting Started

Register your account on GPUEater.
https://www.gpueater.com/


### Prerequisites

Prepare JSON config to ~/.eater like this.

Visit to account page(https://www.gpueater.com/console/account) and make sure your application key.

```
{
        "gpueater": {
                "access_token":"[YourAccessToken]",
                "secret_token":"[YourSecretToken]"
        }
}
```

or

```
{
        "gpueater": {
                "email":"[YourEmail]",
                "password":"[YourPassword]"
        }
}
```
If you make config as specified account, you can control all as administrator.
For now, access token style and specified account style are same.
We will provide access permission by token in future, and then it will be have important meaning for security.

### Installing

We supported NodeJS 8.x+ API.

```
npm install gpueater
```


## Usage

#### Product list for on-demand

You can make sure what on-demand type is supported.
This API also provide registered SSH key and default OS image list.
```
const gpueater = require('gpueater');

gpueater.ondemand_list((e,res)=>{
	if (e) console.error(e);
	else {
		console.dir(res);
	}
});
```

The response object has finder API like this.
```
let image = res.find_image('Ubuntu16.04 x64');
let ssh_key = res.find_ssh_key('registered_my_key');
let product = res.find_product('a1.vegafe');
```
It will be needed information when you launch an instance.


#### Registered ssh key list

```
const gpueater = require('gpueater');

gpueater.ssh_keys((e,res)=>{
	if (e) console.error(e);
	else {
		console.dir(res);
	}
});
```

#### Default OS image list

```
const gpueater = require('gpueater');

gpueater.image_list((e,res)=>{
	if (e) console.error(e);
	else {
		console.dir(res);
	}
});
```

#### Launched instance list

```
const gpueater = require('gpueater');

gpueater.instance_list((e,res)=>{
	if (e) console.error(e);
	else {
		console.dir(res);
	}
});
```



#### Launch

You have to specify product_id, image alias, ssh_key_id as form field.
This API returns empty data like this, when that was successfully.
{data:null, error:null}
If that instance got an error, the response has something error information on error property.

```
const gpueater = require('gpueater');

gpueater.ondemand_list((e,res)=>{
	if (e) console.error(e);
	else {
		let image = res.find_image('Ubuntu16.04 x64');
		let ssh_key = res.find_ssh_key('registered_my_key');
		let product = res.find_product('a1.vega56');

		if (!image) { console.error(`No available image`);return;}
		if (!ssh_key) { console.error(`No available ssh-key`);return;}
		if (!product) { console.error(`No available product`);return;}

		let form = {
			product_id:product.id,
			image:image.alias,
			ssh_key_id:ssh_key.id,
			tag:`johndoe`,
		};
		gpueater.launch_ondemand_instance(form,(e,res)=>{
			if (e) console.error(e);
			else {
				console.dir(res);
			}
		});
	}
});
```


#### Terminate instance

If you want to terminate any instance, at first, get instance list and then, specify instance.
Required fields are instance_id and machine_resource_id.

```
const gpueater = require('gpueater');

gpueater.instance_list((e,res)=>{
	if (e) console.error(e);
	else {
		for (let ins of res.data) {
			if (ins.tag == 'johndoe') {
				console.dir(ins);
				gpueater.terminate_instance(ins,(e,res)=>{
					if (e) console.error(e);
					else {
						console.dir(res);
					}
				});
			}
		}
	}
});
```




## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
