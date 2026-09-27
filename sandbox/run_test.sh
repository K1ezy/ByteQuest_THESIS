#!/usr/bin/env bash
# Sandbox execution wrapper enforcing 5s execution timeout and 256MB memory cap
set -e

LANG_TYPE="$1"
INPUT_DATA="$2"
TIMEOUT_SEC=5

ulimit -v 262144 # 256 MB memory limit

if [ "$LANG_TYPE" = "python" ]; then
    timeout $TIMEOUT_SEC python3 solution.py <<< "$INPUT_DATA"
elif [ "$LANG_TYPE" = "cpp" ]; then
    g++ -O2 solution.cpp -o solution
    timeout $TIMEOUT_SEC ./solution <<< "$INPUT_DATA"
elif [ "$LANG_TYPE" = "java" ]; then
    javac Solution.java
    timeout $TIMEOUT_SEC java Solution <<< "$INPUT_DATA"
else
    echo "Unsupported sandbox runtime: $LANG_TYPE"
    exit 1
fi
