#!/bin/bash

# Loop 50 times
for ((i=1; i<=33; i++))
do
  # Click the left mouse button
  xdotool click 1

  sleep 2

  # Press the Tab key
  xdotool key Tab

  sleep 1

  # Press the Enter key
  xdotool key Return

  # Adjust the sleep duration (in seconds) if needed
  sleep 4
done
