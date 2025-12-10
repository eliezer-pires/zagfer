#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------
# CONFIGURAÇÃO INICIAL
# ------------------------------------------------
REPO="eliezer-pires/zagfer"

# VARIÁVEIS DE AMBIENTE
ASSIGNEE_PM="eliezer-pires"
ASSIGNE_DEVOPS="eliezer-pires"
ASSIGNE_FRONTEND=""
ASSIGNE_BACKEND=""

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

# ------------------------------------------------
# 1) CRIAR MILESTONES (Sprints)
# ------------------------------------------------
declare -A MILESTONES_DUE=(
    ["Sprint 1 - Fundação do Projeto"]="2025-12-24T23:59:59Z"
    ["Sprint 2 - Observabilidade e Autenticação"]="2026-01-07T23:59:59Z"
    ["Sprint 3 - Resiliência"]="2026-01-21T23:59:59Z"
    ["Sprint 4 - CI/CD Foundations"]="2026-02-04T23:59:59Z"
    ["Sprint 5 - Monitoramento Avançado"]="2026-02-18T23:59:59Z"
    ["Sprint 6 - Polimento e Documentação"]="2026-03-04T23:59:59Z"
    )

    echo "🚀 Criando milestones no repositório $REPO ..."
    declare -A MILESTONE_NUMBER_MAP # title -> number (use para criar issues)
    for title in "${!MILESTONES_DUE[@]}"; do
        due_on="${MILESTONES_DUE[$title]}"
        echo "📌 Criando: $title (prazo: $due_on)"

        # Criar milestone e capturar JSON de retorno
        resp=$(gh api repos/$REPO/milestones \
            -f title="$title" \
            -f state="open" \
            -f description="Milestone do projeto $REPO" \
            -f due_on="$due_on" \
            2>/dev/null || true)
            
        # Se existir retorno JSON válido, extrair o campo .number (número da milestone)
        if [ -n "$resp" ]; then
            number=$(echo "$resp" | jq -r '.number')
            # Se number for 'null' talvez já exista - buscar existente
            if [ "$number" = "null" ]; then
                # procurar milestone existente pelo título
            number=$(gh api repos/$REPO/milestones --jq ".[] | select(.title==\"$title\") | .number" 2>/dev/null || true)
            fi
        else
            # fallback: procurar por um milestone existente com esse title
            number=$(gh api repos/$REPO/milestones --jq ".[] | select(.title==\"$title\") | .number" 2>/dev/null || true)
        fi

        if [ -z "$number" ] || [ "$number" = "null" ]; then
            echo "⚠️ Não foi possível obter número da milestone '$title'. Verifique manualmente."
        else
            echo "  → milestone criado/encontrado: number=$number"
            MILESTONE_NUMBER_MAP["$title"]=$number
        fi
    done

    echo
    echo "====== Map de milestones (title -> number) ======"
    for k in "${!MILESTONE_NUMBER_MAP[@]}"; do
        echo "  '$k' -> ${MILESTONE_NUMBER_MAP[$k]}"
    done



    # -------------------------
# 2) ISSUES (JSON embutido)
# -------------------------
# Definimos cada issue com: title, body, assignees (array), milestone_title, labels (array)
# OBS: troque os valores ASSIGNEE_* no topo do arquivo para nomes reais dos GitHub users.
