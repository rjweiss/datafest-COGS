#!/bin/sh

load_file() {
  local INPUT_FILE=$1
  [ -z "${INPUT_FILE}" ] && echo "ERROR: File not specified" && return 1

  echo "Loading file ${INPUT_FILE}"
#  echo "mongoimport --jsonArray -d bills -c s112 ${INPUT_FILE}"
  time mongoimport --jsonArray -d bills -c s112 ${INPUT_FILE}
  return 0
}

process_dir() {
  echo "Processing" `pwd`
  for FILE in `find data/112 -name "*.json"`
  do
    load_file ${FILE}
    echo $FILE
  done

  return 0
}

main() {
  process_dir
}

main $*
exit 0
