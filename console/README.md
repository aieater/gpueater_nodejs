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
 1: AMD-ROCm1.8.192+TensorFlow1.8 Ubuntu16.04 x64
 2: CentOS6 x64
 3: CentOS7 x64
 4: NVIDIA-390+CUDA9.0 Ubuntu16.04 x64
 5: Ubuntu16.04 x64
 6: Ubuntu18.04 x64
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
 1: AMD-ROCm1.8.192+TensorFlow1.8 Ubuntu16.04 x64
 2: CentOS6 x64
 3: CentOS7 x64
 4: NVIDIA-390+CUDA9.0 Ubuntu16.04 x64
 5: Ubuntu16.04 x64
 6: Ubuntu18.04 x64

Image > 0

 Selected => "1: AMD-ROCm1.8.192+TensorFlow1.8 Ubuntu16.04 x64"


-----------------------------------------------------
 ---- SSH Keys ----
 0: my_ssh_key
 1: my_sub_key1

SSH Key > 0

 Selected => "0: my_ssh_key"

Tag > GPUSteak                

Launching...
.
.
.
null

johndoe@local:~$
```
In the event, the request has succeeded, then the API returns the following empty data.
null

In the event, errors occurred during the instance instantiation process, then the API returns details about the error.

#### Launched instance list

This API returns your launched instance info.
```
johndoe@local:~$ gpueater instances
-----------------------------------------------------
 ---- Instances ----
 0: Tag(GPUSteak ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/my_ssh_key.pem -o ServerAliveInterval=10

johndoe@local:~$
```


#### Login


```
johndoe@local:~$ gpueater login
-----------------------------------------------------
 ---- Instances ----
 0: Tag(          ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/my_ssh_key.pem -o ServerAliveInterval=10

Login > 0

root@C-c8cfaf40-80d5-4350-af8e-4901ac52cad5-1:~# ls
based_on_python3_instance  keras_examples     other_samples
check_tensorflow.py        module_checker.py  remote_desktop.txt
deep_learning_yolo_v2      opencl_samples     tensorflow1.3_examples

```

#### Terminate instance

Before terminating an instance, get instance info through Launched instance list API. Also, you can directly specify instance_id and machine_resource_id instead of specifing your tag name.

```

johndoe@local:~$ gpueater terminate
-----------------------------------------------------
 ---- Instances ----
 0: Tag(          ) a1.vegafe  CPU( 4)  MEM(15360)MB  SSD( 120)GB  $null/h  Radeon Vega Frontier Edition (16G)      
    ssh root@172.105.219.37 -p 22 -i ~/.ssh/my_ssh_key.pem -o ServerAliveInterval=10

Terminate > 0

{}

johndoe@local:~$ gpueater instances
-----------------------------------------------------
 ---- Instances ----

johndoe@local:~$

```



#### Intaractive command
```
[Command] [Action] [Args...]

  Example
   > gpueater products


          __________images__________
  0 :                         images : Listing default OS images.
  1 :              registered_images : .
  2 :                   create_image : Implementing.
  3 :                   delete_image : Implementing.
         __________ssh_key__________
  4 :                       ssh_keys : Listing registered SSH keys.
  5 :               generate_ssh_key : Just generate RSA key. You have to register after this.
  6 :               register_ssh_key : Register ssh key.
  7 :                 delete_ssh_key : Delete a registered ssh key.
        __________instance__________
  8 :                       products : Listing on-demand products.
  9 :                      instances : Listing launched on-demand instances.
 10 :            change_instance_tag : Change instance tag.
 11 :                         launch : Launch an on-demand instance.
 12 :                      terminate : Terminate an instance.
 13 :                          start : Start an instance.
 14 :                           stop : Stop an instance.
 15 :                        restart : Restart an instance.
 16 :     emergency_restart_instance : Force restart an instance.
         __________network__________
 17 :                      port_list : Listing port maps of instance.
 18 :                      open_port : Register port map.
 19 :                     close_port : Delete port map.
 20 :            network_description : Get a network information of instance.
 21 :                     renew_ipv4 : Assign a new IPv4.
 22 :                   refresh_ipv4 : Refresh IPv4 map of instance.
      __________extensions__________
 23 :                          login : Login to instance.
 24 :                            get : Get a file from host.
 25 :                            put : Put a file to host.
 26 :                            cmd : Do any command on instance.
 27 :                             ls : File list on remote.
 28 :                           sync : Synchronize files via rsync.
 29 :                         tunnel : Port forwarding local to remote.
 30 :                        jupyter : Start jupyter and port forward.
 31 :                        version : Version of client.
 32 :                           help : Display help.

 Action >

```

You can select an action with interactive navigator.
Action type is number or action name.
If you have only one instance, instance selector will be skipped.

```

 Action > login


-----------------------------------------------------
 ---- Instances ----
 0: "GPUSnake  " :    RUNNING :    n1.p400 : CPU 1 : MEM 2048MB : SSD  20GB : "Quadro P400 (2GB)"
    ssh root@107.191.60.187 -p 22 -i ~/.ssh/my_ssh_key.pem -o ServerAliveInterval=10

Welcome to Ubuntu 18.04 LTS (GNU/Linux 4.4.0-124-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 * Meltdown, Spectre and Ubuntu: What are the attack vectors,
   how the fixes work, and everything else you need to know
   - https://ubu.one/u2Know

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

root@C-b3230350-d9ff-4da9-b4b6-dc70691b1f3d-1:~#

```


##### Image
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v0.8  |  images  | Listing all default OS images |
|  v1.5  |  registered_images  |  Listing user defined images |
|  v1.5  |  snapshot_instance  |  Creating a snapshot |
|  v1.5  |  delete_snapshot  |  Deleting a snapshot |
|  v1.5  |  create_image  |  Adding an user defined OS image |
|  v2.0  |  register_image |  Registering an user defined OS image on the internet |
|  v1.5  |  delete_image  |  Deleting an OS image |


##### SSH Key
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v0.8  |  ssh_keys  |  Listing all ssh keys |
|  v1.0  |  generate_ssh_key  |  Generating Key Pair |
|  v1.0  |  register_ssh_key  |  Registering an SSH key |
|  v1.0  |  delete_ssh_key  |  Deleting an SSH key |

##### Instance
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v0.8  |  products  |  Listing all on-demand instances |
|  v0.8  |  launch   |  Launch an on-demand instance |
|  v0.8  |  instances  |  Listing all launched instances |
|  v1.0  |  change_instance_tag |  Changing an instance tag |
|  v1.0  |  start  |  Starting an instance. If the instance is already RUNNING, nothing is going to happen |
|  v1.0  |  stop  |  Stopping an instance. If the instance is already STOPPED, nothing is going to happen |
|  v1.0  |  restart   |  Restarting an instance |
|  v0.8  |  terminate  |  Terminating an instance |
|  v1.0  |  emergency_restart_instance |  Restarting an instance emergently when an instance is hung up |

##### Network
|  Version  |  Action   | Description  |
| ---- | ---- | ---- |
|  v1.0  |  port_list |  Listing all ports |
|  v1.0  |  open_port |  Opening a port for inbound traffic |
|  v1.0  |  close_port |  Closing a port for inbound traffic |
|  v1.0  |  renew_ipv4 |  Getting a new IPv4 address |
|  v1.2  |  refresh_ipv4 |  Refreshing IPv4 map of instance |
|  v1.0  |  network_description |  This API reports current network status information |

##### Storage
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v2.0  |  create_volume |  Creating an extended volume |
|  v2.0  |  attach_volume |  Attaching an extended volume to an instance |
|  v2.0  |  detach_volume |  Detaching an extended volume from an instance |
|  v2.0  |  delete_volume |  Deleting an extended volume |
|  v2.0  |  transfer_volume |  Transfering an extended volume to another region |

##### Subscription
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v2.0  |  subscription_instance_list  |  Listing all items of subscription instance |
|  v2.0  |  subscription_storage_list   |  Listing all items of storages volume for subscription instance |
|  v2.0  |  subscription_network_list  |  Listing all items of subscription networks |
|  v2.0  |  subscribe_instance  |  Subscribing a subscription instance |
|  v2.0  |  unsubscribe_instance  |  Canceling a subscription instance |
|  v2.0  |  subscribe_storage  |  Subscribing a storage volume for subscription instance |
|  v2.0  |  unsubscribe_storage  |  Canceling a storage volume for subscription instance |
|  v2.0  |  subscribe_network  |  Subscribing a network product |
|  v2.0  |  unsubscribe_network  |  Canceling a network product |

##### Special
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v2.5  |  live_migration   |  Moving a running instance between different physical machines without termination |
|  v2.5  |  cancel_transaction   |  Canceling a transaction |
|  v2.5  |  peak_transaction   |  This API reports current status information of a transaction |

##### Payment
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v1.0  |  invoice_list  |  Listing invoices for on-demand instances |
|  v2.0  |  subscription_invoice_list  |  Listing invoices for subscription instances |
|  v1.5  |  make_invoice  |  Obtain a pdf invoice |

##### Extensions
|  Version  |  Action | Description  |
| ---- | ---- | ---- |
|  v1.2  |  get |  Copying a file from remote. |
|  v1.2  |  put |  Copying a file to remote. |
|  v1.2  |  cmd |  Executing an any command on remote. |
|  v1.2  |  ls  |  Listing files in a remote host |
|  v1.2  |  tunnel  |  Port forwarding between local and remote. |
|  v1.2  |  login  | Logging in a specific instance through the SSH |
|  v1.2  |  jupyter  | Starting jupyter on remote with tunneling. This API is available on MacOSX. |
|  v1.0  |  version |  Display version. |
|  v1.0  |  help |  Display help. |


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
