import React, { useState } from 'react';
import datasets from '../assets/datasets.json';
import { RouteComponentProps } from 'react-router-dom';
import models from '../assets/models.json';
import { Typography, Table, TableRow, TableCell, Button, Card, CardContent } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';


interface DatasetDetailsProps extends RouteComponentProps<{ datasetId: string }> {}

const DatasetDetailsComponent: React.FC<DatasetDetailsProps> = ({ match, history }) => {
  const { datasetId } = match.params;

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
  };

  const descriptionStyle: React.CSSProperties = {
    textAlign: "justify",
    paddingTop: "20px",
    paddingRight: "20px",
  };


  const buttonStyle: React.CSSProperties = {
    marginTop: "20px"  // Padding between button and authors
  };

  const authorsStyle: React.CSSProperties = {
    paddingTop: "20px" 
  };

  // State for foldable sections
  const [showClassDistribution, setShowClassDistribution] = React.useState(true);
  const [showAuthors, toggleAuthorsVisibility] = React.useState(true);
  const [showAssociatedModels, setShowAssociatedModels] = React.useState(true);
  const [showDataType, toggleDataTypeVisibility] = useState(false);
  const [showDataFormat, toggleDataFormatVisibility] = useState(false);
  const [showLastUpdated, toggleLastUpdatedVisibility] = useState(false);

  // Find the dataset by its ID in the JSON file
  const dataset = datasets.find(d => d.id === datasetId);

  // Ensure the dataset is found first, then find associated models
  const associatedModels = dataset ? models.filter(model => model.datasetId === dataset.id) : [];

  if (!dataset) {
    return <div>No dataset found</div>;
  }

  const handleClick = () => {
    history.push(`/submit/${dataset.id}`);
  }

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <Card variant="outlined" style={cardStyle}>
        <CardContent>
          <h2>{dataset.title}</h2>
          <Typography variant="h6">{dataset.short_description}</Typography>
          
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: 2 }}>
              <Typography variant="body1" style={descriptionStyle}>{dataset.description}</Typography>
              {dataset.authors && (
                <Typography variant="body2" style={authorsStyle}>Authors: {dataset.authors.join(", ")}</Typography>
              )}
              {/* Add additional details here */}
            </div>
            
            <div style={{ flex: 1 }}>
              <Table>
                <TableRow>
                  <TableCell>File Size</TableCell>
                  <TableCell>{dataset.file_size}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Publication Date</TableCell>
                  <TableCell>{dataset.creation_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Last updated</TableCell>
                  <TableCell>{dataset.last_updated}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Licence</TableCell>
                  <TableCell>{dataset.license}</TableCell>
                </TableRow>
                {/* Add additional table rows here */}
              </Table>
            </div>
          </div>
          
          <Button className="ui button use-model-button" onClick={handleClick} style={buttonStyle}>
             Download Dataset
          </Button>
        </CardContent>
      </Card>
    </div>
  );

}

export default DatasetDetailsComponent;
