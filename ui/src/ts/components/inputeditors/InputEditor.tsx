import * as React from "react";
import {StringInputEditor} from "./StringInputEditor";
import {SelectInputEditor} from "./SelectInputEditor";
import {StringArrayInputEditor} from "./StringArrayInputEditor";
import {SQLInputEditor} from "./SQLInputEditor";
import {UnknownInputTypeInputEditor} from "./UnknownInputTypeInputEditor";
import {IntegerInputEditor} from "./IntegerInputEditor";
import {Constants} from "../../Constants";
import {DecimalInputEditor} from "./DecimalInputEditor";
import {FileInputEditor} from "./FileInputEditor";
import {APIExpectedInput} from "../../apitypes/APIExpectedInput";
import {InputEditorUpdate} from "./updates/InputEditorUpdate";
import {Component, ReactElement} from "react";
import {FileArrayInputEditor} from "./FileArrayInputEditor";

export interface InputEditorProps {
    suggestedValue: any;
    expectedInput: APIExpectedInput;
    onJobInputUpdate: (update: InputEditorUpdate) => void;
    key: string;
    setIsSubmitEnabled?: (isEnabled: boolean) => void;  
}

export class InputEditor extends Component<InputEditorProps> {

    private static expectedInputUiComponentCtors: { [dataType: string]: (props: InputEditorProps) => Component<any> } = {
        "string": props => new StringInputEditor(props),
        "select": props => new SelectInputEditor(props),
        "string[]": props => new StringArrayInputEditor(props),
        "sql": props => new SQLInputEditor(props),
        "int": props => new IntegerInputEditor({
            min: Constants.I32_MIN,
            max: Constants.I32_MAX,
            typeName: "int"
        }, props),
        "long": props => new IntegerInputEditor({
            min: Constants.I64_MIN,
            max: Constants.I64_MAX,
            typeName: "long"
        }, props),
        "float": props => new DecimalInputEditor({
            min: Constants.F32_MIN,
            max: Constants.F32_MAX,
            typeName: "float"
        }, props),
        "double": props => new DecimalInputEditor({
            min: Constants.F64_MIN,
            max: Constants.F64_MAX,
            typeName: "double"
        }, props),
        "file": props => new FileInputEditor(props),
        "file[]": props => new FileArrayInputEditor(props),
    };

    private static unknownInputCtor = props => new UnknownInputTypeInputEditor(props);

    public static getSupportedInputEditors(): string[] {
        return Object.keys(this.expectedInputUiComponentCtors);
    }

    public render(): ReactElement<any> {
        const inputEditor =
            InputEditor.expectedInputUiComponentCtors[this.props.expectedInput.type] ||
            InputEditor.unknownInputCtor;
        const expectedInput = this.props.expectedInput;

        const editorProps = {
            suggestedValue: this.props.suggestedValue,
            expectedInput: expectedInput,
            onJobInputUpdate: this.props.onJobInputUpdate,
            setIsSubmitEnabled: this.props.setIsSubmitEnabled,
        };

        const inputComponent = React.createElement(inputEditor as any, editorProps, null);

        return (
            <div className={"field " + expectedInput.type + "-expected-input"}>
                <label htmlFor={"expected-input_" + expectedInput.id}>
                    {expectedInput.name ? expectedInput.name : expectedInput.id}
                </label>
                {expectedInput.description ? <div>{expectedInput.description}</div> : null}
                {inputComponent}
            </div>
        );
    }
}
