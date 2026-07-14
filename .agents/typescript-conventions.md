# Convenções TypeScript (template / CLI)

Regras de estilo para código gerado e mantido neste monorepo (`libs/koala-nest`, patches da CLI).

## Ordem de membros em classes

### Visibilidade

`private` → `protected` → `public` (vale para **atributos** e **métodos**).

### Ordem estrutural

1. Atributos privados
2. Atributos protected
3. Atributos públicos
4. Construtor
5. Métodos privados
6. Métodos protected
7. Métodos públicos

### Ordem por dependência

Dentro do mesmo grupo de visibilidade, ordene por **dependência**: o membro **usado** vem **antes** de quem o usa.

- Helper privado que outro método privado chama → helper primeiro
- Método que `handle()` / `validate()` chamam → antes do caller público/protegido
- Evite referências “para cima” na lista de métodos da classe

```typescript
@Injectable()
export class ExampleService {
  private readonly dependency: Dependency;

  protected readonly option: string;

  public readonly label: string;

  constructor(dependency: Dependency) {
    this.dependency = dependency;
    this.option = 'default';
    this.label = 'example';
  }

  private normalize(value: string): string {
    return value.trim();
  }

  private buildPayload(value: string): object {
    return { value: this.normalize(value) };
  }

  protected canRun(): boolean {
    return true;
  }

  async handle(raw: string): Promise<object> {
    if (!this.canRun()) {
      return {};
    }

    return this.buildPayload(raw);
  }
}
```

Não misture visibilidades fora dessa ordem (ex.: atributo/método público no meio de private/protected).
