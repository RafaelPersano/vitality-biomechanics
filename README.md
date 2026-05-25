# Vitality - Plataforma Biomecânica de Exercícios e Treino

Uma aplicação web moderna desenvolvida com React, TypeScript, Tailwind CSS (v4) e Firebase Firestore para gerenciamento de treinos adaptativos, biomecânica e comunicação entre Alunos, Personal Trainers e Administradores.

## 🚀 Funcionalidades

- **Dashboard do Aluno**: Acesso a programas de longevidade, estatísticas de evolução, controle de hidratação, cronômetros de treinos narrados por voz e visualizadores de biomecânica.
- **Painel do Personal Trainer**: Criação e estruturação de sequências de treinos personalizadas, revisão de vídeos de feedback postural enviados pelos alunos e controle de alunos em tempo real.
- **Painel do Administrador**: Liberação de novos exercícios gerais gerados, mural de desafios de longevidade e monitoramento geral de dados.
- **Sistema de Notificações Push**: Envio de comunicados gerais ou direcionados a alunos específicos a partir do Firestore em tempo real.
- **Filtro Avançado de Biomecânica**: Banco de dados biomecânicos detalhados sobre execução de exercícios (como agachamento, prancha, flexão).

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
- Node.js instalado (versão 18 ou superior).
- npm ou yarn.

### 2. Clonar ou Baixar o Projeto
Após clonar ou extrair o ZIP em seu computador, navegue até a pasta do projeto:
```bash
git clone <url-do-seu-repositorio-github>
cd vitality
```

### 3. Instalar Dependências
Instale todos os pacotes configurados:
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` (ou `.env.local`):
```bash
cp .env.example .env
```
Preencha as configurações do seu projeto Firebase e chave de API do Gemini caso utilize recursos inteligentes.

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.
