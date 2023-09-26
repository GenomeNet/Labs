import React, { useState, useEffect } from 'react';
import { Button, TextField, Card, CardContent, Typography, Select, MenuItem, InputLabel } from '@material-ui/core';

const DatasetUploadComponent: React.FC = () => {

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
    const [datasetFile, setDatasetFile] = useState<File | null>(null);

    const [description, setDescription] = useState<string>('');
    const [developerName, setDeveloperName] = useState<string>('');
    const [developerEmail, setDeveloperEmail] = useState<string>('');
    const [developerInstitution, setDeveloperInstitution] = useState<string>('');
    const [datasetLicense, setDatasetLicence] = useState<string>('');
    const [doi, setDoi] = useState<string>('');

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


    useEffect(() => {
        // Check if all fields are filled out to enable submit button
        if (
          file && datasetFile && description && developerName && developerEmail &&
          developerInstitution && datasetLicense
        ) {
          setSubmitEnabled(true);
        } else {
          setSubmitEnabled(false);
        }
      }, [file, datasetFile, description, developerName, developerEmail, developerInstitution, datasetLicense, doi]);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            if (datasetFile) formData.append('datasetFile', datasetFile);
            formData.append('description', description);
            formData.append('developerName', developerName);
            formData.append('developerEmail', developerEmail);
            formData.append('developerInstitution', developerInstitution);
            formData.append('datasetLicense', datasetLicense);
            formData.append('doi', doi);

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
                <h2>Upload your dataset</h2>
     
                <Typography variant="body1" style={descriptionStyle}>
                First, upload your dataset JSON file, which was created during the deepG training process.
                </Typography>

                <input type="file" accept=".json" onChange={handleFileChange} />

                <Typography variant="h6" style={{ marginTop: "20px" }}>
                    Developer Information
                </Typography>

                <Typography variant="body1" style={descriptionStyle}>
                To maintain the credibility and traceability of our webservice, please provide your basic information. Your institutional affiliation will be publicly disclosed, while all other details will remain confidential for the sole purpose of communication during the validation process.
                </Typography>
                <TextField label="Primary Developer Name" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} fullWidth margin="normal" />
                <TextField label="Primary Developer Email" value={developerEmail} onChange={(e) => setDeveloperEmail(e.target.value)} fullWidth margin="normal" />
                <TextField label="Primary Developer Institution" value={developerInstitution} onChange={(e) => setDeveloperInstitution(e.target.value)} fullWidth margin="normal" />
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                    Dataet Information
                </Typography>
                <Typography variant="body1" style={descriptionStyle}>
                Complete the dataset information fields to provide a detailed overview of your submission. This facilitates an efficient validation process, ensuring your dataset's seamless integration within GenomeNet’s platform and broader scientific applicability.
                </Typography>

                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" />
              
                <InputLabel id="license-label">License selection</InputLabel>
                <Typography variant="caption">Specify the license under which you intend to distribute your dataset.</Typography>
          <Select
            labelId="license-label"
            value={datasetLicense}
            onChange={(e) => setDatasetLicence(e.target.value as string)}
          >
            <MenuItem value="cc-by-4.0">cc-by-4.0</MenuItem>
          </Select>
         
    
                <TextField label="DOI of associated manuscript" value={doi} onChange={(e) => setDoi(e.target.value)} fullWidth margin="normal" />

        
<Button  className="ui button use-model-button" disabled={!isSubmitEnabled} onClick={handleSubmit} >
          Submit your model
        </Button>
        
        {showSuccess && <Typography variant="body1" color="primary">Great job, your model has been successfully submitted! We'll be in touch as soon as we finish reviewing it. Thanks for contributing to GenomeNet!</Typography>}
   
            </CardContent>
        </Card>
    );
};

export default DatasetUploadComponent;
