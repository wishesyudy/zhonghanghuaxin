/* ============================================================
   中航华信官网 — i18n 一致性校验
   用法：node tools/check-i18n.js
   检查项：
   1. index.html 中所有 data-i18n / data-i18n-html / data-i18n-attr
      引用的 key 在 zh / en 字典中都存在
   2. 字典中没有 HTML 未引用的孤儿 key
   3. data-i18n 元素的中文文本与 zh 字典值逐字一致（防编辑串字）
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var root = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var src = fs.readFileSync(path.join(root, 'js', 'i18n.js'), 'utf8');

/* 把 i18n.js 的 IIFE 改为导出字典后执行 */
var wrapped = src.replace(/\}\)\(\);\s*$/, '  return { I18N: I18N, META: META };\n})();');
var sandbox = {
  document: {
    addEventListener: function () {},
    dispatchEvent: function () {},
    querySelectorAll: function () { return []; },
    querySelector: function () { return null; },
    documentElement: { setAttribute: function () {} },
    set title(v) {}
  },
  CustomEvent: function () {},
  localStorage: { getItem: function () { return null; }, setItem: function () {} }
};
vm.createContext(sandbox);
var dicts = vm.runInContext(wrapped, sandbox).I18N;

var errors = [];
var used = {};

/* 1+3. HTML 引用的 key 检查 */
var re = /data-i18n(?:-html|-attr)?="([^"]+)"/g;
var m;
while ((m = re.exec(html)) !== null) {
  var full = m[1];
  /* -attr 的格式是 "attr:key attr2:key2" */
  var keys = full.split(/\s+/).map(function (pair) {
    return pair.indexOf(':') > -1 ? pair.split(':')[1] : pair;
  });
  keys.forEach(function (key) {
    used[key] = true;
    ['zh', 'en'].forEach(function (lang) {
      if (dicts[lang][key] === undefined) {
        errors.push('字典缺 key（' + lang + '）: ' + key);
      }
    });
  });
}

/* 2. 孤儿 key */
Object.keys(dicts.zh).forEach(function (key) {
  if (!used[key]) errors.push('HTML 未引用的孤儿 key: ' + key);
});
Object.keys(dicts.en).forEach(function (key) {
  if (!used[key]) errors.push('HTML 未引用的孤儿 key: ' + key);
});

/* 3. data-i18n 元素中文文本与 zh 字典逐字比对 */
var textRe = /data-i18n="([^"]+)"[^>]*>([^<]*)</g;
while ((m = textRe.exec(html)) !== null) {
  var key = m[1];
  var zhText = m[2].replace(/&amp;/g, '&');
  if (dicts.zh[key] !== undefined && dicts.zh[key] !== zhText) {
    errors.push('zh 文案与 HTML 不一致: ' + key + '\n  HTML: ' + zhText + '\n  字典: ' + dicts.zh[key]);
  }
}

if (errors.length) {
  console.error('❌ 发现 ' + errors.length + ' 处问题：\n');
  errors.forEach(function (e) { console.error(' - ' + e + '\n'); });
  process.exit(1);
}
console.log('✅ i18n 校验通过：HTML 与 zh/en 字典完全对齐，zh 文案逐字一致');
