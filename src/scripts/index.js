import layerStacker, { LayerStack } from './layerstack';

Array.from(document.querySelectorAll('.layerstack'), (layerstackEl) => {
  layerStacker(layerstackEl);
});