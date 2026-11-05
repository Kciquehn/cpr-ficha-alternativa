# Cyberpunk RED — Ficha Alternativa

Ficha opcional de personagem para Foundry VTT v13 e Cyberpunk RED v13 - PTBR 1.0.5. A ficha reserva a coluna esquerda para as informações essenciais e a direita para as categorias História, Atributos e Perícias, Equipamento e Habilidade de Cargo.

## Instalar ou atualizar pelo Foundry

1. Na tela de configuração do Foundry, abra **Módulos adicionais → Instalar módulo**.
2. Cole a URL abaixo no campo **URL do manifesto** e clique em **Instalar**. Se o módulo já estiver instalado, use **Atualizar** na lista de módulos.

```text
https://github.com/Kciquehn/cpr-ficha-alternativa/releases/latest/download/module.json
```

3. Entre no mundo e ative **Cyberpunk RED - Ficha Alternativa** em **Configurações → Gerenciar módulos**.
4. Abra um ator do tipo **Personagem**. No menu **Configurar ficha** do cabeçalho, escolha **Cyberpunk RED - Ficha Alternativa**. Para voltar, selecione a ficha do sistema no mesmo menu.

## Instalar manualmente

Baixe o ZIP da versão e extraia o conteúdo em uma pasta chamada `cpr-ficha-alternativa` dentro de `Data/modules`, na máquina que hospeda o mundo. Reinicie o Foundry e siga os passos de ativação acima.

## Dados do personagem

As duas fichas abrem o mesmo ator do Foundry. A coluna esquerda mostra os atributos, PV, Humanidade, ferimentos, Salva de Morte, pontos de aprimoramento, reputação e dinheiro do mesmo personagem. Quem pode editar o ator pode trocar o retrato, o nome, a função e os valores atuais de PV, Humanidade e atributos. Os painéis das categorias estão vazios.

## Onde fazer mudanças

- `scripts/sheet.mjs` registra a ficha e define a ordem e o nome das abas.
- `templates/sheet.hbs` desenha a navegação e os painéis. A coluna esquerda está em `templates/essentials.hbs`.
- `styles/sheet.css` define o visual.
