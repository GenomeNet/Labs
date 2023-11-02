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
mkdir -p models
cd models
rm -f virus_genus_2023-01-23.hdf5 crispr_binary_model.h5 genomenet_intermediate.h5
wget https://f000.backblazeb2.com/file/genomenet/models/virus_genus_2023-01-23.hdf5
wget https://f000.backblazeb2.com/file/bioinf/crispr_binary_model.h5
wget https://f000.backblazeb2.com/file/bioinf/genomenet_intermediate.h5
cd ..



