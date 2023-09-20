
import * as React from "react";
import { Component, FormEvent, ReactElement } from "react";
import { APIJobSpecSummary } from "../../apitypes/APIJobSpecSummary";
import models from "../../assets/models.json";
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export interface JobSpecSelectorComponentProps {
    selectedSpecId: string,
    specs: APIJobSpecSummary[],
    onSelectedSpecIdChanged: (specId: string) => void,
    preselectedSpecId: string | null,
}


export class JobSpecSelectorComponent extends Component<JobSpecSelectorComponentProps> {

    private static renderJobSpecSummary(jobSpecSummary: APIJobSpecSummary, i: number): ReactElement<any> {
        return (
            <option key={i} value={jobSpecSummary.id}>
                {jobSpecSummary.name}
            </option>
        );
    }


    public render(): ReactElement<any> {

        const dropdownOptions = this.props.specs.map((spec, i) => ({
            key: i,
            value: spec.id,
            text: spec.name,
            description: spec.description,
        }));


        return (
            <div className="ui form">

             
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h2>Hosted Inference API</h2>

                            <p>Test and evaluate, for free, our {models.length} publicly accessible deep learning models with fast inference hosted on our GenomeNet infrastructure. For an overview of all available models, please visit our model cards under "Models".</p>
                       
                        </div>
                      
                    </div>
          

                <div className="ui message" style={{ backgroundColor: '#fff' }}>
                    <label htmlFor="job-spec">

                        <div>
                            <h3 style={{ marginBottom: '0em' }}>Select a model</h3>
                            <p>Select one of our pre-trained model to perform predictions. See models page for more information how we created the models</p>
                        </div>


                    </label>

                    <Dropdown
                        id="job-spec"
                        placeholder='Select a Model'
                        fluid
                        search
                        selection
                        options={dropdownOptions}
                        value={this.props.selectedSpecId}
                        onChange={(e, { value }) => this.props.onSelectedSpecIdChanged(value as string)}
                    />


                    <div className="ui card model-card-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className="content">
                            <div className="header">
                                <h4>Currently Selected Model: {this.selectedSpec.modelInfo ? this.selectedSpec.modelInfo.title : 'None'}</h4>
                            </div>
                            <div className="description card-text">
                                {this.selectedSpec.modelInfo ? (
                                    <>
                                        <p>{this.selectedSpec.modelInfo.short_description}</p>
                                        <p><span style={{ fontWeight: 'bold' }}>Dataset:</span></p>
                                        {this.selectedSpec.modelInfo.categories && (
                                            <p><span style={{ fontWeight: 'bold' }}>Categories:</span>  {this.selectedSpec.modelInfo.categories.join(", ")}</p>
                                        )}

                                    </>
                                ) : (
                                    <p>No model selected.</p>
                                )}
                            </div>
                        </div>
                        <div className="extra content" style={{ padding: '10px' }}>
                            {this.selectedSpec.modelInfo && (
                                <a
                                    href={`#/model-cards/${this.selectedSpec.modelInfo.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <button className="ui button" style={{ width: '100%' }}>Open model card</button>
                                </a>
                            )}
                        </div>
                    </div>

                </div>




            </div>
        );
    }

    private onChangedSelectedSpec(e: FormEvent<HTMLSelectElement>): void {
        const newSpecId = e.currentTarget.value;
        console.log("bla:", newSpecId);
        this.props.onSelectedSpecIdChanged(newSpecId);
    }



    private get selectedSpec() {
        const spec = this.props.specs.find(spec => spec.id === this.props.selectedSpecId);
        const modelInfo = models.find(model => model.id === this.props.selectedSpecId);
        return { spec, modelInfo };
    }

}

