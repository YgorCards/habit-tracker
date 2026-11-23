# Ritmo — Habit Tracker

Aplicação web para registrar hábitos, anotar atividades e acompanhar o tempo dedicado a cada um. O projeto está em desenvolvimento como MVP e prioriza uma experiência compacta para celular.

## Funcionalidades atuais

### Login

- Entrada com uma conta Google pelo Firebase Authentication.
- A sessão é restaurada pelo Firebase quando o app é aberto novamente.
- Cada conta acessa os próprios hábitos e atividades.
- Há um botão para sair da conta.

### Hoje

- Mostra o tempo de foco e a quantidade de atividades no dia selecionado.
- Exibe cada atividade em um card com o nome do hábito, os minutos e a nota, quando houver.
- Permite remover um registro.
- Inclui um calendário mensal para consultar outro dia. Um ponto marca os dias com atividade.
- Um dia selecionado no heatmap também abre nesta tela.

### Heatmap

- Mostra um heatmap independente para cada hábito, cobrindo os últimos 12 meses.
- Cada quadrado indica apenas se houve atividade naquele dia; não há níveis de intensidade.
- Cada hábito tem uma cor própria, escolhida ao criá-lo entre seis opções.
- Exibe quantos dias tiveram atividade e o tempo total registrado para o hábito.
- Tocar em um dia abre os registros correspondentes na tela Hoje.

### Hábitos

- Permite criar um hábito informando o nome e escolhendo uma cor. Cores podem se repetir.
- Permite registrar uma atividade associada a um hábito, informando data, duração em minutos e nota opcional.
- Exibe uma confirmação depois de criar um hábito ou salvar uma atividade.
- A tela mantém os formulários; os dados agregados aparecem no Heatmap.

## Dados e segurança

- Firebase Authentication identifica cada usuário por um UID.
- Cloud Firestore armazena os dados em `users/{uid}/habits` e `users/{uid}/activities`.
- O documento `users/{uid}` também guarda `displayName`, sincronizado com o nome recebido do Google. O UID continua sendo o ID estável do documento; o nome aparece como campo do perfil.
- As regras versionadas em `firestore.rules` restringem acesso por UID e validam os campos das gravações.
- Hábitos e atividades são atualizados em tempo real pelo listener do Firestore.
- Não há dados de demonstração gerados pelo código. Novas contas começam sem hábitos e atividades.
- O documento criado pelo smoke test anterior fica no Firestore até ser removido manualmente no Console.

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
- **Firebase Authentication** para login com Google.
- **Cloud Firestore** para persistência dos dados por usuário.
- **EditorConfig** para padronizar indentação, codificação e quebras de linha no editor.

Tailwind, Zustand, date-fns e Vitest estavam na proposta inicial, mas não estão sendo usados nesta versão.

## Configuração local

Crie um arquivo `.env` na raiz com a configuração do app Web do Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Instale as dependências e inicie o servidor:

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
habit-tracker/
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx       # navegação entre as telas
│   │   ├── HabitsScreen.tsx    # criação de hábitos e registro de atividades
│   │   ├── HeatmapScreen.tsx   # heatmap de cada hábito
│   │   ├── SignInScreen.tsx    # entrada com Google
│   │   └── TodayScreen.tsx     # registros diários e calendário
│   ├── services/
│   │   └── firestore.ts        # leitura e gravação no Firestore
│   ├── App.tsx                 # sessão, estado e composição das telas
│   ├── data.ts                 # cores e utilitários de datas
│   ├── firebase.ts             # inicialização dos serviços Firebase
│   ├── main.tsx                # inicialização do React
│   ├── styles.css              # estilos e layout responsivo
│   └── types.ts                # tipos compartilhados
├── firestore.rules             # regras locais para publicar no Firestore
├── firebase.json               # aponta o Firebase CLI para as regras locais
└── .firebaserc                 # projeto Firebase padrão
```

## Ainda fora do MVP

Edição e arquivamento de hábitos, metas semanais, streaks, timer, exportação/importação, login por e-mail e uso offline ainda não foram implementados.
