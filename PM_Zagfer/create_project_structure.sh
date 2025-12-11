#!/bin/bash
set -euo pipefail


############################################
# CONFIGURAÇÕES DO REPOSITÓRIO
############################################
REPO="eliezer-pires/zagfer"


# ------------------------------------------------
# PRE-REQUISITOS
# ------------------------------------------------
# - gh CLI instalado e autenticado (gh auth login)
# - jq instalado
# ------------------------------------------------
# VALIDAR PRE-REQUISITOS
if ! command -v gh &> /dev/null; then
    echo "Erro: GitHub CLI (gh) não encontrado. Por favor, instale-o (http://cli.github.com/) e autentique-se."
    exit 1
fi
if ! command -v jq &> /dev/null; then
    echo "Erro: jq não encontrado. Por favor, instale-o (https://stedolan.github.io/jq/)."
    exit 1
fi

# Verifica se 'gh' está autenticado
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
    echo "Erro: gh CLI não está autenticado. Por favor, execute 'gh auth login' para autenticar."
    exit 1
fi

echo "Repositório alvo: $REPO"


############################################
# LISTA DE MILESTONES A SEREM CRIADAS
############################################
declare -A MILESTONES_DUE=(
    ["Sprint 1 - Fundação do Projeto"]="2025-12-24T23:59:59Z"
    ["Sprint 2 - Observabilidade e Autenticação"]="2026-01-07T23:59:59Z"
    ["Sprint 3 - Resiliência"]="2026-01-21T23:59:59Z"
    ["Sprint 4 - CI/CD Foundations"]="2026-02-04T23:59:59Z"
    ["Sprint 5 - Monitoramento Avançado"]="2026-02-18T23:59:59Z"
    ["Sprint 6 - Polimento e Documentação"]="2026-03-04T23:59:59Z"
    )

############################################
# 1. CRIAR TODAS AS MILESTONES
############################################
echo "==> Criando milestones..."

for TITLE in "${MILESTONES[@]}"; do
  echo "Criando milestone: $TITLE"
  gh api repos/$REPO/milestones \
    -f title="$TITLE" \
    -f state=open >/dev/null
done

############################################
# 2. CAPTURAR IDs DAS MILESTONES
############################################
echo "==> Capturando IDs das milestones..."
gh api repos/$REPO/milestones \
  --jq '.[] | {id: .id, title: .title}' > milestones_ids.json

echo "Milestones capturadas:"
cat milestones_ids.json
echo ""

############################################
# FUNÇÃO PARA BUSCAR ID DA MILESTONE PELO NOME
############################################
get_milestone_id() {
  local TITLE="$1"
  jq -r --arg TITLE "$TITLE" 'select(.title == $TITLE) | .id' milestones_ids.json
}

############################################
# 3. CRIAR AS ISSUES A PARTIR DO ARQUIVO issues.json
############################################
echo "==> Criando issues..."

if [ ! -f issues.json ]; then
  echo "ERRO: Arquivo issues.json não encontrado!"
  exit 1
fi

NUM_ISSUES=$(jq length issues.json)
echo "$NUM_ISSUES issues encontradas no arquivo issues.json."

for i in $(seq 0 $((NUM_ISSUES - 1))); do
  TITLE=$(jq -r ".[$i].title" issues.json)
  BODY=$(jq -r ".[$i].body" issues.json)
  LABELS=$(jq -r ".[$i].labels[]" issues.json)
  ASSIGNEES=$(jq -r ".[$i].assignees" issues.json)
  MILESTONE_NAME=$(jq -r ".[$i].milestone" issues.json)

  # busca ID da milestone
  MILESTONE_ID=$(jq -r --arg NAME "$MILESTONE_NAME" 'select(.title == $NAME) | .id' milestones_ids.json)

  if [ -z "$MILESTONE_ID" ]; then
    echo "ERRO: Milestone '$MILESTONE_NAME' não encontrada para a issue '$TITLE'."
    continue
  fi

  echo "Criando issue: $TITLE (Milestone: $MILESTONE_NAME / ID: $MILESTONE_ID)"
  gh issue create \
    --title "$TITLE" \
    --body "$BODY" \
    --repo "$REPO" \
    --milestone "$MILESTONE_ID" \
    $(printf -- "--label %s " $LABELS) \
    --assignee "$ASSIGNEES"
done

echo "==> Processo concluído!"
