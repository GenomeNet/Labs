#!/bin/bash

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

# Function to monitor GPU usage
monitor_gpu() {
  while sleep 1; do
    nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader >> gpu_usage.log
  done
}

# Initialize Conda
eval "$(conda shell.bash hook)"

# Define paths and environment names
INPUT_FILE="$1"
JSON_FILE="input.json"
REFORMATTED_FILE="input_reformatted.fasta"
OUTPUT_FILE="prediction.tsv"
ENV_NAME="genomenet_virusnet_gpu"
REFORMAT_SCRIPT="/Users/user/Documents/Labs/server-job-processing/tools/reformat_json.py"

# Copy the input to a working JSON file
cp "$INPUT_FILE" "$JSON_FILE"

echo "Reformatting file"

# Run the reformatting tool and check for success
python3 "$REFORMAT_SCRIPT" --input "$JSON_FILE" --output "$REFORMATTED_FILE" && {
    echo "Running inference"
    
    # Activate the environment and run the tool
    conda activate "$ENV_NAME"
        
    # Start monitoring GPU in the background
    monitor_gpu &
    MONITOR_PID=$!

    virusnet -i "$REFORMATTED_FILE" -o "$OUTPUT_FILE"
    echo "Done"

    # Stop the GPU monitor
    kill $MONITOR_PID
    
    # Deactivate the environment
    conda deactivate
    
    # Show the GPU log or do other analysis
    cat gpu_usage.log

} || {
    echo "Reformatting failed, not running inference."

    exit 1
}

