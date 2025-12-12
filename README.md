## 🐳 Rodar com Docker

### Desenvolvimento
\`\`\`bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
\`\`\`

### Produção
\`\`\`bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
\`\`\`

Veja [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) para mais detalhes.