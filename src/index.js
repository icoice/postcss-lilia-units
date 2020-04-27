import * as postcss from 'postcss';

const p1 = (save = {}, type, value) => {
  const [ _, expression, postfix ] = value.match(/\((.+)\)(\w+|\%)/);

  save[type] = [
    new Function('value', [ 'return', '(', expression, ')' ].join(' ')),
    postfix,
  ];

  return save;
};

const p2 = (save = {}, type, value) => {
  const [ _, count, postfix ] = value.match(/(\d+)(\w+)/);

  save[type] = [
    value => count * value,
    postfix,
  ];

  return save;
};

function pdk1(decl, save = {}) {
  const [ type, value ] = postcss.list.space(decl.value);

  if (value.charAt(0) == '(') {
    return p1(save, type, value);
  }

  return p2(save, type, value);
}

function pdk2(decl, save = {}) {
  for (const type in save) {
    const [f, postfix] = save[type];
    const reg = new RegExp(`(([\\d\.]+)${type})`, 'g');

    decl.value = decl.value.replace(reg, (a, b, c) => [f(c), postfix].join(''));
  }
}

const pluginName = 'postcss-lilia-units';

const pluginProcess = () => (css => {
  const save = {};

  css.walkDecls(desl => {
    switch (decl.prop) {
      case '--define':
        pdk1(decl, save);
        decl.remove();
        break;
      default:
        pdk2(decl, save);
    }
  });
});

module.exports = postcss.plugin(pluginName, pluginProcess);
