/**
 * Como a origem da API Key é validada na strategy.
 * - domain: IP do cliente vs IP/domínio cadastrado (+ subnet interna opcional)
 * - host: hostname da requisição
 * - uri: hostname + path (sem params de rota)
 */
export enum ApiKeyType {
  domain = 'domain',
  host = 'host',
  uri = 'uri',
}
