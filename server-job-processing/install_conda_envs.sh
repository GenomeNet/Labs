#!/bin/bash

# Initialize Conda
eval "$(conda shell.bash hook)"

echo "Creating new Conda environment: genomenet_virusnet"
conda create -n genomenet_virusnet -y
conda activate genomenet_virusnet
conda install -c genomenet virusnet -y
conda deactivate

echo "Creating new Conda environment: genomenet_virusnet_gpu"
conda create -n genomenet_virusnet_gpu -y
conda activate genomenet_virusnet_gpu
conda install -c genomenet virusnet-gpu -y
conda deactivate
