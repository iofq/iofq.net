const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const recursive = require('recursive-fs');
const basePathConverter = require('base-path-converter');

const src = './src';
const pinata_url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const cloudflare_url = 'https://api.cloudflare.com/client/v4';
const pinata_token = process.env.PINATA_CLOUD_TOKEN;
const cloudflare_key = process.env.CLOUDFLARE_KEY;
const cloudflare_email = process.env.CLOUDFLARE_EMAIL;
const cloudflare_zone = process.env.CLOUDFLARE_ZONE;
const cloudflare_record = process.env.CLOUDFLARE_RECORD;

recursive.readdirr(src, function (err, dirs, files) {
    let data = new FormData();
    files.forEach((file) => {
        data.append(`file`, fs.createReadStream(file), {
            filepath: basePathConverter(src, file)
        });
    });

    data.append('pinataMetadata',JSON.stringify({
            name: 'iofq.net',
            keyvalues: {
            date: Date.now()
            }
        }));

    axios.post(pinata_url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'Authorization' : 'Bearer ' + pinata_token
            }
        }) .then(function (response) {
        const pinata_hash = response.data['IpfsHash'];
        headers = {
            'X-Auth-Key' : cloudflare_key,
            'X-Auth-Email' : cloudflare_email,
            'Content-Type' : "application/json"
        }
        //fetch zone id
        axios.get(cloudflare_url + "/zones?name=" + cloudflare_zone,
            { headers } 
            ).then(function (response) { // fetch dns record id
                var zone_id = response['data']['result'][0]['id']
                return axios.get(cloudflare_url + "/zones/" + zone_id + "/dns_records?name=" + cloudflare_record,
                    { headers }
            ).then(function (response) {
                var record_id = response['data']['result'][0]['id']
                data = {
                    "type" : "TXT",
                    "name" : "_dnslink",
                    "ttl" : 1,
                    "content" : "dnslink=/ipfs/" + pinata_hash
                }
                // put hash to cloudflare
                return axios.put(cloudflare_url + "/zones/" + zone_id + "/dns_records/" + record_id, data,
                    { headers }
                ).then(function (response) {
                    console.log(response.data);
                })
            })
        })
    });
});
