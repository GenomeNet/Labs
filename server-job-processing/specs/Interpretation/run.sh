#!/bin/bash
set -e  # Exit on any error

# Check if the input argument exists
if [ -z "$1" ]; then
    echo "Usage: $0 <input_file>"
    exit 1
fi

# Check if the input file exists
if [ ! -f "$1" ]; then
    echo "Error: Input file '$1' not found."
    exit 1
fi

# Initialize Conda
eval "$(conda shell.bash hook)"

# Define paths and environment names
INPUT_FILE="$1"
JSON_FILE="input.json"
REFORMATTED_FILE="input_reformatted.fasta"
OUTPUT_FILE="states.csv"
ENV_NAME="genomenet_interpretation"
REFORMAT_SCRIPT="../../tools/reformat_json.py"

# Copy the input to a working JSON file
cp "$INPUT_FILE" "$JSON_FILE"

echo "Reformatting file"

# Run the reformatting tool and check for success
python3 "$REFORMAT_SCRIPT" --input "$JSON_FILE" --output "$REFORMATTED_FILE" --silent && {
    echo "Running inference"
    # Activate the environment and run the tool
    conda activate "$ENV_NAME"
    interprete run -i "$REFORMATTED_FILE" -o states --model genus --model_folder ../../models/
    interprete run -i "$REFORMATTED_FILE" -o states --model crispr --model_folder ../../models/
    interprete run -i "$REFORMATTED_FILE" -o states --model genomenet --model_folder ../../models/
    echo "Done"
    # Optionally, deactivate the environment
    conda deactivate
} || {
    echo "Reformatting failed, not running inference."
    exit 1
}
