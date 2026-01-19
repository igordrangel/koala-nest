---
'@koalarx/nest-cli': patch
---

Corrigido filtro do cpSync que estava bloqueando todos os arquivos quando CLI instalado globalmente. O filtro agora verifica apenas caminhos relativos ao template, evitando conflito com `/node_modules/` no caminho de instalação
