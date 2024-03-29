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

import * as React from 'react';
import { HttpService } from "../HttpService";
import { JobsonAPI } from "../JobsonAPI";
import { JobListComponent } from "./JobListComponent";
import { JobDetailsComponent } from "./JobDetailsComponent";
import { Redirect, Route, Switch } from "react-router";
import { NavbarComponent } from "./NavbarComponent";
import { SubmitJobComponent } from "./SubmitJobComponent";
import { APIErrorMessage } from "../apitypes/APIErrorMessage";
import { Component } from "react";
import { ModelCardComponent } from "./ModelCardComponent";
import ModelDetailsComponent from './ModelDetailsComponent';
import { DatasetCardComponent } from "./DatasetCardComponent";
import DatasetDetailsComponent from './DatasetDetailsComponent';
import { PublicationPage } from "./PublicationPage";
import ModelUploadComponent from "./ModelUploadComponent";
import DatasetUploadComponent from "./UploadDatasetComponent";
import ImpressumPage from "./ImpressumPage";
import DatenschutzPage from "./DatenschutzPage";
import ImprintPage from "./ImprintPage";
import DataprotectionPage from "./DataprotectionPage";
import "../../css/AppComponent.css";

export interface AppComponentProps {
}

export interface AppComponentState {
    httpService: HttpService,
    configLoading: boolean,
    configLoadingError: null | APIErrorMessage,
    api: null | JobsonAPI,
    requests: XMLHttpRequest[]
}

export class AppComponent extends Component<AppComponentProps, AppComponentState> {
    static renderConfigLoadingScreen() {
        return (
            <div className="ui active dimmer">
                <div className="ui text loader">
                    Loading configuration
                </div>
            </div>
        );
    }

    static renderFooter() {
        return (
            <div className="ui inverted vertical footer segment">
                <div className="ui container">
                    <div className="ui stackable inverted divided equal height stackable grid">
                        <div className="ten wide column">
                            <h4 className="ui inverted header">A deep neural network for genomic modelling, semi-supervised classification and imputation</h4>
                            <p>
                                The GenomeNet project is a BMBF funded joint research enterprise of the Helmholtz Centre for Infection Research and the University of Munich.
                            </p>
                        </div>

                        <div className="six wide column">
                            <div className="ui inverted link list">
                            <a className="item" href="mailto:philipp.muench@helmholtz-hzi.de">Contact</a>

                                

                                <span>
                                <a className="item" style={{ marginRight: '2px' }} href={`https://github.com/genomenet`} rel="noreferrer">Github</a>
                                <span className="greyBar">|</span>
                                    <a className="item" style={{ marginLeft: '2px' }} href={`https://twitter.com/genome_net`} rel="noreferrer">X.com</a>
                                </span>
                                <br />
                                <span>
                                    <a className="item" style={{ marginRight: '2px' }} href={`#/impressum`} rel="noreferrer">Impressum</a>
                                    <span className="greyBar">|</span>
                                    <a className="item" style={{ marginLeft: '2px' }} href={`#/imprint`} rel="noreferrer">Imprint</a>
                                </span>
                                <br />
                                <span>
                                    <a className="item" style={{ marginRight: '2px' }} href={`#/datenschutz`} rel="noreferrer">Datenschutzerklärung</a>
                                    <span className="greyBar">|</span>
                                    <a className="item" style={{ marginLeft: '2px' }} href={`#/dataprotection`} rel="noreferrer">Privacy Policy</a>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }


    constructor(props: AppComponentProps, context: any) {
        super(props, context);

        const httpService = new HttpService();

        this.state = {
            httpService: httpService,
            configLoading: true,
            configLoadingError: null,
            api: null,
            requests: [],
        };
    }

    componentWillMount() {
        this.initializeLoadingBar();
        this.loadConfig();
    }

    initializeLoadingBar() {
        this.state.httpService.onRequestsChanged.subscribe(requests => {
            this.setState({ requests: requests });
        });
    }

    loadConfig() {
        this.setState({
            configLoading: true,
            configLoadingError: null,
            api: null,
        }, () => {
            this.state.httpService.get("config.json")
                .then(config => {
                    this.setState({
                        configLoading: false,
                        configLoadingError: null,
                        api: new JobsonAPI(this.state.httpService, JSON.parse(config).apiPrefix),
                    });
                })
                .catch(err => {
                    this.setState({
                        configLoading: false,
                        configLoadingError: err,
                        api: null,
                    });
                });
        });
    }

    render() {
        if (this.state.configLoading) {
            return AppComponent.renderConfigLoadingScreen();
        } else if (this.state.configLoadingError !== null) {
            return this.renderConfigLoadingErrorScreen(this.state.configLoadingError);
        } else {
            return this.renderConfigLoadedScreen();
        }
    }

    renderConfigLoadingErrorScreen(configLoadingError: APIErrorMessage) {
        return (
            <div className="ui container">
                <div className="ui secondary pointing menu">
                    <div className="ui container">

                        <span className="header item">
                            Jobson
                        </span>
                    </div>
                </div>

                <div className="ui negative icon message">
                    <i className="warning circle icon" />
                    <div className="content">
                        <div className="header">
                            <h1>Error Loading UI Configuration</h1>
                        </div>

                        <p>
                            The Jobson UI configuration (<a href="config.json">config.json</a>) could not be loaded. The
                            UI tried to
                            fetch the configuration (via a <code>GET</code> request for <code>config.json</code>).
                            However, the server
                            responded with &quot;{configLoadingError.message}&quot; (HTTP
                            code: {configLoadingError.code}).
                        </p>

                        <button className="ui primary icon button"
                            onClick={this.loadConfig.bind(this)}>
                            <i className="refresh icon" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderConfigLoadedScreen() {
        return (
            <div>
                {this.state.requests.length > 0 ?
                    <div className="loading-bar enabled" /> :
                    <div className="loading-bar" />}

                <div id="root-container" className="site-root">
                    <div className="site-content">
                        {this.state.api !== null ? <NavbarComponent api={this.state.api} /> : null}

                        {this.renderMain()}
                    </div>
                    {AppComponent.renderFooter()}
                </div>
            </div>
        );
    }

    renderMain() {
        return (
            <main className="ui container" style={{ marginBottom: "1em" }}>
                <Switch>
                    <Route path="/upload-model" render={props => <ModelUploadComponent />} />
                    <Route path="/upload-dataset" render={props => <DatasetUploadComponent />} />
                    <Route path="/submit/:preselectedSpecId?" render={props => { const preselectedSpecId = props.match.params.preselectedSpecId; return <SubmitJobComponent api={this.state.api} preselectedSpecId={preselectedSpecId} routeProps={props} /> }} />
                    <Route path="/publications" render={props => <PublicationPage />} />
                    <Route path="/impressum" render={props => <ImpressumPage />} />
                    <Route path="/datenschutz" render={props => <DatenschutzPage />} />
                    <Route path="/dataprotection" render={props => <DataprotectionPage />} />
                    <Route path="/imprint" render={props => <ImprintPage />} />
                    <Route path="/model/:modelId" render={props => <ModelDetailsComponent {...props} />} />
                    <Route path="/model" render={props => <ModelCardComponent api={this.state.api} routeProps={props} />} />
                    <Route path="/dataset/:datasetId" render={props => <DatasetDetailsComponent {...props} />} />
                    <Route path="/dataset" render={props => <DatasetCardComponent api={this.state.api} routeProps={props} />} />
                    <Route path="/jobs/:id" render={props => <JobDetailsComponent params={props.match.params} api={this.state.api} routeProps={props} />} />
                    <Redirect from={"/"} to={"/submit"} />
                </Switch>
            </main>
        );
    }
}    
