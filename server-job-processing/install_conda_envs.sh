#!/bin/bash

# Initialize Conda
eval "$(conda shell.bash hook)"

echo "Install Mamba"
conda install mamba -c conda-forge -y

# Declare an associative array with environment names as keys and packages as values
declare -A environments
environments=(
    ["genomenet_virusnet"]="virusnet"
    ["genomenet_virusnet_gpu"]="virusnet-gpu"
    ["genomenet_imputation"]="imputation"
    ["genomenet_interpretation"]="interpretation"
    ["genomenet_interpretation-gpu"]="interpretation-gpu"
)

# Loop through the associative array and create environments and install packages
for env in "${!environments[@]}"; do
    echo "Creating new Conda environment: $env"
    conda create -n "$env" -y
    conda activate "$env"
    mamba install -c genomenet -c conda-forge "${environments[$env]}" -y
    conda deactivate
done

# Download models for interpretation tool
conda activate genomenet_interpretation
interprete download --model all
conda deactivate



