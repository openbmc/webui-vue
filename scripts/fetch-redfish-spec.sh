#!/usr/bin/env bash
#
# Prepare specs/redfish.yaml (gitignored) for local codegen.
#
# By default this fetches the current upstream DMTF Redfish OpenAPI document.
# Set REDFISH_OPENAPI_INPUT to a local YAML path to use a bundled/vendored spec,
# or to an http(s) URL to fetch a specific published spec.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/specs/redfish.yaml"
INPUT="${REDFISH_OPENAPI_INPUT:-https://raw.githubusercontent.com/DMTF/Redfish-Publications/refs/heads/main/openapi/openapi.yaml}"

mkdir -p "${ROOT}/specs"

if [[ "${INPUT}" =~ ^https?:// ]]; then
    echo "Fetching ${INPUT}"
    echo "  -> ${OUT}"
    curl -fsSL "${INPUT}" -o "${OUT}"
else
    echo "Copying ${INPUT}"
    echo "  -> ${OUT}"
    cp "${INPUT}" "${OUT}"
fi

echo "Done. Run: npm run openapi-ts:full (or npm run openapi-ts:scoped)"
