# Checklist de testes manuais

Verificações que os testes unitários não cobrem. Rode no emulador ou em um aparelho (`npm run android`). Marque os itens conforme avança.

## 0. Preparação

- [ ] `npm install` e depois `npm run android`; o app abre.
- [ ] Splash com o ícone da pipoca sobre fundo `#1A1222` e, em seguida, o app; o nome no launcher do Android é `Couch Queue` e o ícone é a pipoca sobre quadrado rosa.
- [ ] Três abas, nesta ordem: `Fila`, `Já vistos`, `Manutenção`. O cabeçalho com o nome `Couch Queue` aparece em todas.

## 1. Fila

- [ ] Grupo: tocar no card `Grupo` abre a lista; escolher outro grupo troca a fila e o filtro volta para `Todos`; fechar e reabrir o app mantém o grupo escolhido.
- [ ] Excluir em Manutenção o grupo selecionado: a Fila mostra o primeiro grupo.
- [ ] Adicionar (`+`): nome vazio mostra `Informe o nome.`; o título novo vai para o fim da fila do grupo atual; com filtro ativo, o streaming do filtro vem pré-selecionado.
- [ ] Sem streamings cadastrados: o formulário mostra `Cadastre um streaming em Manutenção.` e `Salvar` fica desativado.
- [ ] Editar: tocar na linha abre `Editar título` com os dados; salvar altera; `Excluir` pede `Excluir "<nome>"?` e remove.
- [ ] Arrastar pelo ícone à esquerda reordena com `Todos`; a ordem persiste após reiniciar o app.
- [ ] A rolagem da lista continua funcionando fora do ícone e o início do arraste não briga com a rolagem. Se brigar, trocar o ícone de `onPressIn` para `onLongPress`.
- [ ] Com um streaming no filtro, o ícone de arrastar some e não é possível reordenar.
- [ ] Filtrar por um streaming e marcar o último título dele como visto: o filtro volta para `Todos`.
- [ ] Marcar como visto: aparece `"<nome>" foi para Já vistos` por cerca de 5 s; `Desfazer` devolve o título para a mesma posição; marcar outro título substitui o aviso.
- [ ] Fila vazia mostra `Nada na fila. Toque em + para adicionar.`.
- [ ] Nomes longos ficam em uma linha com reticências; com fonte grande, botões continuam acessíveis e o aviso não cobre o `+`.
- [ ] Teclado: no formulário de título, com o teclado aberto, o botão `Salvar` continua visível ou alcançável. O `ModalShell` não trata o teclado (risco conhecido); se `Salvar` ficar escondido, adicionar tratamento de teclado.

## 2. Já vistos

- [ ] Sem títulos vistos: mostra `Nenhum título visto ainda.`.
- [ ] Trocar o grupo no card `Grupo` mostra o histórico do outro grupo; a escolha é a mesma da Fila.
- [ ] Cada linha mostra nome (uma linha), streaming, `Série`/`Filme` e `Visto em <dia> <mês> <ano>`; o mais recente aparece primeiro.
- [ ] `Voltar para a lista` tira o título do histórico e o coloca no fim da Fila do grupo.
- [ ] Lixeira pede `Excluir "<nome>"?`; `Cancelar` mantém, `Excluir` remove.
- [ ] Com fonte grande e nome longo, a linha não corta os botões e todos os alvos têm pelo menos 44 dp.

## 3. Manutenção: grupos e streamings

- [ ] Grupos: adicionar cria `Grupo N`; renomear na própria linha salva e o novo nome aparece na Fila e em Já vistos; nome em branco é ignorado.
- [ ] Excluir um grupo com títulos pede confirmação citando a exclusão dos títulos; confirmar remove o grupo, a fila e o histórico dele; `Cancelar` mantém tudo.
- [ ] Com um único grupo, excluir é bloqueado com `É preciso manter ao menos um grupo.`.
- [ ] Streamings: adicionar cria `Streaming N`; renomear na linha atualiza as tags dos títulos; excluir um streaming sem títulos pede confirmação e remove.
- [ ] Excluir um streaming usado por algum título (na fila ou no histórico) é bloqueado com mensagem.
- [ ] Teclado: ao renomear um grupo ou streaming, o campo e os botões não ficam escondidos pelo teclado.

## 4. Manutenção: histórico e limpeza

- [ ] Períodos disponíveis: `1 mês`, `3 meses`, `6 meses`, `12 meses`, `Nunca apagar`; o padrão em instalação nova é `3 meses` e a escolha persiste após reiniciar.
- [ ] Reduzir o período quando há títulos vistos mais antigos que o novo corte: a confirmação mostra a contagem certa; `Cancelar` mantém dados e período antigo; confirmar apaga e salva.
- [ ] Reduzir o período sem nada a apagar: salva sem confirmação.
- [ ] Limpeza ao reiniciar: com período de 1 mês e um título visto há mais de 1 mês (ajuste a data do aparelho se preciso), reiniciar o app o remove; títulos na fila nunca somem; `Nunca apagar` não remove nada.

## 5. Backup, restauração e limpeza

- [ ] `Fazer backup` abre o compartilhamento com `couch-queue-backup-AAAA-MM-DD.cqb`; salvar em um local acessível.
- [ ] `Limpar tudo` pede confirmação; ao confirmar, restam o grupo `Eu sozinha`, os 7 streamings padrão e nenhum título.
- [ ] `Restaurar backup` com o arquivo salvo pede confirmação e devolve grupos, streamings, filas e históricos como estavam.
- [ ] Restaurar um arquivo `.cqb` editado à mão (alterar um nome sem refazer o hash) ou corrompido (texto truncado ou aleatório): mostra mensagem de erro em português e os dados atuais continuam intactos.
- [ ] Restaurar com `Cancelar` no seletor de arquivos não altera nada.
- [ ] O período do histórico e o grupo selecionado não mudam com restaurar ou limpar (são configurações do aparelho), e o grupo selecionado cai para o primeiro se deixou de existir.

## 6. Aparência e acessibilidade

- [ ] Fonte do sistema no tamanho máximo: nenhuma tela corta texto ou botão, e os alvos de toque têm pelo menos 44 dp.
- [ ] Largura estreita (emulador pequeno ou janela reduzida): chips, linhas e modais continuam legíveis, sem rolagem horizontal.
- [ ] Teclado nos modais (grupo, formulário de título): o campo e os botões do modal continuam alcançáveis com o teclado aberto.
