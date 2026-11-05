# Permission-Based Access Control

PoC de **Permission-Based Access Control** em Vue 3, TypeScript, Pinia e Vue Router. Autenticação e permissões são mockadas no formato esperado de um Laravel (`GET /api/me/permissions`).

A documentação completa da arquitetura — o que cada camada faz e quem chama quem — está em **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.

## Como rodar

```sh
npm install --legacy-peer-deps
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Entre como Administrador, Operador ou Visualizador e use o Permission Debugger para trocar o perfil sem recarregar a página.

```sh
npm run test:unit
npm run build
```

Node pedido pelo projeto: `^22.18.0` ou `>=24.12.0`. Em `v22.16.0` o install precisa de `--legacy-peer-deps`.
