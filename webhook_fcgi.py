import os
import subprocess

def app(environ, start_response):
    if environ['REQUEST_METHOD'] == 'POST' and environ['PATH_INFO'] == '/webhook':
        update_container()
        start_response('200 OK', [('Content-Type', 'application/json')])
        return [b'{"message": "Container updated successfully"}']
    else:
        start_response('404 Not Found', [('Content-Type', 'text/html')])
        return [b'Not Found']

def update_container():
    print("Update container")
    image_name = 'genomenet/virus'
    container_name = 'virus_container'

    # Pull the latest image from docker.io
    subprocess.run(['podman', 'pull', image_name])

    # Stop and remove the old container if it exists
    subprocess.run(['podman', 'stop', container_name], check=False)
    subprocess.run(['podman', 'rm', container_name], check=False)

    # Start a new container with the updated image
    subprocess.run(['podman', 'run', '--name', container_name, '-d', image_name])

