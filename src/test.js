const { create } = require('ipfs-http-client');

const message = 'Hello World!';

async function saveEmailToIPFS(message) {
   let metaData = '{"message": ' + message + '}'

    console.log(metaData);

    let fileAdded = { path: '' };
    let ipfsClient = create({host: 'ipfs.infura.io', port: 5001, protocol:'https'});
    console.log('Create client')
    try {
      fileAdded = await ipfsClient.add(metaData);
    } 
    catch (error) {
      console.log('Err:', error);
    }
    console.log(fileAdded.path);
    return fileAdded.path;
}

saveEmailToIPFS(message);
