const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const recursive = require('recursive-fs');
const basePathConverter = require('base-path-converter');

const src = './src';
const pinata_url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const cloudflare_url = 'https://api.cloudflare.com/client/v4';
const pinata_token = process.env.PINATA_CLOUD_TOKEN; // Pinata JWT Token
const cloudflare_key = process.env.CLOUDFLARE_KEY; // Cloudflare Global API Key
const cloudflare_email = process.env.CLOUDFLARE_EMAIL; // Cloudflare email for account
const cloudflare_zone = process.env.CLOUDFLARE_ZONE; // Cloudflare zone. eg. 10110110.xyz
const cloudflare_record = process.env.CLOUDFLARE_RECORD; // Cloudflare record. likely _dnslink.10110110.xyz

recursive.readdirr(src, function (err, dirs, files) {
    let data = new FormData();
    files.forEach((file) => {
        data.append(`file`, fs.createReadStream(file), {
            filepath: basePathConverter(src, file)
        });
    });

    data.append('pinataMetadata',JSON.stringify({
            name: cloudflare_zone,
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
                    "name" : cloudflare_record,
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
