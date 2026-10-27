# Padrões visuais do aplicativo

Este projeto usa estilos JavaScript do React Native e o tema do React Native Paper.
Não é necessário criar um CSS global para as telas nativas.

## Onde alterar cada padrão

- `appTheme.ts`: cores semânticas e variantes tipográficas do Paper.
- `tokens.ts`: espaçamentos, tamanhos, raios, opacidade e medidas tipográficas compartilhadas.
- `sharedStyles.ts`: combinações recorrentes de layout, como lista de página e cabeçalho de seção.
- `../components/AppText.tsx`: texto com variante tipográfica e tom semântico.
- `../components/AppCard.tsx`: card com a superfície definida pelo tema.

O `PaperProvider` no layout raiz aplica o tema às telas e aos componentes do Paper.
Botões, campos, menus, chips e mensagens também recebem a tipografia e as cores desse tema.

## Textos

```tsx
import { AppText } from '../components/AppText';

<AppText variant="bodyMedium" tone="secondary">
  Buscar por:
</AppText>
```

Use `tone="secondary"` para descrições e orientações. Os outros tons são `default`,
`primary` e `error`. O padrão é `bodyMedium` com o tom `default`.
A variante `bodyMedium` tem tamanho 14 e altura de linha 22, configurados centralmente.
Use variantes de título para títulos; não reproduza seus tamanhos em estilos locais.

## Cores e layout

```tsx
const theme = useTheme();

<View style={{ backgroundColor: theme.colors.surface }} />
```

Para um texto secundário, use `onSurfaceVariant`; para ações principais, `primary`;
para superfícies, `surface`; para bordas, `outline` ou `outlineVariant`.
Não use `colors.secondary` como sinônimo de texto secundário: ela é uma cor da paleta.

```tsx
import { spacing } from '../theme/tokens';
import { sharedStyles } from '../theme/sharedStyles';

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  section: { gap: spacing.lg, padding: spacing.xl },
});
```

Mantenha nos estilos locais apenas a disposição específica do componente, como
`flexDirection`, alinhamento, largura proporcional e posicionamento. Cores literais
ficam no tema; medidas recorrentes ficam nos tokens. Exceções devem ter uma finalidade
visual clara, como o rótulo compacto dos modos de busca.

Os valores por campo de rolagem acima do teclado continuam em
`../constants/keyboardOffsets.ts`: são ajustes de interação, separados dos tokens visuais.
