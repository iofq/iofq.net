# iofq.net

## Concept

We're using IPFS, [pinata.cloud](https://pinata.cloud/), and Cloudflare's DNS to effectively obtain free\* static site web hosting for our website.

First, we build a multipart form-data POST request to Pinata that encompasses the `./src` directory of our project. We upload this to Pinata via their API, which returns a valid IPFS hash pointing to the directory. We then use Cloudflare's API to update the (previously setup) [Dnslink DNS record](https://docs.ipfs.io/concepts/dnslink/) to our new hash value. It takes a few minutes for Cloudflare to retrieve the new files from Pinata upon first accessing the site, but otherwise our site is live!

## How can I get free static web hosting, too?
To copy it, you'll need a few things setup.

+ Github Secrets set in the repository for the following:
    + PINATA_CLOUD_TOKEN: A [pinata.cloud](https://pinata.cloud) JWT Token
    + CLOUDFLARE_KEY: A Cloudflare Global API Token
    + CLOUDFLARE_EMAIL: The email address attached to your Cloudflare account
    + CLOUDFLARE_ZONE: The Cloudflare Zone under which your DNS records are maintained
    + CLOUDFLARE_RECORD: The DNS record to update. Likely _dnslink_.domain.com
+ A github repository with your website in a `src/` folder, containing an `index.html`

Finally, copy the `./.github/workflows/pinata.yml` to your project and make a push to master!

\* at the expense of the venture capital funds supporting these two startups
