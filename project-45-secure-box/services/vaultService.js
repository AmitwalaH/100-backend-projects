const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./cryptoService");

const vaultPath = path.join(__dirname, "../data/vault.json");

const saveSecret = (title, plainText) => {
  const encryptedObj = encrypt(plainText);
  let vault = {};

  if (fs.existsSync(vaultPath)) {
    const fileContent = fs.readFileSync(vaultPath, "utf8");
    
    // Only parse if the file is NOT empty
    if (fileContent.trim().length > 0) {
      try {
        vault = JSON.parse(fileContent);
      } catch (e) {
        console.error("Corrupt JSON, resetting vault.");
        vault = {};
      }
    }
  }

  // Add or update the secret
  vault[title] = { id: Date.now(), title, ...encryptedObj };
  
  // Write it back
  fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2));
};

const getSecret = (title) => {
  if (!fs.existsSync(vaultPath)) throw new Error("Vault empty");
  
  const fileContent = fs.readFileSync(vaultPath, "utf8");
  if (!fileContent) throw new Error("Vault is empty");
  
  const vault = JSON.parse(fileContent);
  const entry = vault[title];
  
  if (!entry) return null;
  
  return decrypt(entry);
};

module.exports = { saveSecret, getSecret };