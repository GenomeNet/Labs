// src/ts/components/ModelDetailsComponent.tsx

import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Model, Log } from "./ModelCardComponent";
import TrainingCurve from './TrainingCurve';
import "../../css/ModelDetails.css";

interface ModelDetailsProps extends RouteComponentProps<{ modelId: string }> { }

interface ModelDetailsState {
  model?: Model;
}
class ModelDetailsComponent extends React.Component<ModelDetailsProps, ModelDetailsState> {

  constructor(props: ModelDetailsProps) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const modelId = this.props.match.params.modelId;
    try {
      const response = await fetch(`/public/model-cards/${modelId}.json`);
      if (response.ok) {
        const modelData = await response.json();
        this.setState({ model: modelData });
      } else {
        console.error("Failed to load model data");
      }
    } catch (err) {
      console.error("Error while fetching model details:", err);
    }
  }

  render() {
    const { model } = this.state;

    if (!model) {
      return <div>Loading model details...</div>;
    }

    const time = model.logs.map(log => log.time);
    const loss = model.logs.map(log => log.loss);
    const acc = model.logs.map(log => log.acc);
    const val_loss = model.logs.map(log => log.val_loss);
    const val_acc = model.logs.map(log => log.val_acc);

    return (
      <div>
     
        <div className="ui message" style={{ backgroundColor: '#fff' }}>

        <div>
  <div className="flex items-center">
    <span
      className="institute-font headline-font text-gray-400 hover:text-blue-600 font-semibold"
    >
      Model card: 
    </span>  <div style={{ width: '5px' }}></div>
   
    <span
      className="break-words font-mono font-semibold hover:text-blue-600 headline-font">
      {model.institute_short}/{model.id}
    </span>
  </div>

  <p className="font-normal">
  <strong> Submitted by:</strong> {model.institute}
  </p>

  <div>
  <a href={model.anaconda_url} target="_blank" rel="noopener noreferrer">
    <img src={`${model.anaconda_url}/badges/version.svg`} alt="Anaconda Version" style={{ marginRight: '5px' }} />
  </a>
  <a href={model.anaconda_url} target="_blank" rel="noopener noreferrer">
    <img src={`${model.anaconda_url}/badges/downloads.svg`} alt="Anaconda Downloads" style={{ marginRight: '5px' }} />
  </a>
  <a href={model.anaconda_url} target="_blank" rel="noopener noreferrer">
    <img src={`${model.anaconda_url}/badges/latest_release_date.svg`} alt="Anaconda Latest Release Date" />
  </a>
</div>


</div>

          <div className="model-details-container">
            <div className="model-details-content">
              <div className="model-details-tables">

                {/* Model Description */}
                <div className="model-details-section">
          
                  <h3>Model Description</h3>
                  <p>{model.description}</p>
                </div>



                {/* Metadata Table */}
                <div className="model-details-section">
                  <h3>Metadata</h3>

                  <table className="model-details-table">

                    <tbody>
                      <tr>
                        <td><strong>CM Dir</strong></td>
                        <td className="code-style">{model.cm_dir}</td>

                      </tr>
                      <tr>
                        <td><strong>Categories</strong></td>
                        <td>{model.categories.join(", ")}</td>
                      </tr>
                      <tr>
                        <td><strong>Context size</strong></td>
                        <td>{model.maxlen}</td>
                      </tr>
                      <tr>
                        <td><strong>Keywords</strong></td>
                        <td>{model.keywords.join(", ")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Architecture Table */}
                <div className="model-details-section">
                  <h3>Architecture</h3>
                  <table className="model-details-table">
                    <tbody>
                      <tr>
                        <td><strong>Solver</strong></td>
                        <td>{model.solver}</td>
                      </tr>

                      <tr>
                        <td><strong>Learning rate</strong></td>
                        <td>{model.learning_rate}</td>
                      </tr>
                      <tr>
                        <td><strong>Model parameters</strong></td>
                        <td>{model.number_model_params}</td>
                      </tr>
                      <tr>
                        <td><strong>Context size</strong></td>
                        <td>{model.maxlen}</td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Plots on the right */}
              <div className="model-plots">
             
                <div className="plot-box">
                  <h3>Training Curve - Loss</h3>
                  <TrainingCurve validationData={val_loss} trainingData={loss} xAxisLabel="Epochs"
                    yAxisLabel="Loss" />
                  <p className="figure-description">Figure 1: Training curve showcasing the model's loss over training time. Curves smoothed using exponential smoothing (alpha = 0.2)</p>

                </div>
                <div className="plot-box">
                  <h3>Training Curve - Accuracy</h3>
                  <TrainingCurve validationData={val_acc} trainingData={acc} xAxisLabel="Epochs"
                    yAxisLabel="Accuracy" />
                  <p className="figure-description">Figure 2: Training curve showcasing the model's accuracy over training time. Curves smoothed using exponential smoothing (alpha = 0.2)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ModelDetailsComponent;
