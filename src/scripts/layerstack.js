import '../styles/layerstack.scss';
import OpenSeadragon from 'openseadragon';
import 'fullscreen-polyfill';
import './manifesto';

const LayerStack = {
  id: 0,
  init: (el) => {
    LayerStack.id += 1;
    const osd = document.createElement('div');
    osd.id = `layerstack${LayerStack.id}`;
    osd.className = 'layerstack__viewer';
    el.stackHeight = 0;
    el.appendChild(osd);

    el.osd = OpenSeadragon({
      id: `layerstack${LayerStack.id}`,
      showHomeControl: false,
      showFullPageControl: false,
      showZoomControl: false,
      tabIndex: -1
    });

    const zoomCtrls = el.appendChild(document.createElement('div'));
    zoomCtrls.className = 'layerstack__zoom-ctrls';
    const zoomIn = zoomCtrls.appendChild(document.createElement('button'));
    zoomIn.className = 'layerstack__zoom-in';
    zoomIn.id = zoomIn.className;
    zoomIn.title = 'Zoom in';
    const zoomOut = zoomCtrls.appendChild(document.createElement('button'));
    zoomOut.className = 'layerstack__zoom-out';
    zoomOut.id = zoomOut.className;
    zoomOut.title = 'Zoom out';
    const fullScreen = el.appendChild(document.createElement('button'));
    fullScreen.className = 'layerstack__fullscreen';
    fullScreen.title = 'Full screen';
    fullScreen.innerHTML = `
      <svg role="img" viewBox="0 0 100 100"><path d="M12.346 22.572l17.619 17.612 10.219-10.22-17.612-17.618L31.925 3H3v28.925l9.346-9.353zm10.226 65.082l17.612-17.619-10.22-10.219-17.618 17.612L3 68.075V97h28.925l-9.353-9.346zm54.856-75.308L59.816 29.965l10.22 10.219 17.618-17.612L97 31.925V3H68.075l9.353 9.346zm10.226 65.082L70.035 59.816l-10.219 10.22 17.612 17.618L68.075 97H97V68.075l-9.346 9.353z"/></svg>
    `;

    const drawer = el.appendChild(document.createElement('div'));
    drawer.className = 'layerstack__drawer';
    const handle = drawer.appendChild(document.createElement('button'));
    handle.className = 'layerstack__drawer__handle';
    handle.title = 'More information';

    const dash = drawer.appendChild(document.createElement('div'));
    dash.className = 'layerstack__dash';

    el.fader = dash.appendChild(document.createElement('input'));
    el.fader.className = 'layerstack__fader';
    el.fader.title = 'Layer slider';
    el.fader.type = 'range';
    el.fader.min = 1;
    el.fader.step = 0.005;
    const colors = window.getComputedStyle(el.fader);
    const color1 = colors.getPropertyValue('background-color');
    const color2 = colors.getPropertyValue('color');
    el.fader.color = () => {
      const percent = 100 * (el.fader.value - el.fader.min) / (el.fader.max - el.fader.min);
      el.fader.style.background = `linear-gradient(to right, ${color2} 0%, ${color2} ${percent}%, ${color1} ${percent}%, ${color1} 100%)`;
    };
    el.fader.oninput = el.fader.onchange = (e) => {
      window.requestAnimationFrame(() => {
        LayerStack.fade(el, e.target.value);
      });
    };

    el.key = dash.appendChild(document.createElement('div'));
    el.key.className = 'layerstack__key';
    el.labels = dash.appendChild(document.createElement('div'));
    el.labels.className = 'layerstack__labels';

    document.addEventListener('click', (e) => {
      if (e.target.closest('.layerstack__zoom-in')) {
        el.osd.viewport.zoomBy(2);
      }
      else if (e.target.closest('.layerstack__zoom-out')) {
        el.osd.viewport.zoomBy(.5);
      }
      else if (e.target.closest('.layerstack__fullscreen')) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          el.requestFullscreen();
        }
      }
      else if (e.target.closest('.layerstack__drawer__handle')) {
        drawer.classList.toggle('layerstack__drawer--open');
      }
    }, false);

  },
  indexItem: (el, label) => {
    el.stackHeight += 1;
    el.fader.max = el.stackHeight;
    el.fader.value = el.fader.max;
    el.fader.color();
    if (!el.noKey) {
      LayerStack.key(el, label);
    }
  },
  fade: (el, x) => {
    el.fader.value = x;
    const bgLayer = Math.floor(x);
    const opacity = (el.noFade) ? 0 : x - bgLayer;
    for (let i = el.stackHeight; i > 0; i--) {
      if (i > bgLayer + 1 ) {
        el.osd.world.getItemAt(i-1).setOpacity(0);
      } else if (i === bgLayer + 1) {
        el.osd.world.getItemAt(i-1).setOpacity(opacity);
      } else {
        el.osd.world.getItemAt(i-1).setOpacity(1);
      }
    }
    el.fader.color();
  },
  key: (el, label) => {
    const keyIcon = '<svg role="img" viewBox="0 0 24 14"><path d="M22.214 7.162L11.622 1.286 1.031 7.162l10.591 5.876 10.592-5.876z"/></svg>';
    el.key.innerHTML = '';
    for (let i = 0; i < el.stackHeight; ++i) {
      el.key.innerHTML += `
        <div class="layerstack__key-line" style="width:${i*100/(el.stackHeight-1)}%">
          <div class="layerstack__key-icon" data-layerstack-layer="${(i+1)}" title="Layer ${(i+1)}">${keyIcon.repeat(i+1)}</div>
        </div>
      `;
    }
    el.labels.innerHTML += `
      <button class="layerstack__label" data-layerstack-layer="${el.stackHeight}">
        <div class="layerstack__key-icon" title="Layer ${el.stackHeight}">
          ${keyIcon.repeat(el.stackHeight)}
        </div>
        <div class="layerstack__label-text">${label}</div>
      </button>
    `;
    document.addEventListener('click', (e) => {
      if (e.target.closest('.layerstack__key-icon, .layerstack__label')) {
        LayerStack.fade(el, e.target.closest('[data-layerstack-layer]').dataset.layerstackLayer);
      }
    }, false);
  }
};

const layerStacker = function(layerstackEl) {
  const m = layerstackEl.dataset.iiifManifest;
  if (m) {
    Manifesto.loadManifest(m).then((manifest) => {
      let mf = null;
      try {
       mf = Manifesto.create(manifest);
      } catch(e) {
        console.error(e.name, e.message);
      }

      LayerStack.init(layerstackEl);
      let layers = null;
      let layer1 = true;
      let vwScaler = null;
      let clipped = false;
      /* P2 manifest, else P3 */
      if (!mf.context.includes('http://iiif.io/api/presentation/3/context.json')) {
        console.log("Note! Any image alignment paramaters should be supplied for each layer as an ImageApiSelector in a P3 manifest.");
        layers = Array.from(mf.getSequences()[0].getCanvases(), (item) => {
          return { canvas: item };
        });
      } else {
        const stack = mf.getAllRanges().find((range) => {
          return range.__jsonld.behavior.includes('superimpose-regions');
        });
        if (!stack) {
          alert("Please provide alignment regions as ImageApiSelector in a P3 manifest.");
          return false;
        }
        layers = Array.from(stack.__jsonld.items, (item) => {
          return {
            canvas: mf.getSequences()[0].getCanvasById(item.source),
            region: item.selector.region.slice(4).split(','),
            rotation: item.selector.rotation || 0
          };
        });
        clipped = stack.__jsonld.behavior.includes('superimpose-regions-clipped');
      }

      Array.from(layers, (layer) => {
        const osdArgs = {};
        let img = null;
        let viewWidth = null;

        if (layer.region) {
          img = layer.canvas.getContent()[0].getBody()[0].getServices()[0].id;
        } else {
          img = layer.canvas.getImages()[0].getResource().getServices()[0].id;
        }

        osdArgs.tileSource = `${img}/info.json`;
        if (layer.region) {
          if (layer1) {
            layer1 = false;
            viewWidth = 1;
            vwScaler = layer.region[2];
          } else {
            viewWidth = vwScaler / layer.region[2];
          }
          osdArgs.success = (data) => {
            const tiledImg = data.item;
            if (clipped) {
              tiledImg.setClip(
                tiledImg.viewportToImageRectangle(
                  new OpenSeadragon.Rect(
                    (layer.region[0] / 100) * viewWidth,
                    (layer.region[1] / 100) * viewWidth * tiledImg.getBounds().height / tiledImg.getBounds().width,
                    (layer.region[2] / 100) * viewWidth,
                    (layer.region[3] / 100) * viewWidth * tiledImg.getBounds().height / tiledImg.getBounds().width
                  )
                )
              );
            }
            tiledImg.setWidth(viewWidth);
            tiledImg.setPosition(
              new OpenSeadragon.Point(
                -(layer.region[0] / 100) * tiledImg.getBounds().width, 
                -(layer.region[1]  / 100) * tiledImg.getBounds().height
              )
            );
            if(layer.rotation[0] === '!') {
              tiledImg.setFlip(true);
              layer.rotation = layer.rotation.slice(1);
            }
            tiledImg.setRotation(layer.rotation, true);
            tiledImg.viewport.fitHorizontally().fitVertically();
            LayerStack.indexItem(layerstackEl, layer.canvas.getLabel()[0].value);
          };
        } else {
          osdArgs.success = () => {
            LayerStack.indexItem(layerstackEl, layer.canvas.getLabel()[0].value);
          };
        }
        layerstackEl.osd.addTiledImage(osdArgs);
      });

      if (layerstackEl.dataset.noFade === 'true') {
        layerstackEl.noFade = true;
      }

      if (layerstackEl.dataset.noKey === 'true') {
        layerstackEl.noKey = true;
      }
    }).catch(e => console.error(e.name, e.message));
  }
};

export { layerStacker as default, LayerStack };
