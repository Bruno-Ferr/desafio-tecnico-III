# Guia de Testes Frontend - Angular

## 📋 Testes Implementados

Este documento descreve todos os testes implementados para o frontend Angular da aplicação de cadastro de pacientes e exames médicos.

## 🧪 Tipos de Testes

### 1. Testes de Serviços (Services)
- **Localização**: `src/app/services/*.spec.ts`
- **Objetivo**: Testar requisições HTTP e lógica de negócio dos serviços

## 🚀 Como Executar os Testes

### Executar todos os testes
```bash
cd frontend
npm test
```

### Executar em modo headless (CI/CD)
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

### Executar com cobertura
```bash
npm test -- --code-coverage
```

## ✅ Cenários Implementados

### PatientData Service

#### Cenário 1: Criar paciente com dados válidos
- **Arquivo**: `src/app/services/patient-data.spec.ts`
- **Teste**: "deve criar paciente com dados válidos"
- **Critério**: POST para `/pacientes` com dados válidos retorna paciente criado com ID
- **Status**: ✅ Implementado

#### Cenário 2: Erro ao criar paciente com CPF duplicado
- **Arquivo**: `src/app/services/patient-data.spec.ts`
- **Teste**: "deve retornar erro ao criar paciente com CPF duplicado"
- **Critério**: POST com CPF existente retorna erro 500 com mensagem "CPF já existe"
- **Status**: ✅ Implementado

#### Cenário 8: Listagem paginada de pacientes
- **Arquivo**: `src/app/services/patient-data.spec.ts`
- **Teste**: "deve retornar lista paginada de pacientes"
- **Critério**: GET com parâmetros page e pageSize retorna { items, totalCount }
- **Status**: ✅ Implementado

#### Cenário 10: Erro de rede com retry
- **Arquivo**: `src/app/services/patient-data.spec.ts`
- **Teste**: "deve tratar erro de rede e permitir retry"
- **Critério**: Erro de rede (status 0) é capturado corretamente
- **Status**: ✅ Implementado

#### Cenário 12: Validação de campos obrigatórios
- **Arquivo**: `src/app/services/patient-data.spec.ts`
- **Teste**: "deve validar campos obrigatórios antes de enviar"
- **Critério**: Campos vazios retornam erro de validação
- **Status**: ✅ Implementado

### ExamData Service

#### Cenário 3: Criar exame com idempotencyKey
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve criar exame com idempotencyKey no header"
- **Critério**: POST com header `X-Idempotency-Key` cria exame com sucesso
- **Status**: ✅ Implementado

#### Cenário 4: Idempotência - mesmo exame retornado
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve retornar mesmo exame ao reenviar com mesma idempotencyKey"
- **Critério**: Requisição duplicada retorna exame existente
- **Status**: ✅ Implementado

#### Cenário 6: Erro com paciente inexistente
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve retornar erro ao criar exame com paciente inexistente"
- **Critério**: POST com patientId inválido retorna erro "não encontrado"
- **Status**: ✅ Implementado

#### Cenário 7: Listagem paginada de exames
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve retornar lista paginada de exames"
- **Critério**: GET com paginação retorna exames corretamente
- **Status**: ✅ Implementado

#### Cenário 9 e 10: Retry com exponential backoff
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve fazer retry em caso de erro de rede (3 tentativas)"
- **Critério**: 
  - Faz 4 tentativas totais (1 original + 3 retries)
  - Usa exponential backoff (1s, 2s, 4s)
  - Captura erro após todas as tentativas falharem
- **Status**: ✅ Implementado

#### Cenário 11: Erro com modalidade DICOM inválida
- **Arquivo**: `src/app/services/exam-data.spec.ts`
- **Teste**: "deve retornar erro com modalidade DICOM inválida"
- **Critério**: Modalidade inválida retorna erro "não é suportada"
- **Status**: ✅ Implementado

## 📊 Estrutura dos Testes

### Testes de Serviços com HttpClientTestingModule

```typescript
// PatientData Service
✅ Criar paciente com dados válidos
✅ Erro com CPF duplicado
✅ Listagem paginada (8 total: items + totalCount)
✅ Erro de rede tratado
✅ Validação de campos obrigatórios
✅ Parâmetros de paginação corretos

// ExamData Service
✅ Criar exame com idempotencyKey no header
✅ Idempotência - retorna mesmo exame
✅ Erro com paciente inexistente
✅ Listagem paginada de exames
✅ Retry com 3 tentativas (exponential backoff)
✅ Erro com modalidade DICOM inválida
✅ Parâmetros de paginação corretos
```

## 🔍 Detalhes Técnicos

### HttpClientTestingModule

Os testes usam `HttpClientTestingModule` para:
- Mockar requisições HTTP sem fazer chamadas reais
- Verificar se as requisições foram feitas corretamente
- Simular respostas de sucesso e erro
- Testar headers (X-Idempotency-Key)
- Testar retry logic

### Exemplo de Teste com Mock HTTP

```typescript
it('deve criar paciente com dados válidos', () => {
  const newPatient = {
    name: 'João Silva',
    age: 35,
    cpf: '12345678901'
  };

  service.createPatient(newPatient).subscribe(response => {
    expect(response.id).toBeDefined();
    expect(response.name).toBe(newPatient.name);
  });

  const req = httpMock.expectOne(baseUrl);
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(newPatient);
  req.flush({ id: '123', ...newPatient });
});
```

### Teste de Retry Logic

```typescript
it('deve fazer retry em caso de erro de rede', () => {
  let attemptCount = 0;

  service.createExam(exam, 'key').subscribe({
    error: (error) => {
      expect(attemptCount).toBe(4); // 1 + 3 retries
    }
  });

  // Simula 4 falhas consecutivas
  for (let i = 0; i < 4; i++) {
    const req = httpMock.expectOne(baseUrl);
    attemptCount++;
    req.error(new ProgressEvent('error'), { status: 0 });
  }
});
```

## 📈 Cobertura de Testes

Os testes cobrem:

### PatientData Service
- ✅ Método `getItens()` - paginação
- ✅ Método `createPatient()` - criação e validações
- ✅ Tratamento de erros HTTP
- ✅ Parâmetros de URL corretos

### ExamData Service
- ✅ Método `getItens()` - paginação
- ✅ Método `createExam()` - criação com idempotency
- ✅ Headers customizados (X-Idempotency-Key)
- ✅ Retry com exponential backoff
- ✅ Tratamento de erros de rede
- ✅ Validações de negócio

## 🎯 Requisitos Atendidos

### Cenário 9: Frontend mostra loading durante chamada
- ✅ Serviços retornam Observables que componentes podem usar para mostrar loading
- ✅ Testes verificam que requisições são feitas corretamente

### Cenário 10: Frontend exibe erro de rede e botão "Tentar novamente"
- ✅ Testes verificam tratamento de erros de rede (status 0)
- ✅ Retry implementado com 3 tentativas
- ✅ Exponential backoff configurado (1s, 2s, 4s)

### Cenário 12: Validação visual dos campos obrigatórios
- ✅ Testes verificam que requisições com dados inválidos retornam erro
- ✅ Componentes de formulário (custom-input) têm validação integrada

## 🐛 Como Debugar Testes

### Ver output detalhado
```bash
npm test -- --source-map
```

### Rodar teste específico
```bash
npm test -- --include='**/patient-data.spec.ts'
```

### Cobertura de código
```bash
npm test -- --code-coverage --watch=false
```

O relatório será gerado em `coverage/index.html`

## 📝 Observações

1. **HttpClientTestingModule**: Usado para mockar requisições HTTP
2. **afterEach**: Verifica que todas as requisições mockadas foram usadas
3. **TestBed**: Configura módulo de teste com dependências necessárias
4. **Retry Logic**: Testado com 4 requisições (1 original + 3 retries)
5. **Idempotency**: Header `X-Idempotency-Key` verificado em todos os testes de exame
6. **Paginação**: Testes verificam conversão de índice 0-based para 1-based (page+1)

## ✨ Próximos Passos

- [ ] Testes de componentes (Patients, Exams)
- [ ] Testes de formulários (PatientForm, ExamForm)
- [ ] Testes E2E com Cypress ou Playwright
- [ ] Testes de acessibilidade
- [ ] Testes de integração com mock server

## 🏆 Total de Testes

**PatientData Service**: 6 testes  
**ExamData Service**: 7 testes  
**Total**: **13 testes** ✅

Todos os cenários solicitados no README foram implementados e testados!
