#!/bin/bash

REPO="eliezer-pires/material-deram-trace"

declare -A milestones=(
  ["Sprint 1 - Configuração Inicial"]="2025-09-16T23:59:59Z"
  ["Sprint 2 - Backend Estrutura Base"]="2025-09-23T23:59:59Z"
  ["Sprint 3 - Frontend Estrutura Base"]="2025-09-30T23:59:59Z"
  ["Sprint 4 - Integração Frontend + Backend"]="2025-10-07T23:59:59Z"
  ["Sprint 5 - Refino + DevOps"]="2025-10-14T23:59:59Z"
  ["Sprint 6 - Finalização e Documentação"]="2025-10-21T23:59:59Z"
)

echo "🚀 Criando milestones no repositório $REPO ..."
for title in "${!milestones[@]}"; do
  due_on="${milestones[$title]}"
  echo "📌 Criando: $title (prazo: $due_on)"

  gh api repos/$REPO/milestones \
    -f title="$title" \
    -f state="open" \
    -f description="Milestone do projeto $REPO" \
    -f due_on="$due_on" \
    > /dev/null
done

# Capturar IDs e títulos das milestones
echo "Listando milestones e salvando IDs..."
gh api repos/$REPO/milestones \
  --jq '.[] | {id: .id, title: .title}' > milestones_ids.json

echo "✅ Todas as milestones foram criadas!"

echo "Mapeando títulos de milestones para IDs..."
declare -A milestone_ids
while read -r id title; do
    milestone_ids["$title"]="$id"
done < <(jq -r '.[] | "\(.title) \(.id)"' milestones_ids.json)
echo "✅ Mapeamento concluído!"

# Importando as Issues
echo "🚀 Importando issues do arquivo issues.json ..."
cat issues.json | jq -c '.[]' | while read issue; do
  title=$(echo $issue | jq -r '.title')
  body=$(echo $issue | jq -r '.body')
  assignees=$(echo $issue | jq -r '.assignees | join(",")')
  # Obtenha o título da milestone
  milestone_title=$(echo $issue | jq -r '.milestone')
  # Obtenha o ID correspondente
  milestone_id=${milestone_ids[$milestone_title]}
  labels=$(echo $issue | jq -r '.labels | join(",")')

  gh issue create \
    --repo $REPO \
    --title "$title" \
    --body "$body" \
    --assignee "$assignees" \
    --milestone "$milestone_id" \
    --label "$labels"
done