const { create } = require('ipfs-http-client');

const message = 'Hello World!';

async function saveEmailToIPFS(message) {
    let metaData = '{"message": ' + message + '}'

    console.log(metaData);

    let ipfsClient = create({host: 'ipfs.infura.io', port: 5001, protocol:'https'});
    let fileAdded = await ipfsClient.add(metaData);
    console.log(fileAdded.path);
    return fileAdded.path;
}

saveEmailToIPFS(message);