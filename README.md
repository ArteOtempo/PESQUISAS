# F1 2026 — protótipo de storytelling

Protótipo estático em HTML, CSS e JavaScript. Não usa framework nem build.

## Como abrir
O site carrega o JSON com `fetch`, portanto rode com um servidor local:
- VS Code: extensão **Live Server** e abra `index.html`; ou
- Python: dentro desta pasta, execute `python -m http.server 8000` e acesse `http://localhost:8000`.

Abrir `index.html` diretamente via `file://` pode impedir o navegador de carregar o JSON.

## Onde alterar os dados
Edite `data/standings.json`.
- `drivers`: classificação de pilotos
- `teams`: classificação de construtores
- `races`: calendário e resultados das etapas
- `driverProfile`: dados do perfil (a estrutura está pronta para evolução)

Os pontos, vitórias, posições, datas e vencedores no JSON são demonstrativos/placeholder; confira os dados antes de publicar. O código não faz scraping nem consulta uma API externa.

## Onde colocar as imagens
Crie os arquivos dentro de `assets/images/` e substitua os blocos de placeholder no HTML pelas imagens reais, ou adapte o código para trocar cada bloco automaticamente:
- `carro-capa.png` — foto horizontal do carro para a capa
- `circuito-australia.svg` — traçado do circuito em SVG/PNG transparente
- `vencedor-australia.png` — retrato do vencedor
- `kimi-antonelli.png` — retrato vertical do piloto no perfil

Para substituir um placeholder no HTML, use por exemplo:
```html
<div class="hero-image-placeholder image-placeholder">
  <img src="assets/images/carro-capa.png" alt="Carro de Fórmula 1">
</div>
```
e acrescente ao CSS:
```css
.hero-image-placeholder img {
  width: 100%; height: 100%; object-fit: contain; position: absolute;
}
```

## Sobre a animação do perfil
A rolagem destaca cada cartão de curiosidade e atualiza o contador; o retrato recebe uma pequena transformação. Para uma rotação 3D realista do piloto, use várias imagens oficiais de ângulos diferentes ou uma sequência de frames. Uma única foto 2D não revela o lado oposto do personagem.

## Atualização automática futura
O protótipo lê o JSON local quando a página carrega. Para atualizar automaticamente, conecte-o a um endpoint/API ou gere o arquivo JSON a partir de uma fonte autorizada. Mostre sempre a data de atualização e preserve os últimos dados válidos se a fonte falhar. Verifique os termos de uso e licenciamento antes de coletar ou republicar dados/imagens.
