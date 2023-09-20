
import * as React from "react";
import {Helpers} from "../../Helpers";
import {Constants} from "../../Constants";
import {InputEditorUpdate} from "./updates/InputEditorUpdate";
import {InputEditorProps} from "./InputEditor";
import {Component, FormEvent, ReactElement} from "react";

export interface StringArrayInputEditorState {
    values: string[];
    coercionWarning: null | string;
    fileSizeTooLarge: boolean;
}

export class StringArrayInputEditor extends Component<InputEditorProps, StringArrayInputEditorState> {

    private static coercePropValue({suggestedValue, expectedInput}: InputEditorProps): StringArrayInputEditorState {
        if (suggestedValue === undefined) {
            return {
                values: expectedInput.default || [],
                coercionWarning: null,
                fileSizeTooLarge: false 
            };
        } else if (!(suggestedValue instanceof Array)) {
            return {
                values: [],
                coercionWarning: `This input has been reset because the existing value was not an array of string (was ${typeof suggestedValue}.)`,
                fileSizeTooLarge: false 
            }
        } else {
            return {values: suggestedValue, coercionWarning: null, fileSizeTooLarge: false};
        }
    }

    private static renderValueLabel(value: string, i: number): ReactElement<any> {
        return (
            <div className="ui horizontal label"
                 key={i}>
                {value}
            </div>
        );
    }

    private static renderInputSummary(values: string[]): ReactElement<any> {
        // Extract FASTA headers
        const fastaHeaders = values.filter(value => value.startsWith('>'));
        // Extract nucleotide sequences
        const nucleotideSequences = values.filter(value => !value.startsWith('>'));
        const nucleotideCount = nucleotideSequences.reduce((acc, curr) => acc + curr.length, 0); // Count total nucleotides
    
        // Count the occurrence of each nucleotide
        let nucleotideTypes = { a: 0, c: 0, g: 0, t: 0, others: 0 };
        nucleotideSequences.forEach(sequence => {
            for (let i = 0; i < sequence.length; i++) {
                let nucleotide = sequence[i].toLowerCase();
                if (nucleotideTypes.hasOwnProperty(nucleotide)) {
                    nucleotideTypes[nucleotide]++;
                } else {
                    nucleotideTypes['others']++;
                }
            }
        });
    
        return (
            <div className="ui message">
                <div className="header">
                    FASTA file contains {nucleotideCount} nucleotides
                </div>
                <ul>
                    <li>
                        FASTA headers count: {fastaHeaders.length}
                    </li>
                    <li>
                        First header: {fastaHeaders.slice(0, 1).map(StringArrayInputEditor.renderValueLabel)}
                    </li>
                    <li>
                        Nucleotide types: 
                        <ul>
                            <li>A: {nucleotideTypes.a}</li>
                            <li>C: {nucleotideTypes.c}</li>
                            <li>G: {nucleotideTypes.g}</li>
                            <li>T: {nucleotideTypes.t}</li>
                            <li>Others: {nucleotideTypes.others}</li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }
    

    private static splitTextBlockIntoValues(text: string | null): string[] {
        if (text === null) {
            console.log("splitTextBlockIntoValues received null input");
            return [];
        }
        return text.length === 0 ? [] : text.split(/\r?\n/); // Match either \r\n or \n line breaks
    }
    
    

    public constructor(props: InputEditorProps) {
        super(props);

        const {values, coercionWarning} = StringArrayInputEditor.coercePropValue(props);

        this.state = {
            values: values,
            coercionWarning: coercionWarning,
            fileSizeTooLarge: false,
        };
    }

    public componentDidMount(): void {
        this.onInputStateChange();
    }

    private onInputStateChange(): void {
        const update = InputEditorUpdate.value(this.state.values);
        this.props.onJobInputUpdate(update);
    }

    public render(): ReactElement<any> {
        return (
            <div>
                {this.state.coercionWarning !== null ? this.renderCocercionWarning() : null}
                {this.renderInput(this.state.values)}
                {this.renderHelperButtons(this.state.values)}
            </div>
        );
    }

    private renderCocercionWarning(): ReactElement<any> {
        return Helpers.renderWarningMessage("This input was changed", this.state.coercionWarning);
    }

    private renderInput(values: string[]): ReactElement<any> {
        return values.length < Constants.STR_ARRAY_INTERACTIVE_BREAKPOINT ?
            this.renderInteractiveInput(values) :
            StringArrayInputEditor.renderInputSummary(values);
    }

    private renderInteractiveInput(values: string[]): ReactElement<any> {
        return (
            <textarea value={values.join("\n")}
                      onChange={this.onInteractiveInputChanged.bind(this)}
                      placeholder="Paste a nucleotide sequences in FASTA format"/>
        );
    }



private renderHelperButtons(values: string[]): ReactElement<any> {
    return (
        <div className="ui buttons">
            <button className={`ui basic icon button ${this.state.fileSizeTooLarge ? 'red' : ''}`}
                    onClick={this.onClickImportValuesFromFile.bind(this)}>
                <i className="upload icon"/>
                {this.state.fileSizeTooLarge ? 'File Size Too Large' : 'Import'}
            </button>
            <button className="ui basic icon button"
                    onClick={this.onClickClearValues.bind(this)}
                    disabled={values.length === 0}>
                <i className="remove icon"/>
                Clear
            </button>
        </div>
    );
}


private onClickImportValuesFromFile(): void {
    const newState = Object.assign({}, this.state, {values: []});
    this.setState(newState, () => this.onInputStateChange());
    Helpers
    .promptUserForFile("")
    .then(Helpers.readFileAsText)
    .then(text => {
        // Add this check
        if (text === null) {
            console.log("File read resulted in null");
            return null;
        }
            const fileSize = new Blob([text]).size; // size in bytes
            const fileSizeLimit = 1024 * 1024; // 1 MB

            if (fileSize > fileSizeLimit) {
                alert("File size too large (>1 MB)");
                this.props.setIsSubmitEnabled(false);
                return null;
            }

            return text.trim();
        })
        .then(StringArrayInputEditor.splitTextBlockIntoValues)
        .then(values => {
            if (values && values !== null) {
                this.addValues(values);
            }
        })
}

private onInteractiveInputChanged(e: FormEvent<HTMLTextAreaElement>): void {
    const values = StringArrayInputEditor.splitTextBlockIntoValues(e.currentTarget.value);
    const fileSize = new Blob([e.currentTarget.value]).size; // size in bytes
    const fileSizeLimit = 1024 * 1024; // 1 MB 

    if (fileSize > fileSizeLimit) {
        alert("File size too large (>1 MB)");
        this.props.setIsSubmitEnabled(false);
        return;
    }

     // add this block to reset fileSizeTooLarge flag
     if (this.state.fileSizeTooLarge) {
        this.setState({ fileSizeTooLarge: false }, () => {
            this.onInputStateChange();
        });
    }
    if (!Helpers.deepEquals(values, this.state.values)) {
        this.setState({values, fileSizeTooLarge: false}, () => {
            this.onInputStateChange();
            // enable Submit button if string is submitted
            if (values.length > 0) {
                this.props.setIsSubmitEnabled(true);
            } else {
                this.props.setIsSubmitEnabled(false);
            }
        });
    }
}

    private addValues(values: string[]): void {
        const newValues = this.state.values.concat(values);
        this.setState({values: newValues}, () => {
            this.onInputStateChange();
            // enable Submit button if string is imported and has values
            if (newValues.length > 0) {
                this.props.setIsSubmitEnabled(true);
            } else {
                this.props.setIsSubmitEnabled(false);
            }
        });
    }

    private onClickDownloadValues(): void {
        const blobOfValuesJoinedByNewlines =
            new Blob([this.state.values.map(s => s + "\n").join("")], {type: "text/plain"});

        Helpers.promptUserToDownload(blobOfValuesJoinedByNewlines, "values.txt");
    }

    private onClickClearValues(): void {
        console.log("onClickClearValues triggered");  // Log a message when this function is called
        if (this.state.values.length > 0 || this.state.fileSizeTooLarge) {
            console.log("Resetting values and fileSizeTooLarge");  // Log a message when resetting
            this.setState({values: [], fileSizeTooLarge: false}, () => {
                this.onInputStateChange();
                this.props.setIsSubmitEnabled(false);
                console.log("State has been set");  // Log a message when the state has been set
            });
        } else {
            console.log("No action needed");  // Log a message when no action is taken
        }
    }
    
    
    
}
