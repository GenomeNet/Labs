/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import * as React from "react";
import {JobRequestEditorComponent} from "./JobRequestEditorComponent";
import {JobSpecSelectorComponent} from "./JobSpecSelectorComponent";
import {Helpers} from "../../Helpers";
import {LoadingJobSpecState} from "./LoadingJobSpecState";
import {JobRequestEditorUpdate} from "./editorupdates/JobRequestEditorUpdate";
import {Component, ReactElement} from "react";
import {JobsonAPI} from "../../JobsonAPI";
import {APIJobSpec} from "../../apitypes/APIJobSpec";
import {APIJobSpecSummary} from "../../apitypes/APIJobSpecSummary";
import {APIErrorMessage} from "../../apitypes/APIErrorMessage";
import {APIJobRequest} from "../../apitypes/APIJobRequest";
import {APIJobCreatedResponse} from "../../apitypes/APIJobCreatedResponse";

export interface EditingJobRequestStateProps {
    api: JobsonAPI,
    routeProps: any,
    onTransitionRequest: (el: ReactElement<any>) => void,
    jobSpecs: APIJobSpecSummary[],
    partialJobRequest: any,
    jobSpec: APIJobSpec,
    preselectedSpecId: string | null;  // Add this line
}

export interface EditingJobRequestStateState {
    reqOrErrors: JobRequestEditorUpdate,
    isSubmittingJob: boolean,
    jobSubmissionError: null | APIErrorMessage,
    isSubmitEnabled: boolean,
}

export class EditingJobRequestState extends Component<EditingJobRequestStateProps, EditingJobRequestStateState> {

    setIsSubmitEnabled(isEnabled: boolean) {
        this.setState({ isSubmitEnabled: isEnabled });
    }
    
    private static renderReqError(error: string, key: string): ReactElement<any> {
        return <li key={key}>{error}</li>;
    }

    public constructor(props: EditingJobRequestStateProps, context: any) {
        super(props, context);
    
        this.state = {
            reqOrErrors: JobRequestEditorUpdate.errors([]),
            isSubmittingJob: false,
            jobSubmissionError: null,
            isSubmitEnabled: false, 
        };
    }

    public render(): ReactElement<any> {
        const setIsSubmitEnabled = this.setIsSubmitEnabled.bind(this);


        return (
            <div>
                <JobSpecSelectorComponent
                    selectedSpecId={this.props.jobSpec.id}
                    specs={this.props.jobSpecs}
                    onSelectedSpecIdChanged={this.onSelectedSpecIdChanged.bind(this)}
                    preselectedSpecId={this.props.preselectedSpecId} />
                <br/>

                {this.state.jobSubmissionError ? this.renderJobSubmissionError() : null}

                <JobRequestEditorComponent
                    api={this.props.api}
                    routeProps={this.props.routeProps}
                    spec={this.props.jobSpec}
                    suggestedJobRequest={this.props.partialJobRequest}
                    setIsSubmitEnabled={setIsSubmitEnabled}
                    onReqOrErrors={this.onReqOrErrors.bind(this)}/>

                {this.state.reqOrErrors.accept({
                    visitValue: () => this.renderJobSubmissionButtons(),
                    visitErrors: () => this.renderReqErrors()
                })}
            </div>
        );
    }

    private onSelectedSpecIdChanged(newId: string): void {
        this.transitionToLoadingJobSpec(newId);
    }

    private transitionToLoadingJobSpec(newId: string): void {
        const req = this.state.reqOrErrors.accept({
            visitValue: (value) => value,
            visitErrors: () => this.props.partialJobRequest,
        });

        const props = {
            api: this.props.api,
            routeProps: this.props.routeProps,
            onTransitionRequest: this.props.onTransitionRequest,
            jobSpecs: this.props.jobSpecs,
            partialJobRequest: req,
            specId: newId,
            preselectedSpecId: null,//this.props.preselectedSpecId,  
        };
        const loadJobSpecComponent = React.createElement(LoadingJobSpecState, props, null);

        this.props.onTransitionRequest(loadJobSpecComponent);
    }

    private onReqOrErrors(reqOrErrors: JobRequestEditorUpdate): void {
        this.setState({reqOrErrors});
    }

    private renderJobSubmissionError(): ReactElement<any> {
        return Helpers.renderAPIErrorMessage(
            "submitting job",
            this.state.jobSubmissionError,
            this.onUserClickedSubmit.bind(this));
    }

    private renderJobSubmissionButtons(): ReactElement<any> {
        return (
            <div style={{marginTop: "1em", textAlign: "center"}}>
                {this.state.isSubmittingJob ?
                     this.renderSubmittingJobMessage() :
                     this.renderSubmitJobButton()}
            </div>
        );
    }

    private renderSubmittingJobMessage(): ReactElement<any> {
        const style = { "display": "block", "margin": "1em auto" };
        return (
            <button className="ui primary disabled loading basic button"
                    style={style}>
                Submitting job
            </button>
        );
    }

    private renderSubmitJobButton(): ReactElement<any> {
        const style = { "display": "block", "margin": "1em auto" };
        return (
            <button className="ui primary button"
                    style={style}
                    onClick={this.onUserClickedSubmit.bind(this)}
                    disabled={!this.state.isSubmitEnabled}>
                Compute
            </button>
        );
    }
    
    private renderDownloadRequestButton(): ReactElement<any> {
        return (
            <button className="ui tiny compact basic button"
                    onClick={this.onUserClickedDownloadRequest.bind(this)}>
                Download Request (debug)
            </button>
        );
    }

    private onUserClickedSubmit(): void {
        this.state.reqOrErrors.accept({
            visitValue: jobRequest => this.trySubmitJobRequestToAPI(jobRequest),
            visitErrors: () => this.onJobSubmissionFailure({message: "Cannot submit job to API: the job contains errors", code: 400}),
        });
    }

    private trySubmitJobRequestToAPI(jobRequest: APIJobRequest): void {
        this.setState({
            isSubmittingJob: true,
            jobSubmissionError: null,
        }, () => {
            this.props.api.submitJobRequest(jobRequest)
                .then(resp => this.onJobSubmissionSuccess(resp))
                .catch(err => this.onJobSubmissionFailure(err));
        });
    }

    private onJobSubmissionSuccess(apiResponse: APIJobCreatedResponse): void {
        this.navigateToNewlyCreatedJob(apiResponse);
    }

    private navigateToNewlyCreatedJob(apiResp: APIJobCreatedResponse): void {
        this.props.routeProps.history.push(`/jobs/${apiResp.id}`);
    }

    private onJobSubmissionFailure(apiError: APIErrorMessage): void {
        this.setState({
            isSubmittingJob: false,
            jobSubmissionError: apiError,
        }, () => window.scrollTo(0, 0));
    }

    private onUserClickedDownloadRequest(): void {
        this.state.reqOrErrors.accept({
            visitValue: jobRequest => Helpers.promptUserToDownloadAsJSON(jobRequest),
            visitErrors: () => {
                console.error("Incorrect state detected: attempted to download a request when errors present: skipping");
            },
        });
    }

    private renderReqErrors(): ReactElement<any> {
        return this.state.reqOrErrors.accept({
            visitValue: () => {
                return Helpers.renderErrorMessage("UI error (bug)", "Incorrect state detected: attempted to render error messages when no errors are present in job");
            },
            visitErrors: errors => {
                return (
                    <div className="ui negative icon message">
                        <i className="warning circle icon"/>
                        <div className="content">
                            <div className="header">
                                Cannot Submit: Errors in input
                            </div>

                            <ul>
                                {errors.map(EditingJobRequestState.renderReqError.bind(this))}
                            </ul>
                        </div>
                    </div>
                );
            }
        });
    }
}