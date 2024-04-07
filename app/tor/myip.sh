#!/bin/bash

echo "IP:" `curl --socks5-hostname 127.0.0.1:9050 -s https://api.ipify.org/?format=text` &