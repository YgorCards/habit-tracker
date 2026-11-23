# Ritmo — Habit Tracker

Aplicação web para registrar hábitos, anotar atividades e acompanhar o tempo dedicado a cada um. O projeto está em desenvolvimento como MVP e prioriza uma experiência compacta para celular.

## Funcionalidades atuais

### Hoje

- Mostra o tempo de foco e a quantidade de atividades no dia selecionado.
- Exibe cada atividade em um card com o nome do hábito, os minutos e a nota, quando houver.
- Permite remover um registro.
- Inclui um calendário mensal para consultar outro dia. Um ponto marca os dias com atividade.
- Um dia selecionado no heatmap também abre nesta tela.

### Heatmap

- Mostra um heatmap independente para cada hábito, cobrindo os últimos 12 meses.
- Cada quadrado indica apenas se houve atividade naquele dia; não há níveis de intensidade.
- Cada hábito tem uma cor própria, escolhida ao criá-lo.
- Exibe, de forma compacta, quantos dias têm atividade e o tempo total registrado para o hábito.
- Tocar em um dia abre os registros correspondentes na tela Hoje.
- O heatmap pode ser rolado horizontalmente em telas estreitas.

### Hábitos

- Permite criar um hábito informando o nome e escolhendo uma entre seis cores. Cores podem se repetir.
- Permite registrar uma atividade associada a um hábito, informando data, duração em minutos e nota opcional.
- Exibe um modal de confirmação após criar o hábito ou salvar a atividade.
- A tela mantém somente os formulários de criação e registro; a lista e os dados agregados dos hábitos aparecem no Heatmap.

## Dados e persistência

- Hábitos e registros são salvos no `localStorage` do navegador.
- Na primeira abertura, o app usa hábitos e registros de demonstração para preencher a interface.
- Os dados são locais ao navegador e ao dispositivo. Ainda não há contas, backend ou sincronização entre dispositivos.
- A estrutura atual de um registro inclui hábito, data, duração em minutos e nota.

## Design

- Interface escura, compacta e pensada primeiro para celular.
- Cards grafite, fundo quase preto e cores vivas para distinguir os hábitos.
- Barra fixa inferior com as telas Hoje, Heatmap e Hábitos.
- Tipografia e áreas de toque dimensionadas para leitura e uso em telas pequenas.

## Tecnologias utilizadas

- **Vite** para desenvolvimento e build.
- **React 18** para a interface.
- **TypeScript** para os tipos de hábitos, registros e telas.
- **CSS próprio** para layout e responsividade.
- **Lucide React** para ícones.
- **localStorage** para persistência no navegador.
- **EditorConfig** para padronizar indentação, codificação e quebras de linha no editor.

Tailwind, Zustand, date-fns e Vitest estavam na proposta inicial, mas não estão sendo usados nesta versão do projeto.

## Executar localmente

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Para gerar o build de produção:

```bash
npm run build
```

## Organização do código

```text
src/
├── components/
│   ├── BottomNav.tsx       # navegação fixa entre as telas
│   ├── HabitsScreen.tsx    # criação de hábitos e registro de atividades
│   ├── HeatmapScreen.tsx   # heatmap individual de cada hábito
│   └── TodayScreen.tsx     # resumo diário, registros e calendário
├── App.tsx                 # estado compartilhado e composição das telas
├── data.ts                 # datas, cores, dados iniciais e localStorage
├── main.tsx                # inicialização do React
├── styles.css              # estilos e layout responsivo
└── types.ts                # tipos compartilhados
```

## Ainda fora do MVP atual

Edição e arquivamento de hábitos, metas semanais, streaks, timer, exportação/importação, autenticação, sincronização e uso offline ainda não foram implementados.
