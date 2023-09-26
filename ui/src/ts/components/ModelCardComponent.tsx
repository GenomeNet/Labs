import * as React from "react";
import { ReactElement } from "react";
import { RouteComponentProps } from "react-router-dom";
import { JobsonAPI } from "../JobsonAPI";
import "../../css/cardStyles.css";
import { Link } from "react-router-dom";

interface ModelCardComponentProps {
  api: JobsonAPI;
  routeProps: RouteComponentProps<any, any, any>;
}

export interface Log {
  loss: number;
  acc: number;
  val_loss: number;
  val_acc: number;
  processing_step: number;
  time: number;
}

export interface Model {
  id: string;
  name: string;
  anaconda_url: string;
  cm_dir: string[];
  categories: string[];
  input_type: string[];
  keywords: string[];
  logs: Log[];
  solver: string[];
  institute: string[];
  institute_short: string[];
  learning_rate: string;
  number_model_params: number;
  maxlen: number;
  description: string;
}

interface ModelCardProps {
  model: Model;
}

interface StateType {
  filter: string;
  models: Model[];
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
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

  const modelLink = `/model/${model.id}`;

  return (
    <div className="ui card model-card-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="content">

      <span
      className="break-words font-mono font-semibold hover:text-blue-600 headline-font">
      {model.institute_short}/{model.id}
    </span>

        <div className="description card-text">
          <p>{model.name}</p>

          {model.categories && (
            <p><span style={{ fontWeight: 'bold' }}>Categories:</span>  {model.categories.join(", ")}</p>
          )}
          {model.keywords && (
            <p>
              <span style={{ fontWeight: 'bold' }}>Keywords:</span> {" "}
              {model.keywords.map((keyword, index) => (
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
        <Link to={modelLink}>
          <button className="ui button" style={{ width: '100%' }}>More Information</button>
        </Link>
      </div>
    </div>
  );
}

export class ModelCardComponent extends React.Component<ModelCardComponentProps, StateType> {
  constructor(props: ModelCardComponentProps) {
    super(props);
    this.state = {
      filter: "",
      models: [],
    };
  }

  componentWillMount() {
    this.loadModelData().catch(err => console.error(err));
  }

  async loadModelData() {
    // Array to store models
    const models: Model[] = [];

    // Add your JSON filenames here, or dynamically fetch the list from the server
    const modelFiles = ['../../public/model-cards/VirusNet.json', '../../public/model-cards/VirusNet-gpu.json'];

    // Fetch and set models
    await Promise.all(modelFiles.map(async (file) => {
      const response = await fetch(`/public/model-cards/${file}`);
      const modelData: any = await response.json();
      const model: Model = {
        id: modelData['id'],
        name: modelData['name'],
        input_type: modelData['input_type'],
        anaconda_url: modelData['anaconda_url'],
        cm_dir: modelData['cm_dir'],
        categories: modelData['categories'],
        keywords: modelData['keywords'],
        logs: modelData['logs'],
        solver: modelData['solver'],
        learning_rate:  modelData['learning_rate'],
        number_model_params: modelData['number_model_params'],
        maxlen: modelData['maxlen'],
        institute: modelData['institute'],
        institute_short: modelData['institute_short'],
        description: modelData['description']
      };
      models.push(model);
    }));

    this.setState({ models }, () => {
      console.log("State after loadModelData", this.state.models);
    });
  }

  private getUniqueKeywords(): string[] {
    const keywordSet = new Set<string>();
    this.state.models.forEach((model) => {
      if (model.keywords) {
        model.keywords.forEach((keyword) => keywordSet.add(keyword));
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
    const filteredModels = this.state.models.filter((model) => {
      if (this.state.filter === "") {
        return true;
      } else {
        const keywords = model.keywords || [];
        return keywords.some((keyword) =>
          keyword.toLowerCase().includes(this.state.filter.toLowerCase())
        );
      }
    });

    const uniqueKeywords = this.getUniqueKeywords();

    return (
      <div>
        <h2>Overview of available models</h2>
        <p>Welcome to our model library, your central hub for all available pre-trained deep learning models. Each of these models has been carefully curated and optimized to serve a variety of use cases, spanning across genomics, bioinformatics, and computational biology. Each model is accompanied by detailed information, including its architecture, training data, performance metrics, and application use cases. These details will guide you in understanding each model's strengths and potential applications, ensuring that you choose the most appropriate tool for your project.</p>

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

        <h3>Model cards</h3>

        <div className="ui stackable cards">
          {filteredModels.map((model: Model, index: number) => (
            <ModelCard key={index} model={model} />
          ))}

          <div className="ui card model-card-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderColor: '#ddd',  // Lighter border color
              opacity: 0.7  // Lower opacity for the whole card
            }}
          >
            <div className="content">
              <div className="header" style={{ color: '#000' }}>Submit a model</div>
              <div className="description card-text" style={{ color: '#000' }}>
                <p>Follow these steps to submit your pre-trianed model.</p>
              </div>
            </div>
            <div className="extra content" style={{ padding: '10px' }}>

              <a href="#/upload-model">
                <button className="ui button" style={{ width: '100%', color: 'white', backgroundColor: 'green' }}>Submit Model</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}