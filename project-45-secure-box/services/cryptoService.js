const crypto = require("crypto");
const algorithm = "aes-256-cbc";

const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.SECRET_KEY)
  .digest();

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

const decrypt = (encryptedObj) => {
  const iv = Buffer.from(encryptedObj.iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);

  let decrypted = decipher.update(encryptedObj.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
