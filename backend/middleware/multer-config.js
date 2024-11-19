const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err || !req.file) {
            return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image ou aucun fichier fourni' });
        }

        const fileName = req.file.originalname.split(' ').join('_') + Date.now() + '.webp';
        const outputPath = `images/${fileName}`;

        try {
            await sharp(req.file.buffer)
                .resize(800, 800)
                .toFormat('webp')
                .toFile(outputPath);

            req.file.filename = fileName;
            next();
        } catch {
            res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        }
    });
};

