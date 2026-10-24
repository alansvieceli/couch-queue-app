# Checklist de testes manuais

Verificações que os testes unitários não cobrem. Rode no emulador ou em um aparelho (`npm run android`). Marque os itens conforme avança.

## Fila

- [ ] Grupo: tocar no card `Grupo` abre a lista; escolher outro grupo troca a fila e o filtro volta para `Todos`; fechar e reabrir o app mantém o grupo escolhido.
- [ ] Excluir em Manutenção o grupo selecionado: a Fila mostra o primeiro grupo.
- [ ] Adicionar (`+`): nome vazio mostra `Informe o nome.`; o título novo vai para o fim da fila do grupo atual; com filtro ativo, o streaming do filtro vem pré-selecionado.
- [ ] Sem streamings cadastrados: o formulário mostra `Cadastre um streaming em Manutenção.` e `Salvar` fica desativado.
- [ ] Editar: tocar na linha abre `Editar título` com os dados; salvar altera; `Excluir` pede `Excluir "<nome>"?` e remove.
- [ ] Arrastar pelo ícone à esquerda reordena com `Todos`; a ordem persiste após reiniciar o app; a rolagem da lista continua funcionando fora do ícone.
- [ ] Com um streaming no filtro, o ícone de arrastar some e não é possível reordenar.
- [ ] Filtrar por um streaming e marcar o último título dele como visto: o filtro volta para `Todos`.
- [ ] Marcar como visto: aparece `"<nome>" foi para Já vistos` por cerca de 5 s; `Desfazer` devolve o título para a mesma posição; marcar outro título substitui o aviso.
- [ ] Fila vazia mostra `Nada na fila. Toque em + para adicionar.`.
- [ ] Nomes longos ficam em uma linha com reticências; com fonte grande, botões continuam acessíveis e o aviso não cobre o `+`.
