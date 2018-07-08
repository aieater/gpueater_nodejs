# GPUEater API Console

## Getting Started
GPUEater is a cloud computing service focusing on Machine Learning and Deep Learning. Now, AMD Radeon GPUs and NVIDIA Quadro GPUs are available. 

This document is intended to describe how to set up this API and how to control your instances through this API.

Before getting started, register your account on GPUEater.
https://www.gpueater.com/

### Prerequisites
1. NodeJS 8.x is required to run GPUEater API console.
2. Create a JSON file in accordance with the following instruction.

At first, open your account page(https://www.gpueater.com/console/account) and copy your access_token. The next, create a JSON file on ~/.eater

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
* At this time, permission control for each token is not available. Still in development.

### Installing GPUEater API on your system

Install GPUEater API
```
npm install gpueater
```

## Run GPUEater API

Before launching an instance, you need to decide product, ssh key, OS image. Get each info with the following APIs.

#### Get available on-demand product list

This API returns current available on-demand products.
```
const gpueater = require('gpueater');

gpueater.ondemand_list((e,res)=>{
    if (e) console.error(e);
    else {
        console.dir(res);
    }
});
```
#### Get registered ssh key list

This API returns your registered ssh keys.
```
const gpueater = require('gpueater');

gpueater.ssh_keys((e,res)=>{
    if (e) console.error(e);
    else {
        console.dir(res);
    }
});
```

#### Get OS image list

This API returns available OS images.
```
const gpueater = require('gpueater');

gpueater.image_list((e,res)=>{
    if (e) console.error(e);
    else {
        console.dir(res);
    }
});
```

#### Instance launch

Specify product, OS image, and ssh_key for instance launching. 

```
const gpueater = require('gpueater');

gpueater.ondemand_list((e,res)=>{
    if (e) console.error(e);
    else {
        let image = res.find_image('Ubuntu16.04 x64');
        let ssh_key = res.find_ssh_key('master_key');
        let product = res.find_product('a1.vegafe');

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
        });
    }
});
```
In the event, the request has succeeded, then the API returns the following empty data.
{data:null, error:null} 

In the event, errors occurred during the instance instantiation process, then the API returns details about the error.

#### Launched instance list

This API returns your launched instance info.
```
const gpueater = require('gpueater');

gpueater.instance_list((e,res)=>{
    if (e) console.error(e);
    else {
        console.dir(res);
    }
});
```
#### Terminate instance

Before terminating an instance, get instance info through Launched instance list API. Also, you can directly specify instance_id and machine_resource_id instead of specifing your tag name.

```
const gpueater = require('gpueater');

gpueater.instance_list((e,res)=>{
    if (e) console.error(e);
    else {
        for (let ins of res.data) {
            if (ins.tag == 'HappyGPUProgramming') {
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
