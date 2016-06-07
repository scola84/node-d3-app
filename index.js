import Container from './src/container';
import Menu from './src/menu';

let instance = null;

export function container(options) {
  if (!instance) {
    instance = new Container(options);
  }

  return instance;
}

export function menu(options) {
  return new Menu(container(), options);
}
