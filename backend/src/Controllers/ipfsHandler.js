import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()

export async function uploadToIPFS(data) {
  try {
    if (!data || data.length === 0) {
      throw new Error("Chat log is empty, nothing to upload.");
    }

    const pinataJWT = process.env.PINATA_JWT;
    if (!pinataJWT) {
      throw new Error("PINATA_JWT is missing");
    }

    // Pinata pinJSONToIPFS endpoint
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

    const response = await axios.post(
      url,
      data,
      {
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const cid = response.data.IpfsHash;
    console.log('Uploaded chat log to IPFS with CID:', cid);
    return cid;

  } catch (err) {
    console.error('IPFS upload failed:', err.message);
    console.error('Full error:', err.response?.data || err);
    throw err;
  }
}
