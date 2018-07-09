# GPUEater Command Line API

## Getting Started
GPUEater is a cloud computing service focusing on Machine Learning and Deep Learning. Now, AMD Radeon GPUs and NVIDIA Quadro GPUs are available.

This document is intended to describe how to set up this API and how to control your instances through this API.

Before getting started, register your account on GPUEater.
https://www.gpueater.com/

### Prerequisites
1. Create a JSON file in accordance with the following instruction.

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
curl -sL http://install.aieater.com/setup_gpueater_client | bash -
```

* We stil don't support API for Windows. Available platforms are Linux and MacOSX.

## Run GPUEater API

Before launching an instance, you need to decide product, ssh key, OS image. Get each info with the following APIs.

#### Get available on-demand product list

This API returns current available on-demand products.
```
johndoe@local:~$ gpueater products
-----------------------------------------------------
 ---- Images ----
 0: AMD-ROCm1.8.118+TensorFlow1.3 Ubuntu16.04 x64
 1: CentOS6 x64
 2: CentOS7 x64
 3: Ubuntu16.04 x64
 4: Ubuntu18.04 x64
-----------------------------------------------------
 ---- SSH Keys ----
 0: my_ssh_key
 1: my_sub_key1
-----------------------------------------------------
 ---- Products ----
 0: a1.rx580   InStock(OK) CPU( 2)  MEM(10240)MB  SSD(  80)GB  $0.3458/h  Radeon RX 580 (8G)                      
 1: a1.vega56  InStock(OK) CPU( 3)  MEM(12288)MB  SSD( 100)GB  $0.4794/h  Radeon RX Vega 56 (8GB)                 
 2: a1.vegafe  InStock(OK) CPU( 4)  MEM(15360)MB  SSD( 120)GB  $0.6164/h  Radeon Vega Frontier Edition (16G)      
 3: n1.p400    InStock(OK) CPU( 1)  MEM( 2048)MB  SSD(  20)GB  $0.0992/h  Quadro P400 (2GB)                       
 4: n1.p600    InStock(OK) CPU( 1)  MEM( 2048)MB  SSD(  20)GB  $0.1058/h  Quadro P600 (2GB)                       
 5: n1.p1000   InStock(OK) CPU( 2)  MEM( 4096)MB  SSD(  40)GB  $0.3306/h  Quadro P1000 (4GB)                      
 6: n1.p4000   InStock(OK) CPU( 4)  MEM(10240)MB  SSD(  80)GB  $0.7936/h  Quadro P4000 (8GB)                      
-----------------------------------------------------
```

#### Instance launch

Specify product, OS image, and ssh_key for instance launching.

```

johndoe@local:~$ gpueater launch
-----------------------------------------------------
 ---- Products ----
 0: a1.rx580   InStock(OK) CPU( 2)  MEM(10240)MB  SSD(  80)GB  $0.3458/h  Radeon RX 580 (8G)                      
 1: a1.vega56  InStock(OK) CPU( 3)  MEM(12288)MB  SSD( 100)GB  $0.4794/h  Radeon RX Vega 56 (8GB)                 
 2: a1.vegafe  InStock(OK) CPU( 4)  MEM(15360)MB  SSD( 120)GB  $0.6164/h  Radeon Vega Frontier Edition (16G)      
 3: n1.p400    InStock(OK) CPU( 1)  MEM( 2048)MB  SSD(  20)GB  $0.0992/h  Quadro P400 (2GB)                       
 4: n1.p600    InStock(OK) CPU( 1)  MEM( 2048)MB  SSD(  20)GB  $0.1058/h  Quadro P600 (2GB)                       
 5: n1.p1000   InStock(OK) CPU( 2)  MEM( 4096)MB  SSD(  40)GB  $0.3306/h  Quadro P1000 (4GB)                      
 6: n1.p4000   InStock(OK) CPU( 4)  MEM(10240)MB  SSD(  80)GB  $0.7936/h  Quadro P4000 (8GB)                      

Product > 2

 Selected => "2: a1.vegafe  InStock(OK) CPU( 4)  MEM(15360)MB  SSD( 120)GB  $0.6164/h  Radeon Vega Frontier Edition (16G)"


-----------------------------------------------------
 ---- Images ----
 0: AMD-ROCm1.8.118+TensorFlow1.3 Ubuntu16.04 x64
 1: CentOS6 x64
 2: CentOS7 x64
 3: Ubuntu16.04 x64
 4: Ubuntu18.04 x64

Image > 0

 Selected => "0: AMD-ROCm1.8.118+TensorFlow1.3 Ubuntu16.04 x64"


-----------------------------------------------------
 ---- SSH Keys ----
 0: my_ssh_key
 1: my_sub_key1

SSH Key > 0

 Selected => "0: my_ssh_key"


{ data: null, error: null }

johndoe@local:~$
```
In the event, the request has succeeded, then the API returns the following empty data.
{data:null, error:null}

In the event, errors occurred during the instance instantiation process, then the API returns details about the error.

#### Launched instance list

This API returns your launched instance info.
```
johndoe@local:~$ gpueater instances
-----------------------------------------------------
 ---- Instances ----
 0: Tag(          ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/my_ssh_key.pem -o ServerAliveInterval=10

johndoe@local:~$
```


#### Login


```
johndoe@local:~$ gpueater login
-----------------------------------------------------
 ---- Instances ----
 0: Tag(          ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10

Login > 0
>> Push enter

root@C-c8cfaf40-80d5-4350-af8e-4901ac52cad5-1:~# ls
based_on_python3_instance  keras_examples     other_samples
check_tensorflow.py        module_checker.py  remote_desktop.txt
deep_learning_yolo_v2      opencl_samples     tensorflow1.3_examples
root@C-c8cfaf40-80d5-4350-af8e-4901ac52cad5-1:~# rocm-smi

```

#### Terminate instance

Before terminating an instance, get instance info through Launched instance list API. Also, you can directly specify instance_id and machine_resource_id instead of specifing your tag name.

```

johndoe@local:~$ gpueater terminate
-----------------------------------------------------
 ---- Instances ----
 0: Tag(          ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/brain_master_key.pem -o ServerAliveInterval=10

Terminate > 0

{ data: {}, error: null }

johndoe@local:~$ gpueater instances
-----------------------------------------------------
 ---- Instances ----

johndoe@local:~$

```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
