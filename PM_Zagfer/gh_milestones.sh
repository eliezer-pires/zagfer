#!/bin/bash

REPO="eliezer-pires/zagfer"

declare -A milestones=(
  ["Sprint 1 - Fundação do Projeto"]="2025-12-24T23:59:59Z"
  ["Sprint 2 - Observabilidade e Autenticação"]="2026-01-07T23:59:59Z"
  ["Sprint 3 - Resiliência"]="2026-01-21T23:59:59Z"
  ["Sprint 4 - CI/CD Foundations"]="2026-02-04T23:59:59Z"
  ["Sprint 5 - Monitoramento Avançado"]="2026-02-18T23:59:59Z"
  ["Sprint 6 - Polimento e Documentação"]="2026-03-04T23:59:59Z"
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