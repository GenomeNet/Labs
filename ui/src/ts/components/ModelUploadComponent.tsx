import React, { useState, useEffect } from 'react';
import { Button, TextField, Card, CardContent, Typography, Select, MenuItem, Tooltip, FormControl, InputLabel } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import datasets from "../assets/datasets.json";


const ModelUploadComponent: React.FC = () => {

    const [selectedDataset, setSelectedDataset] = useState('');
    const [isSubmitEnabled, setSubmitEnabled] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);

    const cardStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px",
    };

    const descriptionStyle: React.CSSProperties = {
        textAlign: "justify",
        paddingTop: "10px",
        paddingRight: "20px",
    };


    const buttonStyle: React.CSSProperties = {
        marginTop: "20px"  // Padding between button and authors
    };

    const authorsStyle: React.CSSProperties = {
        paddingTop: "20px"
    };

    const [file, setFile] = useState<File | null>(null);
    const [jsonContent, setJsonContent] = useState<Record<string, any> | null>(null);
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [vocabDescriptions, setVocabDescriptions] = useState<{ [key: string]: string }>({});

    // Your original fields here
    const [description, setDescription] = useState<string>('');
    const [developerName, setDeveloperName] = useState<string>('');
    const [developerEmail, setDeveloperEmail] = useState<string>('');
    const [developerInstitution, setDeveloperInstitution] = useState<string>('');
    const [modelLicense, setModelLicense] = useState<string>('');
    const [taskType, setTaskType] = useState<string>('');
    const [doi, setDoi] = useState<string>('');

    useEffect(() => {
        if (jsonContent?.train_model_args?.vocabulary_label) {
            const initialVocabDescriptions: { [key: string]: string } = {};
            jsonContent.train_model_args.vocabulary_label.forEach((label: string) => {
                initialVocabDescriptions[label] = '';
            });
            setVocabDescriptions(initialVocabDescriptions);
        }
    }, [jsonContent]);
    const jsonSummary = jsonContent ? `Keys: ${Object.keys(jsonContent).join(", ")}` : "";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setFile(files[0]);
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const obj = JSON.parse(event.target?.result as string);
                    setJsonContent(obj);
                } catch (e) {
                    console.log('Invalid JSON format');
                }
            };
            reader.readAsText(files[0]);
        }
    };

    const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) setModelFile(files[0]);
    };

    const handleVocabDescriptionChange = (label: string, description: string) => {
        setVocabDescriptions(prev => ({ ...prev, [label]: description }));
    };

    useEffect(() => {
        // Check if all fields are filled out to enable submit button
        if (
          file && modelFile && description && developerName && developerEmail &&
          developerInstitution && modelLicense && taskType && doi
        ) {
          setSubmitEnabled(true);
        } else {
          setSubmitEnabled(false);
        }
      }, [file, modelFile, description, developerName, developerEmail, developerInstitution, modelLicense, taskType, doi]);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            if (modelFile) formData.append('modelFile', modelFile);
            formData.append('description', description);
            formData.append('developerName', developerName);
            formData.append('developerEmail', developerEmail);
            formData.append('developerInstitution', developerInstitution);
            formData.append('modelLicense', modelLicense);
            formData.append('taskType', taskType);
            formData.append('doi', doi);
            formData.append('vocabDescriptions', JSON.stringify(vocabDescriptions));

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                mode: 'cors',
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.text();
                console.log('Server Response:', responseData);
                setShowSuccess(true);
            } else {
                const errorData = await response.text();
                console.log('Error:', errorData);
            }
        } catch (error) {
            console.log('Exception:', error);
        }
    };


    return (
        <Card variant="outlined">
            <CardContent>
                <h2>Upload your model</h2>
                <Typography variant="h6">Extend the reach of your deep learning model by submitting it to GenomeNet's curated repository.</Typography>

                <Typography variant="body1" style={descriptionStyle}>
                Initiate your submission by uploading your Model Card. This document outlines your model's capabilities, performance metrics, and relevant use-cases. Our rigorous validation process ensures that your model meets the highest standards for inclusion in our repository.
                </Typography>

                <Typography variant="body1" style={descriptionStyle}>
                First, upload your metadata JSON file, which accompanies each checkpoint during the training process.
                </Typography>

                <input type="file" accept=".json" onChange={handleFileChange} />


                <Typography variant="body1" style={descriptionStyle}>
                Next, upload your .h5 file. This can be either a checkpoint from the deepG training process or the finalized model.
                </Typography>

                <input type="file" accept=".hd5" onChange={handleModelFileChange} />
                <Typography variant="body1" style={descriptionStyle}>
                Identify the dataset utilized for training your model. If your dataset is not listed, kindly upload it before proceeding with your model submission.
                </Typography>

                <Select
  labelId="dataset-label"
  value={selectedDataset}
  onChange={(e) => setSelectedDataset(e.target.value as string)}
>
  {datasets.map((dataset, index) => (
    <MenuItem key={index} value={dataset.id}>{dataset.title}</MenuItem>
  ))}
</Select>

                <Typography variant="h6" style={{ marginTop: "20px" }}>
                    Developer Information
                </Typography>
                <Typography variant="body1" style={descriptionStyle}>
                To maintain the credibility and traceability of our model database, please provide your basic information. Your institutional affiliation will be publicly disclosed, while all other details will remain confidential for the sole purpose of communication during the validation process.
                </Typography>
                <TextField label="Primary Developer Name" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} fullWidth margin="normal" />
                <TextField label="Primary Developer Email" value={developerEmail} onChange={(e) => setDeveloperEmail(e.target.value)} fullWidth margin="normal" />
                <TextField label="Primary Developer Institution" value={developerInstitution} onChange={(e) => setDeveloperInstitution(e.target.value)} fullWidth margin="normal" />
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                    Model Information
                </Typography>
                <Typography variant="body1" style={descriptionStyle}>
                Complete the model information fields to provide a detailed overview of your submission. This facilitates an efficient validation process, ensuring your model's seamless integration within GenomeNet’s platform and broader scientific applicability.
                </Typography>

                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" />
                <TextField label="Task Type" value={taskType} onChange={(e) => setTaskType(e.target.value)} fullWidth margin="normal" />
              
                <InputLabel id="license-label">License Selection</InputLabel>
                <Typography variant="caption">Specify the license under which you intend to distribute your model.</Typography>
          <Select
            labelId="license-label"
            value={modelLicense}
            onChange={(e) => setModelLicense(e.target.value as string)}
          >
            <MenuItem value="cc-by-4.0">cc-by-4.0</MenuItem>
          </Select>
         
    
                <TextField label="DOI of associated manuscript" value={doi} onChange={(e) => setDoi(e.target.value)} fullWidth margin="normal" />

                {/* Dynamic form fields based on vocabulary_label */}
                {Object.keys(vocabDescriptions).map(label => (
                    <TextField
                        key={label}
                        label={`Description for label ${label}`}
                        value={vocabDescriptions[label]}
                        onChange={(e) => handleVocabDescriptionChange(label, e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                ))}

<Button  className="ui button use-model-button" disabled={!isSubmitEnabled} onClick={handleSubmit} >
          Submit your model
        </Button>
        
        {showSuccess && <Typography variant="body1" color="primary">Great job, your model has been successfully submitted! We'll be in touch as soon as we finish reviewing it. Thanks for contributing to GenomeNet!</Typography>}
   
            </CardContent>
        </Card>
    );
};

export default ModelUploadComponent;
