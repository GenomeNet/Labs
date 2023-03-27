#!/bin/bash

# Check if the registries.search section exists
if ! grep -q "\[registries.search\]" /etc/containers/registries.conf; then
  echo -e "\n[registries.search]" | sudo tee -a /etc/containers/registries.conf
fi

# Check if docker.io is already in the registries list
if ! grep -q "registries = .*\['docker.io'" /etc/containers/registries.conf; then
  # Add docker.io to the registries list
  sudo sed -i "/^\[registries.search\]$/a registries = ['docker.io']" /etc/containers/registries.conf
fi

