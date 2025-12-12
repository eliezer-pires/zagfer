# 🐳 Guia Docker - Zagfer

Guia completo para rodar o Zagfer com Docker em desenvolvimento e produção.

---

## 📋 Pré-requisitos

- **Docker**: versão 20.10+
- **Docker Compose**: versão 2.0+
- **Git**: para clonar o repositório
- **Mínimo 4GB RAM** disponível para Docker

**Verificar instalação:**
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (Primeira Execução)

### **1. Clone o repositório**
```bash
git clone https://github.com/eliezer-pires/zagfer.git
cd zagfer
```

### **2. Configure variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com seus valores
nano .env  # ou vim, ou seu editor preferido
```

**IMPORTANTE:** Mude pelo menos:
- `DB_PASSWORD` (senha do banco)
- `JWT_SECRET` (gere com: `openssl rand -hex 32`)
- `SESSION_SECRET` (gere com: `openssl rand -base64 32`)

### **3. Suba os containers**

**Ambiente de desenvolvimento:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Primeira vez vai demorar** (download de imagens + build).

### **4. Acesse a aplicação**

- **API/App**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Adminer (DB UI)**: http://localhost:8080

### **5. Parar os containers**
```bash
# Ctrl+C no terminal, depois:
docker-compose down
```

---

## 🔧 Comandos Essenciais

### **Desenvolvimento**

```bash
# Subir em modo desenvolvimento (com hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Subir em background (detached)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f zagfer-app

# Rebuild (forçar rebuild das imagens)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v
```

### **Produção**

```bash
# Build para produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Subir em produção (background)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Escalar aplicação (3 réplicas)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale zagfer-app=3

# Restart de um serviço
docker-compose restart zagfer-app

# Parar produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## 📊 Comandos Úteis

### **Executar comandos dentro do container**

```bash
# Entrar no container
docker-compose exec zagfer-app sh

# Rodar migrations
docker-compose exec zagfer-app npm run db:migrate

# Rodar seeds
docker-compose exec zagfer-app npm run db:seed

# Rodar testes
docker-compose exec zagfer-app npm test

# Instalar nova dependência
docker-compose exec zagfer-app npm install nome-do-pacote
```

### **Banco de dados**

```bash
# Acessar PostgreSQL
docker-compose exec zagfer-db psql -U zagfer -d zagfer

# Backup do banco
docker-compose exec zagfer-db pg_dump -U zagfer zagfer > backup-$(date +%Y%m%d).sql

# Restaurar backup
cat backup-20241208.sql | docker-compose exec -T zagfer-db psql -U zagfer -d zagfer

# Ver tamanho do banco
docker-compose exec zagfer-db psql -U zagfer -d zagfer -c "SELECT pg_size_pretty(pg_database_size('zagfer'));"
```

### **Limpeza e manutenção**

```bash
# Remover containers parados
docker-compose rm

# Limpar tudo (containers, networks, volumes)
docker-compose down -v --remove-orphans

# Remover imagens não usadas
docker image prune -a

# Ver uso de disco do Docker
docker system df

# Limpar tudo do Docker (CUIDADO!)
docker system prune -a --volumes
```

---

## 🔍 Troubleshooting

### **Problema: Container não sobe**

```bash
# Ver logs detalhados
docker-compose logs zagfer-app

# Rebuild forçado
docker-compose build --no-cache zagfer-app

# Remover tudo e recriar
docker-compose down -v
docker-compose up --build
```

### **Problema: Porta já em uso**

```bash
# Descobrir o que está usando a porta 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Ou mude a porta no .env
API_PORT=3001
```

### **Problema: Banco não conecta**

```bash
# Verificar se DB está rodando
docker-compose ps zagfer-db

# Ver logs do banco
docker-compose logs zagfer-db

# Aguardar DB estar pronto (às vezes demora)
docker-compose exec zagfer-app timeout 30 sh -c 'until pg_isready -h zagfer-db; do sleep 1; done'
```

### **Problema: Sem espaço em disco**

```bash
# Ver uso de disco do Docker
docker system df

# Limpar caches
docker builder prune
docker image prune -a
docker volume prune
```

### **Problema: Hot reload não funciona**

No Windows/WSL2, pode haver problemas com file watching. Soluções:

```bash
# 1. Aumentar limite de watchers (Linux/WSL)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Usar polling no Vite (adicionar em vite.config.ts)
server: {
  watch: {
    usePolling: true
  }
}
```

---

## 🏗️ Estrutura de Arquivos Docker

```
zagfer/
├── docker-compose.yml           # Base (comum a todos ambientes)
├── docker-compose.dev.yml       # Overrides para desenvolvimento
├── docker-compose.prod.yml      # Overrides para produção
├── Dockerfile                   # Build da aplicação (criar)
├── .dockerignore               # Arquivos a ignorar no build (criar)
├── .env.example                # Template de variáveis
├── .env                        # Suas variáveis (NÃO commitar!)
├── nginx/
│   ├── nginx.conf              # Config do Nginx (criar se usar)
│   └── certs/                  # Certificados SSL
├── scripts/
│   ├── backup-db.sh            # Script de backup
│   └── restore-db.sh           # Script de restore
└── backups/                    # Backups do banco
```

---

## 📦 Próximos Passos

### **Testar Localmente**

```bash
# Subir ambiente de desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Em outro terminal, verificar se está funcionando
curl http://localhost:3000/health

```
---

## 💡 Dicas Avançadas

### **Performance**

```bash
# Build paralelo (mais rápido)
COMPOSE_PARALLEL_LIMIT=10 docker-compose up --build

# Usar BuildKit (build mais rápido e com cache melhor)
DOCKER_BUILDKIT=1 docker-compose build
```

### **Segurança**

```bash
# Scan de vulnerabilidades
docker scan zagfer:latest

# Verificar secrets vazados
docker history zagfer:latest --no-trunc | grep -i secret
```

### **Monitoramento**

```bash
# Stats em tempo real
docker stats

# Logs estruturados
docker-compose logs -f --tail=100 | jq .

# Export de métricas
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 📚 Recursos Adicionais

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

---

## 🆘 Ajuda

**Problemas?** Abra uma issue no GitHub ou consulte:
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
- Health: `curl http://localhost:3000/health`

**Dúvidas?** Consulte o time de DevOps! 🚀