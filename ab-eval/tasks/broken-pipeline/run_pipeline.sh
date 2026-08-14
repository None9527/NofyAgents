#!/usr/bin/env bash
# Pipeline: sort data.csv rows by value (ascending), then format
# "name=value" lines into report.txt (header row excluded).
tail -n +3 data.csv | sort -t, -k1 -n > sorted.csv
while IFS=, read -r name value; do
  echo "$name=$value"
done < sorted.csv > report.tx
echo "PIPELINE DONE"
