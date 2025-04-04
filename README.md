<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@koalarx/nest</h1>

<p align="center">Uma abstração <a href="https://nestjs.com" target="_blank">Nest.js</a> para APIs escaláveis.</p>

# Índice
1. [Introdução](#introdução)  
2. [Estrutura do Projeto](#estrutura-do-projeto)  
3. [Uso da CLI @koalarx/nest-cli](#uso-da-cli-koalarxnest-cli)  

---

## Introdução

Este projeto utiliza a CLI `@koalarx/nest-cli` para facilitar a criação de aplicações seguindo os princípios do Domain-Driven Design (DDD). A CLI automatiza a configuração inicial e a estruturação do projeto, permitindo que você comece rapidamente a desenvolver sua aplicação.  

---

## Estrutura do Projeto

A estrutura do projeto gerada pela CLI segue os princípios do DDD, separando as responsabilidades em camadas:  

- **application**: Contém a lógica de mapeamento e casos de uso.  
- **core**: Configurações e variáveis de ambiente.  
- **domain**: Entidades, DTOs, repositórios e serviços do domínio.  
- **host**: Controladores e ponto de entrada da aplicação.  
- **infra**: Implementações de infraestrutura, como banco de dados e serviços externos.

---

## Uso da CLI @koalarx/nest-cli

### Instalação da CLI

Certifique-se de instalar a CLI globalmente no seu ambiente:  

```bash
npm install -g @koalarx/nest-cli
```

### Criação de um Novo Projeto

Para criar um novo projeto, execute o seguinte comando:  

```bash
koala-nest new my-project
```

Este comando irá gerar um projeto com a estrutura recomendada e todas as dependências configuradas.

