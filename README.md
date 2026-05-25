# Vitality - Plataforma Biomecânica de Exercícios e Treino

Uma aplicação web moderna desenvolvida com React, TypeScript, Tailwind CSS (v4) e Firebase Firestore para gerenciamento de treinos adaptativos, biomecânica e comunicação entre Alunos, Personal Trainers e Administradores.

## 🚀 Funcionalidades

- **Dashboard do Aluno**: Acesso a programas de longevidade, estatísticas de evolução, controle de hidratação, cronômetros de treinos narrados por voz e visualizadores de biomecânica.
- **Painel do Personal Trainer**: Criação e estruturação de sequências de treinos personalizadas, revisão de vídeos de feedback postural enviados pelos alunos e controle de alunos em tempo real.
- **Painel do Administrador**: Liberação de novos exercícios globais gerados, mural de desafios de longevidade e monitoramento geral de dados.
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

---

## 📦 Como Subir para o GitHub (Passo a Passo)

Siga estas instruções diretas para enviar seu código para um repositório no seu GitHub pessoal.

### Passo 1: Inicializar o Git localmente
Caso o projeto não tenha o Git inicializado, execute no terminal do projeto:
```bash
git init
```

### Passo 2: Adicionar as modificações ao stage
Adicione todos os arquivos de configuração, código-fonte e utilitários (o arquivo `.gitignore` garantirá que pastas pesadas como `node_modules` não sejam enviadas):
```bash
git add .
```

### Passo 3: Criar o primeiro commit
```bash
git commit -m "feat: implementa dashboard biomecanico e painel de notificacoes"
```

### Passo 4: Criar um Repositório Vazio no GitHub
1. Vá até o seu [GitHub](https://github.com) e conecte-se.
2. Clique no ícone de mais `+` no canto superior direito e selecione **"New repository"** (Novo repositório).
3. Dê um nome de sua escolha ao repositório (ex: `vitality-biomechanics`).
4. Mantenha as opções "Add a README file", "Add .gitignore" e "Choose a license" **desmarcadas** (pois já existem no projeto).
5. Clique em **"Create repository"** (Criar repositório).

### Passo 5: Vincular e Enviar
Copie as instruções que aparecem no GitHub para vincular seu repositório local ao remoto (substituindo `<seu-usuario>` e `<nome-do-repositorio>` pelos seus dados):

```bash
# Apontar para o branch principal
git branch -M main

# Conectar ao repositório do seu GitHub
git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git

# Enviar o código para o GitHub
git push -u origin main
```

---

## 📈 Scripts Disponíveis

* `npm run dev`: Executa a aplicação localmente.
* `npm run build`: Compila os arquivos para produção na pasta `dist/`.
* `npm run lint`: Valida o TypeScript e sintaxe do projeto para garantir conformidades.
