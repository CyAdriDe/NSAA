#!/bin/bash

# To allow radius to read all the files, we copy them outside home directory and give permissions.
sudo cp ca/private/server.key.pem /etc/ssl/private/server.key.pem
sudo cp ca/certs/server.crt.pem /etc/ssl/certs/servercrt.pem
sudo cp ca/cacert.pem /etc/ssl/certs/cacert.pem

sudo chown freerad:freerad /etc/ssl/private/server.key.pem
sudo chown freerad:freerad /etc/ssl/certs/server.crt.pem
sudo chown freerad:freerad /etc/ssl/certs/cacert.pem 
