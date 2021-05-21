import layerStacker, { LayerStack } from './layerstack';

/* for purposes of this demo, allow manifest to be set by an optional querystring */
const qstr = new Map(location.search.slice(1).split('&').map(kv => kv.split('=')));
if (qstr.has('manifest')) {
  document.querySelector('.layerstack').dataset.iiifManifest = qstr.get('manifest');
}

/* activate any layerstack elements in the page */
document.addEventListener('DOMContentLoaded', () => {
  Array.from(document.querySelectorAll('.layerstack'), (layerstackEl) => {
    layerStacker(layerstackEl);
  });
});