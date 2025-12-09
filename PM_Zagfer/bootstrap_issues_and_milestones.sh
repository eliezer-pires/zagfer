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
    
)