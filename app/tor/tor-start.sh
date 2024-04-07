#!/bin/bash

service tor start

cd $(dirname "$0")
./myip.sh