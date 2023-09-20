const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs').promises;
const axios = require('axios');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const extension = file.mimetype === 'application/json' ? '.json' : '.hd5';
        cb(null, `${file.fieldname}-${Date.now()}${extension}`);
    }
});

const upload = multer({ storage: storage }).fields([
    { name: 'file', maxCount: 1 },
    { name: 'modelFile', maxCount: 1 }
]);

const app = express();

app.use(cors({ origin: ['http://localhost:8090'], credentials: true }));


app.post('/upload', upload, async function (req, res, next) {
    try {
        const jsonFile = req.files.file ? req.files.file[0] : null;
        const modelFile = req.files.modelFile ? req.files.modelFile[0] : null;
        const additionalFields = req.body;


        if (jsonFile) {

            const mattermostWebhookUrl = 'https://lmmisld-lmu-stats-slds.srv.mwn.de/hooks/srt4rwmhbfrazritmjqrsqk38e';

            const originalJsonBuffer = await fs.readFile(jsonFile.path);
            const originalJson = JSON.parse(originalJsonBuffer.toString());
            const additionalFields = req.body;

            // If the file has vocabulary_label, append descriptions to it
            if (originalJson.train_model_args && originalJson.train_model_args.vocabulary_label) {
                const vocabDescriptions = JSON.parse(req.body.vocabDescriptions);
                originalJson.train_model_args.vocabulary_label = originalJson.train_model_args.vocabulary_label.map(label => ({
                    label,
                    description: vocabDescriptions[label] || ''
                }));
            }

            // Merge additional fields into the JSON object
            const mergedJson = { ...originalJson, ...additionalFields };

            const notificationText = `Model uploaded by ${additionalFields.developerName} (${additionalFields.developerEmail}).`;
  
            const mattermostPayload = {
                text: notificationText,
                props: {
                  attachments: [
                    {
                      pretext: "Final Combined JSON",
                      text: JSON.stringify(mergedJson, null, 2),
                    }
                  ]
                }
            }

            // Save the merged JSON object back to disk
            await fs.writeFile(jsonFile.path, JSON.stringify(mergedJson, null, 2));

        await axios.post(mattermostWebhookUrl, mattermostPayload);
        }

        if (modelFile) {
            // Implement any logic to process the model file, if needed
        }



        res.status(200).send('File and data processed.');
    } catch (error) {
        console.log(`Exception: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, '0.0.0.0', function () {
    console.log('File upload service listening on port 3000!');
});
