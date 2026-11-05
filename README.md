# Cyberpunk RED — Ficha Alternativa

Versão 0.1.1 para testar o visual da ficha de personagem no Foundry VTT v13. A referência para este protótipo é o fork Cyberpunk RED v13 - PTBR, versão 1.0.5.

## Instalar pelo Foundry

1. Na tela de configuração do Foundry, abra **Módulos adicionais → Instalar módulo**.
2. Cole a URL do manifesto no campo **URL do manifesto** e clique em **Instalar**.

```text
https://github.com/Kciquehn/cpr-ficha-alternativa/releases/latest/download/module.json
```

3. Entre no mundo e ative **Cyberpunk RED - Ficha Alternativa** em **Configurações → Gerenciar módulos**.
4. Abra um **Personagem** e escolha **Cyberpunk RED - Ficha Alternativa** no menu **Configurar ficha** do cabeçalho.

## Instalar manualmente

1. Baixe o ZIP da versão e extraia o conteúdo em uma pasta chamada `cpr-ficha-alternativa`.
2. Copie essa pasta para `Data/modules` na instalação que hospeda o mundo. Se o mundo estiver em um servidor, faça a cópia no servidor.
3. Reinicie o Foundry e entre no mundo como mestre.
4. Em **Configurações → Gerenciar módulos**, ative **Cyberpunk RED - Ficha Alternativa**.
5. Abra um ator do tipo **Personagem**. No menu de controles do cabeçalho da ficha, abra **Configurar ficha** e selecione **Cyberpunk RED - Ficha Alternativa** para esse personagem. Para voltar, escolha a ficha padrão no mesmo menu.

## O que experimentar

- Confira o enquadramento do retrato, o nome e os atributos em duas colunas.
- Mude os PV atuais e veja se a barra acompanha o valor.
- Clique no nome de um atributo para conferir a rolagem.
- Abra a mesma ficha como jogador para conferir a leitura e a edição permitidas ao personagem.

## Onde fazer mudanças

- `module.json` identifica o módulo para o Foundry.
- `styles/sheet.css` controla o visual. As cores estão no início do arquivo.
- `scripts/sheet.mjs` registra a opção de ficha e mostra a proporção dos PV na barra. Os campos, os cálculos e as rolagens são herdados da ficha do sistema.
