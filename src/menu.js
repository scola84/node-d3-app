/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';

export default class Menu {
  constructor(container, options) {
    this.container = container;

    this.options = Object.assign({
      hideAt: '64em',
      width: '21.333em',
      position: 'left',
      mode: 'over'
    }, options);

    this.fixed = false;
    this.visible = false;

    this._position = null;

    this.position(this.options.position);
    this.build();
  }

  build() {
    this.outer = select('body')
      .append('div')
      .classed('scola menu', true)
      .styles({
        'border': '0 solid #CCC',
        'display': 'none',
        'height': '100%',
        'position': 'absolute',
        'width': this.options.width,
        'z-index': this.options.mode === 'under' ? -1 : 1
      });

    this.border();

    this.media = this.outer
      .media('not all and (min-width: ' + this.options.width + ')')
      .style('width', '90%')
      .media('not all and (min-width: ' + this.options.fixAt + ')')
      .call(() => this.unfix())
      .media('(min-width: ' + this.options.fixAt + ')')
      .call(() => this.fix())
      .start();

    this.gesture = this.outer.gesture()
      .on('tap', (event) => {
        if (!this.fixed) {
          event.stopPropagation();
        }
      });
  }

  border() {
    this.outer
      .style('border-' + this._position + '-width', 0)
      .style('border-' + this.opposite(this._position) + '-width', 1);
  }

  destroy() {
    this.gesture.destroy();
    this.media.destroy();

    if (this.container) {
      this.container.remove(this);
    } else {
      this.node().remove();
    }
  }

  position(position) {
    if (position) {
      if (this._position) {
        this.outer.style(this._position, null);
      }

      this._position = position;

      if (this.outer) {
        this.border();
      }

      return this;
    }

    return this._position;
  }

  mode() {
    return this.options.mode;
  }

  node() {
    return this.outer.node();
  }

  width() {
    return this.options.width;
  }

  fix() {
    this.outer
      .style('display', 'block')
      .style(this._position, 0);

    this.fixed = true;
    this.visible = true;

    if (this.container) {
      this.container.fixAll();
    }
  }

  unfix() {
    this.outer
      .style('display', 'none')
      .style(this._position, this.options.mode === 'under' ?
        0 : '-' + this.options.width);

    this.fixed = false;
    this.visible = false;

    if (this.container) {
      this.container.fixAll();
    }
  }

  show() {
    if (this.fixed || this.visible) {
      return false;
    }

    this.outer.style('display', 'block');

    if (this.options.mode !== 'under') {
      this.outer.transition().style(this._position, '0');
    }

    this.visible = true;

    if (this.container) {
      this.container.show(this);
    }

    return true;
  }

  hide() {
    if (this.fixed || !this.visible) {
      return false;
    }

    if (this.options.mode !== 'under') {
      this.outer.transition().style(this._position, '-' + this.options.width);
    }

    this.visible = false;

    if (this.container) {
      this.container.hide(this, () => {
        this.outer.style('display', 'none');
      });
    }

    return true;
  }

  reset() {
    if (this.fixed) {
      this.fix();
    } else {
      this.unfix();
    }

    return this;
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  }

  opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
