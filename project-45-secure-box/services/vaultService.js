const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./cryptoService");

const vaultPath = path.join(__dirname, "../data/vault.json");

const saveSecret = (title, plainText) => {
  const encryptedObj = encrypt(plainText);
  let vault = {};

  if (fs.existsSync(vaultPath)) {
    const data = fs.readFileSync(vaultPath, "utf8");
    vault = JSON.parse(data);
  }

  vault[title] = { id: Date.now(), title, ...encryptedObj };
  fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2));
};

const getSecret = (title) => {
  if (!fs.existsSync(vaultPath)) {
    throw new Error("Vault is empty");
  }

  const data = fs.readFileSync(vaultPath, "utf8");
  const vault = JSON.parse(data); 
  const entry = vault[title];

  if (!entry) {
    throw new Error("Entry not found");
  }

  return decrypt(entry);
};

module.exports = { saveSecret, getSecret };
