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

import {Link} from "react-router-dom";
import TimeAgo from "react-timeago";
import {Helpers} from "../Helpers";
import {JobOutputsViewer} from "./outputviewers/JobOutputsViewer";
import {JobEventsComponent} from "./JobEventsComponent";
import {JobInputsViewer} from "./JobInputsViewer";
import {SpecViewerComponent} from "./SpecViewerComponent";
import {Component, ReactElement} from "react";
import {Observable, Subscription} from "rxjs/index";
import {APIErrorMessage} from "../apitypes/APIErrorMessage";
import {APIJobDetails} from "../apitypes/APIJobDetails";
import {APIJobEvent} from "../apitypes/APIJobEvent";
import {JobsonAPI} from "../JobsonAPI";
import {APITimestamp} from "../apitypes/APITimestamp";
import {APIRestLink} from "../apitypes/APIRestLink";
import {ResubmitButtonComponent} from "./ResubmitButtonComponent";

export interface JobDetailsComponentProps {
    params: { [k: string]: string };
    api: JobsonAPI;
    routeProps: any;
}

export interface JobDetailsComponentState {
    isLoadingJob: boolean;
    loadingError: null | APIErrorMessage;
    job: null | APIJobDetails;
    selectedTabIdx: number;
    jobChangesSubject: null | Observable<APIJobEvent>;
    updateSubscriptionError: boolean;
}

export interface JobDetailsTab {
    header: string,
    renderer: () => ReactElement<any> | string,
}

export class JobDetailsComponent extends Component<JobDetailsComponentProps, JobDetailsComponentState> {

    private static renderJobLoadingMessage() {
        return Helpers.renderLoadingMessage("job details");
    }


    private updateSubscription: Subscription | null;


    public constructor(props: JobDetailsComponentProps, context: any) {
        super(props, context);

        this.updateSubscription = null;

        this.state = {
            isLoadingJob: true,
            loadingError: null,
            job: null,
            selectedTabIdx: 1,
            jobChangesSubject: null,
            updateSubscriptionError: false,
        };
    }


    public componentDidMount(): void {
        this.updateUi();
        this.subscribeToJobUpdates();
    }

    private updateUi(): void {
        this.props.api.fetchJobDetailsById(this.props.params.id)
            .then(this.onJobDetailsLoaded.bind(this))
            .catch(this.onJobDetailsLoadError.bind(this));
    }

    private onJobDetailsLoaded(job: APIJobDetails): void {
        this.setState({
            isLoadingJob: false,
            loadingError: null,
            job: job,
        });
    }

    private onJobDetailsLoadError(apiError: APIErrorMessage): void {
        this.setState({
            isLoadingJob: false,
            loadingError: apiError,
            job: null,
        });
    }

    private subscribeToJobUpdates(): void {
        const jobChangesSubject = this.props.api.onAllJobStatusChanges();

        this.setState({jobChangesSubject});

        this.updateSubscription = jobChangesSubject.subscribe(
            this.updateUi.bind(this),
            this.onUpdateSubscriptionError.bind(this),
            () => {
            }); // API responded but the job has nothing new to give.
    }

    private onUpdateSubscriptionError(): void {
        this.clearUpdateSubscription();

        this.setState({
            updateSubscriptionError: true
        });
    }

    private clearUpdateSubscription(): void {
        if (this.updateSubscription !== null) {
            this.updateSubscription.unsubscribe();
            this.updateSubscription = null;
        }
    }

    public componentWillUnmount(): void {
        this.clearUpdateSubscription();
    }

    public render(): ReactElement<any> {
        return (
            <div>
                {this.renderHeader()}
                {this.tryRenderMain()}
            </div>
        );
    }

    private renderHeader(): ReactElement<any> {
        return (
            <div className="segment">
                <div className="ui grid">
                    <div className="four wide column" style={{"textAlign": "right"}}>
                        {this.renderConnectionButton()}
                    </div>
                </div>

            </div>
        );
    }

    private renderConnectionButton(): ReactElement<any> {
        if (this.state.updateSubscriptionError) {
            return (
                <button className="ui mini yellow basic labeled icon button"
                        onClick={this.onClickedReconnectToUpdates.bind(this)}
                        title="Cannot connect for dynamic job updates.">

                    <i className="plug icon"/>
                    Websocket Error
                </button>
            );
        } else {
            return null;
        }
    }

    private onClickedReconnectToUpdates(): void {
        this.clearUpdateSubscription();

        this.setState({updateSubscriptionError: false}, () => {
            this.subscribeToJobUpdates();
        });
    }

    private tryRenderMain(): ReactElement<any> {
        if (this.state.isLoadingJob) {
            return JobDetailsComponent.renderJobLoadingMessage();
        } else if (this.state.loadingError !== null) {
            return this.renderErrorMessage();
        } else {
            return this.renderJobDetailsUi();
        }
    }

    private renderErrorMessage(): ReactElement<any> {
        return Helpers.renderAPIErrorMessage(
            "job details",
            this.state.loadingError,
            this.updateUi.bind(this));
    }

    private renderJobDetailsUi(): ReactElement<any> {
        return (
            <div>
                <div className="ui segment">
                    <div className="ui horizontal list">
                        {Helpers.mapKvToArray((k, v) => this.renderDetailHeader(k, v), this.detailHeaders)}
                    </div>
                </div>
    
                {this.renderOutputs()}
            </div>
        );
    }


private renderOutputs(): ReactElement<any> {
    if (this.state.job && this.state.job._links && this.state.job._links["outputs"]) {
        return (
            <JobOutputsViewer jobChangesSubject={this.state.jobChangesSubject}
                              jobId={this.props.params.id}
                              api={this.props.api}/>
        );
    } else {
        return null;
    }
}

    private get detailHeaders(): { [k: string]: () => ReactElement<any> | string } {
        return {
            "Job ID": () => this.props.params.id,
            "Submitted": () => {
                return <TimeAgo date={this.state.job.timestamps[0].time} />;
            },
            "Latest Status": () => {
                return (
                    <div>
                        {Helpers.renderStatusField(this.getLatestStatus().status)}
                    </div>
                );
            },
            "Elapsed Time": () => {
                const latest = this.getLatestStatus();
                const startTime = Date.parse(this.state.job.timestamps[0].time);
                const now = Helpers.isTerminalStatus(latest.status) ?
                    () => Date.parse(latest.time) : () => new Date();
                const formatter = (val, unit, suffix) => {
                    return `${val} ${unit}s`;
                };
                return <TimeAgo date={startTime} now={now} formatter={formatter} />;
            },
        };
    }

    private getLatestStatus(): APITimestamp {
        return this.state.job.timestamps[this.state.job.timestamps.length - 1];
    }

    private renderDetailHeader(header: string, renderer: () => ReactElement<any> | string) {
        return (
            <div className="item" key={header}>
                <div className="content">
                    <div className="header">
                        {header}
                    </div>
                    {renderer.call(this)}
                </div>
            </div>
        );
    }

    private renderTabHeaders(): ReactElement<any>[] {
        return this.tabs.map((tab, i) => {
            if (i === this.state.selectedTabIdx) {
                return (
                    <a className="item active" key={i}>
                        {tab.header}
                    </a>
                );
            } else {
                return (
                    <a className="item"
                       key={tab.header}
                       onClick={this.onClickedTab.bind(this, i)}>
                        {tab.header}
                    </a>
                );
            }
        });
    }

    private get tabs(): JobDetailsTab[] {
        const tabsForRestLinks = this.tabsForRestLinks(this.state.job._links);
        return tabsForRestLinks.concat([this.eventsTab()]);
    }

    private eventsTab(): JobDetailsTab {
        return {
            header: "Events",
            renderer: () => {
                return (
                    <JobEventsComponent timestamps={this.state.job.timestamps}/>
                );
            }
        };
    }

    private tabsForRestLinks(restLinks: { [name: string]: APIRestLink }): JobDetailsTab[] {
        const ret = [];


        if (restLinks["inputs"] !== undefined) {
            ret.push({
                header: "Inputs",
                renderer: () => {
                    return (
                        <JobInputsViewer jobId={this.props.params.id}
                                         api={this.props.api}/>
                    );
                }
            });
        }

        if (restLinks["outputs"] !== undefined) {
            ret.push({
                header: "Outputs",
                renderer: () => {
                    return (
                        <JobOutputsViewer jobChangesSubject={this.state.jobChangesSubject}
                                          jobId={this.props.params.id}
                                          api={this.props.api}/>
                    );
                }
            });
        }

        return ret;
    }

    private onClickedTab(tabIdx: number): void {
        this.setState({
            selectedTabIdx: tabIdx
        });
    }
}
