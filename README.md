# 🚀 Mainframe Bridge — COBOL to Modern APIs

**Mainframe Bridge** é uma plataforma de modernização que utiliza Inteligência Artificial (Google Gemini) para transformar layouts de dados legados do Mainframe (COBOL Copybooks) em infraestrutura moderna de software.

Este projeto resolve o gap entre sistemas legados de alta performance e arquiteturas modernas de microserviços, convertendo estruturas complexas de dados em interfaces TypeScript, validações Zod e esquemas JSON em segundos.

![Preview do Projeto](COBOL/mainframe-bridge/src/assets/hero.png)

## ✨ Funcionalidades

- **Tradução Inteligente:** Converte COBOL Copybooks para TypeScript Interfaces.
- **Validação de Dados:** Gera esquemas de validação automática com **Zod**.
- **Contratos de API:** Cria definições **JSON Schema** para integração imediata.
- **Mapeamento Semântico:** Identifica automaticamente os tipos de dados e tamanhos de campos (offsets).
- **Destaque de Sintaxe:** Interface intuitiva com visualização de código para COBOL e linguagens modernas.
- **Insights de IA:** Gera documentação técnica detalhada sobre a estrutura legada.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** com **Vite**
- **Tailwind CSS 4** para interface ultra-moderna
- **Destaque de Sintaxe** personalizado

### Backend
- **Node.js** com **Express**
- **Google Gemini API** (IA Generativa para tradução de código)
- **CORS** para comunicação segura

## 🚀 Como Rodar o Projeto

### 1. Requisitos
- Node.js instalado
- Uma chave de API do Google Gemini

### 2. Configuração do Backend
```bash
cd COBOL_API
npm install
```
Crie um arquivo `.env` na pasta `COBOL_API` com sua chave:
```env
GEMINI_API_KEY=sua_chave_aqui
```
Inicie o servidor:
```bash
npm start
```

### 3. Configuração do Frontend
Em uma nova aba do terminal:
```bash
cd COBOL/mainframe-bridge
npm install
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

## 📂 Estrutura do Repositório

- `/COBOL/mainframe-bridge`: Aplicação web (Frontend).
- `/COBOL_API`: Servidor de integração com a IA (Backend).
- `/COBOL`: Exemplos de arquivos COBOL e JSON gerados.

---
Desenvolvido para acelerar a transformação digital em setores financeiros e governamentais que ainda dependem de sistemas legados.