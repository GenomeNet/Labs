import * as React from "react";
import { ReactElement } from "react";
import { RouteComponentProps } from "react-router-dom";
import datasets from "../assets/datasets.json";
import { JobsonAPI } from "../JobsonAPI";
import "../../css/cardStyles.css";
import { Link } from "react-router-dom";

interface DatasetCardComponentProps {
  api: JobsonAPI;
  routeProps: RouteComponentProps<any, any, any>;
}


export interface Dataset {
  id: string;
  title: string;
  description: string;
  short_description: string;
  authors: string[];
  categories?: string[];
  citation?: string;
  licence?: string;
  keywords?: string[];
  data_format?: string[]; // FASTA, FASTQ etc.
  data_type?: string[]; // Reads, contigs, full genomes, etc.
  file_size?: string; // "10GB", "5GB", etc.
  last_updated?: string; // "2023-05-01"
  number_of_samples?: number;
  download_link?: string;
}

interface DatasetCardProps {
  dataset: Dataset;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset }) => {
  const getKeywordColor = (index: number): string => {
    const colors = [
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#955251",
      "#B565A7",
      "#009B77",
      "#DD4124",
      "#D65076",
      "#45B8AC",
      "#EFC050",
      "#5B5EA6",
    ];

    return colors[index % colors.length];
  };


  const datasetLink = `/dataset/${dataset.id}`;

  return (
    <div className={`ui card dataset-card-container full-width-card`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="content">
        <div className="header">{dataset.title}</div>
        <div className="description card-text">
          <p>{dataset.short_description}</p>
  
          {dataset.last_updated && (
            <p><span style={{ fontWeight: 'bold' }}>Last Updated:</span> {dataset.last_updated}</p>
          )}

          {dataset.categories && (
            <p><span style={{ fontWeight: 'bold' }}>Categories:</span>  {dataset.categories.join(", ")}</p>
          )}

          {dataset.keywords && (
            <p>
              <span style={{ fontWeight: 'bold' }}>Keywords:</span> {" "}
              {dataset.keywords.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: getKeywordColor(index),
                    color: "#ffffff",
                    borderRadius: "3px",
                    padding: "2px 5px",
                    marginRight: "5px",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
      <div className="extra content" style={{ padding: '10px' }}>
        <Link to={datasetLink}>
          <button className="ui button" style={{ width: '100%' }}>More Information</button>
        </Link>
      </div>
    </div>
  );

}

export class DatasetCardComponent extends React.Component<DatasetCardComponentProps, { filter: string }> {
  constructor(props: DatasetCardComponentProps) {
    super(props);
    this.state = {
      filter: "",
    };
  }


  private getUniqueKeywords(): string[] {
    const keywordSet = new Set<string>();
    datasets.forEach((dataset) => {
      if (dataset.keywords) {
        dataset.keywords.forEach((keyword) => keywordSet.add(keyword));
      }
    });
    return Array.from(keywordSet);
  }

  private getButtonStyle(isActive: boolean): React.CSSProperties {
    return {
      backgroundColor: isActive ? "#007acc" : "#f0f0f0",
      color: isActive ? "#ffffff" : "#000000",
      borderRadius: "3px",
      padding: "5px 10px",
      marginRight: "5px",
      marginBottom: "5px",
      border: "1px solid #ccc",
      cursor: "pointer",
    };
  }

  public render(): ReactElement<any> {
    const filteredDatasets = datasets.filter((dataset) => {
      if (this.state.filter === "") {
        return true;
      } else {
        const keywords = dataset.keywords || [];
        return keywords.some((keyword) =>
          keyword.toLowerCase().includes(this.state.filter.toLowerCase())
        );
      }
    });

    const uniqueKeywords = this.getUniqueKeywords();

    return (
      <div>
        <h2>Overview of available datasets</h2>
        <p>Welcome to our dataset library, your central hub for all available pre-trained deep learning datasets. Each of these datasets has been carefully curated and optimized to serve a variety of use cases, spanning across genomics, bioinformatics, and computational biology. Each dataset is accompanied by detailed information, including its architecture, training data, performance metrics, and application use cases. These details will guide you in understanding each dataset's strengths and potential applications, ensuring that you choose the most appropriate tool for your project.</p>

        <div style={{ marginBottom: "2em" }}>
          {uniqueKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => this.setState({ filter: keyword })}
              style={this.getButtonStyle(this.state.filter === keyword)}
            >
              {keyword}
            </button>
          ))}
          {this.state.filter && (
            <button
              onClick={() => this.setState({ filter: "" })}
              style={this.getButtonStyle(false)}
            >
              Clear Filter
            </button>
          )}
        </div>

        <h3>Datasets</h3>

        <div className="ui stackable cards">
          {filteredDatasets.map((dataset: Dataset, index: number) => (
            <DatasetCard key={index} dataset={dataset} />
          ))}

          <div className="ui card dataset-card-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderColor: '#ddd',  // Lighter border color
              opacity: 0.7  // Lower opacity for the whole card
            }}
          >
            <div className="content">
              <div className="header" style={{ color: '#000' }}>Upload a Dataset</div>
              <div className="description card-text" style={{ color: '#000' }}>
                <p>Would you like to add your own dataset?</p>
              </div>
            </div>
            <div className="extra content" style={{ padding: '10px' }}>
            <a href="#/upload-dataset">
                <button className="ui button" style={{ width: '100%', color: 'white', backgroundColor: 'green' }}>Upload Dataset</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}