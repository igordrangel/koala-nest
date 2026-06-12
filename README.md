# koala-nest

Desenvolvido para acelerar o desenvolvimento de APIs estaláveis, utilizando DDD e ferramentas que auxiliam na criação de APIs de fácil manutenção, customização, escaláveis e saudáveis.

## Getting Started

Consulte o guia [GETTING_STARTED.md](./GETTING_STARTED.md) para instalar dependências, rodar a CLI interativa e entender a estrutura dos comandos.

## CLI

O koala-nest possui uma CLI poderosa que irá lhe auxiliar na criação de uma API em branco do zero, informando quais estratégias de autenticação, autorização, cache, documentação, persistência de dados, suite de testes unitários e E2E além de outras funcionalidades menores como health-check para um start de porjeto mais robusto e pronto para já começar a implementar suas regras de negócio.

Caso já possua um projeto você poderá instalar individualmente os módulos também, como a parte de autenticação ou ORM de integração com banco dados.

A CLI irá instalar as funcionalidades diretamente no seu projeto, semelhante ao que acontece com bibliotecas como shadcn, garantindo total liberdade e evitando dependência da biblioteca futuramente, onde você mesmo poderá abrir o código e fazer as adaptações ou mudanças necessárias para o seu projeto.

O KoalaNest é um facilitador para acelerar seu desenvolvimento entregando módulos já prontos e testados, podendo inclusive ser passada para Agentes de IA através do link http://nest.koalarx.com/llm.txt que fornecerá um índice da documentação e a partir dali implementar de forma mais acertiva seu projeto utilizando o KoalaNest.

### Comandos

#### new
Para criar um projeto novo utilize o comando: 

```bash
kl-nest new example 
```

#### add
Para incluir módulos utilize o comando:

```bash
kl-nest add auth 
```

#### version
Para verificar a versão atual da CLI

```bash
kl-nest version
```

#### help
Para receber uma lista de comandos e módulos disponíveis
```bash
kl-nest --help
```