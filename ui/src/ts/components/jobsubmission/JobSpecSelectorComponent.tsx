import * as React from "react";
import { Component, ReactElement } from "react";
import { APIJobSpecSummary } from "../../apitypes/APIJobSpecSummary";
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export interface JobSpecSelectorComponentProps {
    selectedSpecId: string,
    specs: APIJobSpecSummary[],
    onSelectedSpecIdChanged: (specId: string) => void,
    preselectedSpecId: string | null,
}

export class JobSpecSelectorComponent extends Component<JobSpecSelectorComponentProps> {
    
    componentDidMount() {
        if (this.props.preselectedSpecId) {
            this.props.onSelectedSpecIdChanged(this.props.preselectedSpecId);
        }
    }

    getSelectedSpecDescription(): string | undefined {
        const selectedSpec = this.props.specs.find(spec => spec.id === this.props.selectedSpecId);
        return selectedSpec?.description;
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
                        <p>Use our publicly accessible deep learning models with fast inference hosted on our GenomeNet infrastructure.</p>
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
                    
                   <p>Description: {this.getSelectedSpecDescription()}</p>


                {/* Commented out anchor tag */}
                {/*
                <a href={`#/model/${this.props.selectedSpecId}`} target="_blank" rel="noreferrer">
                    Open model card
                </a>
                */}
                              
                 
                </div>
            </div>
        );
    }
}
