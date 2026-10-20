export interface ValidationIssue {
  path: string;
  message: string;
}

export class ObservatorioValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super("O lote do Observatorio contem dados invalidos.");
    this.name = "ObservatorioValidationError";
    this.issues = issues;
  }
}

export class ObservatorioRepositoryError extends Error {
  readonly operation: string;

  constructor(operation: string, options?: ErrorOptions) {
    super("Nao foi possivel acessar os dados privados do Observatorio.", options);
    this.name = "ObservatorioRepositoryError";
    this.operation = operation;
  }
}

export class ObservatorioAccessError extends Error {
  constructor() {
    super("Acesso nao autorizado aos dados privados do Observatorio.");
    this.name = "ObservatorioAccessError";
  }
}
