const { ethereum } = window;
global.Buffer = require("safe-buffer").Buffer; // fixes broken ethereumjs-util import
const { encrypt } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");

// Pinata API auth keys
const PINATA_API_KEY = "3227431def127586a57c";
const PINATA_API_SECRET = "c0743cd0b9b140ab4bfd1658b9a01aa0d930a80c200771d9947aab00a5bc2271";

///
/// Construct and upload message metadata to IPNS
/// Optional pubKey can be provided for encryption
/// (must be coming from recipient's Metamask)
///
export async function storeMetadata(message, pubKey) {
  let uid = Math.round(Math.random() * 10000000);

  let metadata = {
    name: "Mail Message",
    image:
      "https://icons-for-free.com/iconfiles/png/512/e+mail+email+letter+mail+message+send+icon-1320191653632976617.png",
    external_url: "https://onchainmail.io",
    description: `This message can be viewed by the recipient at https://onchainmail.io`,
  };

  if (pubKey)
    metadata["encrypted_content"] = await _uploadToIPNS(
      `ocm-${uid}-content`,
      bufferToHex(
        Buffer.from(JSON.stringify(_encryptMessage(message, pubKey)), "utf-8")
      )
    );
  else
    metadata["plain_content"] = await _uploadToIPNS(
      `ocm-${uid}-content`,
      message
    );

  return await _uploadToIPNS(
    `ocm-${uid}-metadata.json`,
    JSON.stringify(metadata)
  );
}

///
/// Retrieve message content
///
export async function getMessageData(metadataHash) {
  let metadata = await (
    await fetch("https://ipfs.io/ipfs/" + metadataHash)
  ).json();

  if (metadata.plain_content)
    return {
      image: metadata.image,
      content: await (
        await fetch("https://ipfs.io/ipfs/" + metadata.plain_content)
      ).text(),
    };
  else if (metadata.encrypted_content)
    return {
      image: metadata.image,
      content: await _decryptMessage(
        await (
          await fetch("https://ipfs.io/ipfs/" + metadata.encrypted_content)
        ).text()
      ),
    };
  else throw "No message content";
}

///
/// Retrieves encryption public key from user's Metamask
///
export async function retrieveEncryptionPublicKey(address) {
  return ethereum.request({
    method: "eth_getEncryptionPublicKey",
    params: [address],
  });
}

/// -------------------------------------------------------------
/// Internal functions
/// -------------------------------------------------------------

///
/// Uploads & pins `content` with `name` to IPNS (via Pinata API)
///
async function _uploadToIPNS(name, content) {
  let data = new FormData();
  data.append("file", new Blob([content]));
  data.append("pinataMetadata", JSON.stringify({ name: name }));

  return (
    await (
      await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: data,
      })
    ).json()
  ).IpfsHash;
}

///
/// Decrypts message (will trigger Metamask API call)
///
async function _decryptMessage(encryptedMessage) {
  return await ethereum.request({
    method: "eth_decrypt",
    params: [encryptedMessage, ethereum.selectedAddress],
  });
}

///
/// Ecrypts message (needs Metamask-compatible public key)
/// The public key can be obtained with retrieveEncryptionPublicKey()
///
function _encryptMessage(message, pubKey) {
  return encrypt(pubKey, { data: message }, "x25519-xsalsa20-poly1305");
}

// storeMetadata("Hello world!", "TPHdZEoxCu9GT1VAsnDDQkoCqvISGCxPZ/P8Gb7DCwU=").then(console.log)

// getMessageData('QmPoEhjbmcapt38QpUKNFH7LrsYsiYdDbHE7X5rkXTnG2C').then(console.log)
