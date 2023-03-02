import layerStacker, { LayerStack } from './layerstack';

/* for purposes of this demo, allow manifest & other optional parameters to be overidden via querystring */
const qstr = new Map(location.search.slice(1).split('&').map(kv => kv.split('=')));
if (qstr.has('manifest')) {
  document.querySelector('.layerstack').dataset.iiifManifest = qstr.get('manifest');
}
if (qstr.has('nofade')) {
  document.querySelector('.layerstack').dataset.noFade = 'true';
}
if (qstr.has('nokey')) {
  document.querySelector('.layerstack').dataset.noKey = 'true';
}

/* activate any layerstack elements in the page */
document.addEventListener('DOMContentLoaded', () => {
  Array.from(document.querySelectorAll('.layerstack'), (layerstackEl) => {
    layerStacker(layerstackEl);
  });
});
