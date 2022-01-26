const { create } = require('ipfs-http-client');

async function saveText() {
    let client = create({host: 'ipfs.infura.io', port: 5001, protocol:'https'});
    let fileAdded = await client.add('Hello world!');
    console.log(fileAdded);
    console.log(fileAdded.path);
}

saveText();