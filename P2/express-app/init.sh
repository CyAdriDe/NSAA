#!/bin/bash
# Stoping freeradius just in case
sudo systemctl stop freeradius && \

# To allow radius to read all the files, we copy them outside home directory and give permissions.
sudo cp ca/private/server.key.pem /etc/ssl/private/server.key.pem && \
sudo cp ca/certs/serverCert.pem /etc/ssl/certs/serverCert.pem && \
sudo cp ca/cacert.pem /etc/ssl/certs/cacert.pem && \
echo "ca files moved correctly"

sudo chown freerad:freerad /etc/ssl/private/server.key.pem && \
sudo chown freerad:freerad /etc/ssl/certs/serverCert.pem && \
sudo chown freerad:freerad /etc/ssl/certs/cacert.pem && \
echo "Permission for freeradius correctly added"

# Make a copy of the old eap file and users file and put ours.
sudo cp /etc/freeradius/3.0/mods-enabled/eap ~/eap-bck.bck && \
sudo cp /etc/freeradius/3.0/users ~/users-bck.bck && \
echo "Created backup files in ~" &&\
sudo cp radius/users /etc/freeradius/3.0/ && \
sudo cp radius/eap /etc/freeradius/3.0/mods-enabled/ && \
echo "New files in radius directory, starting freeradius in debbuging mode..." && \
echo "" && \
sudo freeradius -X
