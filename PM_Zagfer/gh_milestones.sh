#!/bin/bash
set -euo pipefail

REPO="eliezer-pires/zagfer"

declare -A milestones=(
  ["Sprint 1 - Fundação do Projeto"]="2025-12-24T23:59:59Z"
  ["Sprint 2 - Observabilidade e Autenticação"]="2026-01-07T23:59:59Z"
  ["Sprint 3 - Resiliência"]="2026-01-21T23:59:59Z"
  ["Sprint 4 - CI/CD Foundations"]="2026-02-04T23:59:59Z"
  ["Sprint 5 - Monitoramento Avançado"]="2026-02-18T23:59:59Z"
  ["Sprint 6 - Polimento e Documentação"]="2026-03-04T23:59:59Z"
)

# -------------------------
# Pré-requisitos
# -------------------------
if ! command -v gh >/dev/null 2>&1; then
  echo "Erro: gh CLI não encontrado. Instale: https://cli.github.com/"
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "Erro: jq não encontrado. Instale: sudo apt install jq"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Por favor autentique-se: gh auth login"
  exit 1
fi

echo "🚀 Criando milestones no repositório $REPO ..."
for title in "${!milestones[@]}"; do
  due_on="${milestones[$title]}"
  echo "📌 Criando: $title (prazo: $due_on)"

  gh api repos/$REPO/milestones \
    -f title="$title" \
    -f state="open" \
    -f description="Milestone do projeto $REPO" \
    -f due_on="$due_on" \
    > /dev/null 2>&1 || true
done

# Capturar IDs e títulos das milestones
echo "Listando milestones e salvando dados em milestones_ids.json ..."
gh api repos/$REPO/milestones \
  --jq '.[] | {number: .number, title: .title}' | jq -s '.' > milestones_ids.json

echo "Arquivo milestones_ids.json criado:"
cat milestones_ids.json
echo ""
echo "✅ Todas as milestones foram criadas!"

echo "Mapeando títulos de milestones para IDs..."
declare -A MILESTONE_MAP=()
while IFS=$'\t' read -r number title; do
  title=$(echo "$title" | sed 's/^"//; s/"$//')
  MILESTONE_MAP["$title"]="$number"
done < <(jq -r '.[] | "\(.number)\t\(.title)"' milestones_ids.json)

echo "✅ Map de milestones (title -> number):"
for t in "${!MILESTONE_MAP[@]}"; do
  printf " - %s -> %s\n" "$t" "${MILESTONE_MAP[$t]}"
done
echo "✅ Mapeamento concluído!"

# Importando as Issues
echo "🚀 Importando issues do arquivo issues.json ..."
while IFS= read -r issue; do
  title=$(echo "$issue" | jq -r '.title')
  body=$(echo "$issue" | jq -r '.body')
  assignees=$(echo "$issue" | jq -r '.assignees | join(",")')
  milestone_title=$(echo "$issue" | jq -r '.milestone')  
  labels=$(echo "$issue" | jq -r '.labels | join(",")')

  # Verificar se a milestone existe no mapeamento
  if [[ -z "${MILESTONE_MAP[$milestone_title]:-}" ]]; then
    echo "❌ ERRO: Milestone '$milestone_title' não encontrada no mapeamento!"
    echo "   Issue: $title"
    echo "   Milestones disponíveis:"
    for t in "${!MILESTONE_MAP[@]}"; do
      echo "     - $t"
    done
    continue
  fi

  milestone_id=${MILESTONE_MAP["$milestone_title"]}

  echo "📌 Criando issue: $title (milestone: $milestone_title -> ID: $milestone_id)"

  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --assignee "$assignees" \
    --milestone "$milestone_title" \
    --label "$labels"
done < <(jq -c '.[]' issues.json)

echo ""
echo "✅ Todas as issues foram criadas!"