const JimpImport = require("jimp");
const Jimp = JimpImport.read ? JimpImport : JimpImport.Jimp;
const path = require("path");

const generateMeme = async (text, templateName) => {
  try {
    const imagePath = path.join(__dirname, "../assets/templates", templateName);

    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    image.print(
      font,
      20,
      20,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      image.bitmap.width - 40,
      image.bitmap.height
    );

    return await image.getBufferAsync(Jimp.MIME_JPEG);
  } catch (error) {
    console.error("Meme Generation Error:", error);
    throw error;
  }
};

module.exports = { generateMeme };
