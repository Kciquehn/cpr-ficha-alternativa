# Cyberpunk RED — Ficha Alternativa

Ficha opcional de personagem para Foundry VTT v13 e Cyberpunk RED v13 - PTBR 1.0.5. A organização se inspira no [Cyberpunk RED Companion](https://cyberpunkred.com/) e usa os controles da ficha do sistema.

- A coluna esquerda reúne retrato, identificação, PV, Humanidade, ferimentos, Salva de Morte, saldos e busca.
- No topo à direita, **História** tem o Caminho da Vida e as notas. **Perícias** abre em ordem alfabética e traz atributos, busca e as opções Denso, Agrupar e Esconder zeradas. **Equipamento** tem categorias inspiradas no Companion. Programas aparece quando o personagem possui um console ou programa. **Cibernética**, **Funções** e **Efeitos** reúnem os painéis do sistema.
- Em **Combate**, ficam as armas equipadas, armaduras e lesões críticas. Com um cyberdeck equipado, o seletor alterna entre combate físico e Netrunning, onde ficam os programas e as ações de rede.

## Tema do mundo

Com o módulo ativo, a paleta vermelha e preta é aplicada no mundo Cyberpunk RED. Ela abrange fichas oficiais de atores, itens e efeitos, listas, chat e cartões de rolagem, diálogos, diário, navegação de cenas e controles do Foundry. As duas versões da ficha de personagem continuam disponíveis. Mapas, retratos, cores de jogadores e indicadores de sucesso ou falha continuam usando seus próprios dados e estados.

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

As duas fichas abrem o mesmo ator. Os cálculos, as rolagens, os itens e os efeitos são processados pelo sistema Cyberpunk RED. A edição segue as permissões do personagem no Foundry.

## Onde fazer mudanças

- `scripts/sheet.mjs` registra a ficha e herda os controles da ficha do sistema.
- `templates/sheet.hbs` organiza os painéis nativos em abas. A coluna esquerda está em `templates/essentials.hbs`.
- `styles/sheet.css` define o visual.
- `styles/world-theme.css` aplica a paleta às superfícies do sistema e do Foundry.
