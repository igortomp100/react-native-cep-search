# Guardar CEP

Identidade aprovada: proposta 05, caixinha azul com cartões de endereço.

A arte-base foi preparada com a ferramenta integrada de geração de imagens, a partir da proposta aprovada. Pedido: isolar a caixinha 3D, manter cores e perspectiva, remover texto e apresentação, exportar com fundo transparente.

- guardar-cep-master.png: original transparente.
- guardar-cep-mark.png: símbolo para o header e Home.
- guardar-cep-icon.png: ícone opaco 1024×1024 para iOS e Expo.
- guardar-cep-adaptive.png: camada transparente Android com margem para os recortes do launcher.
- guardar-cep-splash.png: símbolo transparente da abertura nativa.
- guardar-cep-favicon.png: ícone da versão web.

Configuração em app.json. O nome público é Guardar CEP; slug e scheme foram preservados. A splash e o ícone instalado exigem nova build; o Expo Go não reproduz a splash final.

## Splash com lettering

A abertura utiliza guardar-cep-splash-logo.png: caixinha grande e lettering Guardar CEP na mesma imagem transparente, sem número 05 e sem ícone menor. Preparada pela geração integrada de imagens a partir da referência aprovada. Prompt: preservar a caixinha 3D e o lettering original, retirar a numeração, exemplo pequeno e fundo, centralizar o conjunto com transparência.

A imagem anterior, apenas com símbolo, foi preservada. O header e o ícone instalado continuam usando suas versões próprias. O Expo Go controla a própria tela de carregamento; esta configuração é aplicada na próxima build instalada.
