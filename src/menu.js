/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';
import { slider } from '@scola/d3-slider';

export default class Menu {
  constructor(container) {
    this._container = container;

    this._width = null;
    this._fixedAt = null;
    this._position = null;
    this._mode = null;

    this._fixed = false;
    this._visible = false;

    this._gesture = null;
    this._media = null;

    this._root = select('body')
      .append('div')
      .classed('scola menu', true)
      .styles({
        'border': '0 solid #CCC',
        'display': 'none',
        'height': '100%',
        'position': 'absolute'
      });
  }

  destroy() {
    if (this._gesture) {
      this._gesture.destroy();
    }

    if (this._media) {
      this._media.destroy();
    }

    if (this._container) {
      this._container.remove(this);
    } else {
      this.root().remove();
    }
  }

  fixed() {
    return this._fixed;
  }

  fixedAt() {
    return this._fixedAt;
  }

  root() {
    return this._root;
  }

  visible() {
    return this._visible;
  }

  width() {
    return this._width;
  }

  border() {
    this._root
      .style('border-' + this._position + '-width', 0)
      .style('border-' + this._opposite(this._position) + '-width', 1);

    return this;
  }

  gesture() {
    if (this._gesture) {
      return this._gesture;
    }

    this._gesture = this._root.gesture()
      .on('tap', (event) => {
        if (!this._fixed) {
          event.stopPropagation();
        }
      });

    return this;
  }

  media(width, fixedAt) {
    if (!width) {
      return this._media;
    }

    this._width = width;
    this._fixedAt = fixedAt;

    if (this._media) {
      this._media.destroy();
    }

    this._root.style('width', width);

    this._media = this._root
      .media(`not all and (min-width: ${width})`)
      .style('width', '90%')
      .media(`not all and (min-width: ${fixedAt})`)
      .call(() => this.unfix())
      .media(`(min-width: ${fixedAt})`)
      .call(() => this.fix())
      .start();

    return this;
  }

  mode(mode) {
    if (!mode) {
      return this._mode;
    }

    this._root.style('z-index', mode === 'under' ? -1 : 1);
    this._mode = mode;

    return this;
  }

  position(position) {
    if (!position) {
      return this._position;
    }

    this._root.style(this._position, null);
    this._position = position;

    return this;
  }

  slider() {
    if (this._slider) {
      return this._slider;
    }

    this._slider = slider();
    this._root.node().appendChild(this._slider.root().node());

    return this;
  }

  fix() {
    this._root
      .style('display', 'block')
      .style(this._position, 0);

    this._fixed = true;
    this._visible = true;

    if (this._container) {
      this._container.fixAll();
    }

    return this;
  }

  unfix() {
    this._root
      .style('display', 'none')
      .style(this._position, this._mode === 'under' ? 0 : '-' + this._width);

    this._fixed = false;
    this._visible = false;

    if (this._container) {
      this._container.fixAll();
    }

    return this;
  }

  show() {
    if (this._fixed || this._visible) {
      return false;
    }

    this._root.style('display', 'block');

    if (this._mode !== 'under') {
      this._root.transition().style(this._position, '0');
    }

    this._visible = true;

    if (this._container) {
      this._container.show(this);
    }

    return true;
  }

  hide() {
    if (this._fixed || !this._visible) {
      return false;
    }

    if (this._mode !== 'under') {
      this._root.transition().style(this._position, '-' + this._width);
    }

    this._visible = false;

    if (this._container) {
      this._container.hide(this, () => this._root.style('display', 'none'));
    }

    return true;
  }

  reset() {
    if (this._fixed) {
      this.fix();
    } else {
      this.unfix();
    }

    return this;
  }

  toggle() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  }

  _opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
