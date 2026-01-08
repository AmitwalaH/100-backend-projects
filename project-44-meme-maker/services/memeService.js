const Jimp = require("jimp");
const path = require("path");

const generateMeme = async (text, templateName) => {
  try {
    const imagePath = path.join(__dirname, "../assets/templates", templateName);

    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    const maxWidth = image.bitmap.width - 40;
    const maxHeight = image.bitmap.height;

    image.print(
      font,
      20,
      20,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      maxWidth,
      maxHeight
    );

    return await image.getBufferAsync(Jimp.MIME_JPEG);
  } catch (error) {
    console.error("Meme Generation Error:", error.message);
    throw error;
  }
};

module.exports = { generateMeme };
