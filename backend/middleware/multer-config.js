const multer = require('multer');
const sharp = require('sharp');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err || !req.file) {
            return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image ou aucun fichier fourni' });
        }

        const extension = MIME_TYPES[req.file.mimetype];
        if (!extension) {
            return res.status(400).json({ error: 'Format d\'image non pris en charge' });
        }

        const fileName = req.file.originalname.split(' ').join('_') + Date.now() + '.' + extension;
        const outputPath = `images/${fileName}`;

        try {
            await sharp(req.file.buffer)
                .resize(800, 800)
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(outputPath);

            req.file.filename = fileName;
            next();
        } catch {
            res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        }
    });
};
