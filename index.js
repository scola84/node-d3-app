import './src/helper/style.css';
import Main from './src/main';
import Menu from './src/menu';

export function main() {
  return new Main();
}

export function menu() {
  return new Menu();
}
