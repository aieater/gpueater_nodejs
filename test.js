const gpueater = require('./index');

gpueater.ondemand_list((e,res)=>{
    if (e) console.error(e);
    else {
        let image = res.find_image('Ubuntu16.04 x64');
        let ssh_key = res.find_ssh_key('brain_master_key');
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
        });
    }
});
