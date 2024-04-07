#!/bin/bash

kill -9 `pidof tor`
# sleep 3
service tor start

# curl --socks5-hostname 127.0.0.1:9050 -s https://ipinfo.io/ip
cd $(dirname "$0")
./myip.sh


# # Check if tor and curl are installed
# if ! command -v tor &> /dev/null || ! command -v curl &> /dev/null; then
#     echo "Tor or curl not found. Please install Tor and curl to continue."
#     exit 1
# fi

# # Tor control port configuration
# control_port=9051
# password=""  # Set your Tor control password here if applicable

# # Request a new identity through the Tor control port
# function change_ip() {
#     curl --socks5-hostname 127.0.0.1:$control_port -s -H "Content-Type: application/json" -d '{
#         "auth": "'"$password"'",
#         "method": "signal",
#         "params": ["NEWNYM"],
#         "id": "1"
#     }' http://localhost:$control_port > /dev/null
# }

# # Check if the Tor control port is reachable
# function check_control_port() {
#     curl --socks5-hostname 127.0.0.1:$control_port -s http://localhost:$control_port > /dev/null
#     # return $?
#     return 0
# }

# # Main script
# if check_control_port; then
#     echo "Changing Tor IP..."
#     change_ip
#     echo "IP changed."
# else
#     echo "Tor control port is not reachable. Make sure Tor is running with control port enabled."
#     exit 1
# fi

# # systemctl show -p MainPID tor | cut -d= -f2 | xargs kill -HUP
# curl --socks5 localhost:9050 --socks5-hostname localhost:9050 -s https://check.torproject.org/ | cat | grep -m 1 Congratulations | xargs
# # curl --socks5-hostname 127.0.0.1:9050 https://ipinfo.io/ip