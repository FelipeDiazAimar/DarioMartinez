const fs = require('fs');
const path = require('path');

const toners = JSON.parse(fs.readFileSync(path.join(__dirname, 'toners_originales.json'), 'utf8'));

function esc(s) { return s.replace(/'/g, "''"); }

let sql = 'SET NAMES utf8mb4;\n\n';
sql += '-- REVERSION DE NOMBRES ORIGINALES - TONERS/TINTAS/CARTUCHOS\n';
sql += '-- Total: ' + toners.length + ' productos\n\n';

toners.forEach((t, i) => {
  sql += '-- [' + (i + 1) + '] ' + t.desc.substring(0, 50) + '\n';
  sql += "UPDATE articulos SET descripcion = '" + esc(t.desc) + "' WHERE linea = '" + esc(t.linea) + "' AND rubro = '" + esc(t.rubro) + "' AND codigo = '" + esc(t.codigo) + "';\n\n";
});

const outPath = path.join(__dirname, 'revertir_nombres_toners.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generado:', outPath);
console.log('Total UPDATEs:', toners.length);
