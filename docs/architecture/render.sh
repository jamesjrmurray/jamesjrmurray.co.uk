#!/usr/bin/env bash
# Renders every diagram to SVG and PNG next to its .puml.
# Needs ONE of: Docker, or Java 17+ (PlantUML JAR is downloaded to ./.plantuml/ on first use).
# Diagrams use `!pragma layout smetana`, so Graphviz is not required.
# Never use a public rendering server — this is a private repo.
set -euo pipefail
cd "$(dirname "$0")"
FILES=(c1-system-context.puml c2-containers.puml c3-website-components.puml c3-delivery-pipeline.puml c4-consent-analytics.puml c4-viewer-request.puml)
if command -v docker >/dev/null 2>&1; then
  for fmt in svg png; do docker run --rm -v "$PWD":/w -w /w plantuml/plantuml -t"$fmt" "${FILES[@]}"; done
elif command -v java >/dev/null 2>&1 && java -version >/dev/null 2>&1; then
  JAR=.plantuml/plantuml.jar
  if [[ ! -f $JAR ]]; then
    mkdir -p .plantuml
    curl -fsSL -o "$JAR" https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar
  fi
  for fmt in svg png; do java -jar "$JAR" -t"$fmt" "${FILES[@]}"; done
else
  echo "Need Docker or Java 17+ to render. See README.md." >&2
  exit 1
fi
echo "Rendered ${#FILES[@]} diagrams to SVG and PNG."
