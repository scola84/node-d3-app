import Container from './src/container';
import Menu from './src/menu';

let instance = null;

export function container() {
  if (!instance) {
    instance = new Container();
  }

  return instance;
}

export function menu() {
  return new Menu();
}
