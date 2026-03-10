$ErrorActionPreference = 'Stop'

$envPath = 'c:\Users\notebook\Desktop\DM\mysql-api-express\.env'
Get-Content $envPath | ForEach-Object {
  if ($_ -match '^(?<k>[A-Za-z_][A-Za-z0-9_]*)=(?<v>.*)$') {
    [System.Environment]::SetEnvironmentVariable($Matches.k, $Matches.v, 'Process')
  }
}

$headers = @{ Authorization = "Bearer $($env:API_TOKEN)" }
$rows = @((Invoke-RestMethod -Uri "$($env:API_BASE_URL)/articulos" -Headers $headers -Method Get -TimeoutSec 120).data)

function Clean([string]$s) {
  if ($null -eq $s) { return '' }
  return (($s -replace '\s+', ' ').Trim())
}

function EscSql([string]$s) {
  if ($null -eq $s) { return '' }
  return $s.Replace("'", "''")
}

function InferBrand([string]$d) {
  $u = $d.ToUpper()
  if ($u -match '\bLOGITECH|LOGISTECH\b') { return 'Logitech' }
  if ($u -match '\bGENIUS\b') { return 'Genius' }
  if ($u -match '\bJBL\b') { return 'JBL' }
  if ($u -match '\bEPSON\b') { return 'Epson' }
  if ($u -match '\bKINGSTON\b') { return 'Kingston' }
  if ($u -match '\bSANDISK\b') { return 'SanDisk' }
  if ($u -match '\bADATA\b') { return 'ADATA' }
  if ($u -match '\bTP[\- ]?LINK|\bTPLINK\b') { return 'TP-Link' }
  if ($u -match '\bD[\.]?LINK\b') { return 'D-Link' }
  if ($u -match '\bBKT\b') { return 'BKT' }
  if ($u -match '\bNKT\b') { return 'NKT' }
  if ($u -match '\bHP\b') { return 'HP' }
  if ($u -match '\bLENOVO\b') { return 'Lenovo' }
  if ($u -match '\bDELL\b') { return 'Dell' }
  return 'Generica'
}

function InferType([string]$d) {
  $u = $d.ToUpper()
  if ($u -match 'MOUSE') { return 'Mouse' }
  if ($u -match 'TECLADO') { return 'Teclado' }
  if ($u -match 'AURICUL') { return 'Auriculares' }
  if ($u -match 'TINTA|CARTUCHO') { return 'Tinta' }
  if ($u -match 'MICROSD') { return 'Memoria MicroSD' }
  if ($u -match 'MEMORIA|DDR|RAM') { return 'Memoria RAM' }
  if ($u -match 'CARGADOR|FUENTE') { return 'Cargador' }
  if ($u -match 'PLACA\s+DE\s+RED|WIFI|PCI|USB') { return 'Placa de Red' }
  if ($u -match 'MOCHIL') { return 'Mochila' }
  if ($u -match 'CABLE') { return 'Cable' }
  if ($u -match 'NOTEBOOK|COMPUTADORA|PC') { return 'Computadora' }
  if ($u -match 'MONITOR') { return 'Monitor' }
  if ($u -match 'IMPRESORA') { return 'Impresora' }
  if ($u -match 'TABLET') { return 'Tablet' }
  if ($u -match 'DISCO|SSD|HDD') { return 'Almacenamiento' }
  return 'Producto'
}

function InferModel([string]$d, [string]$code) {
  $u = (Clean $d).ToUpper()
  $m = [regex]::Match($u, '\b([A-Z]{1,6}-\d{2,6}[A-Z0-9-]*)\b')
  if ($m.Success) { return $m.Groups[1].Value }
  $m = [regex]::Match($u, '\b([A-Z]{0,3}\d{2,6}[A-Z0-9-]*)\b')
  if ($m.Success) { return $m.Groups[1].Value }
  $m = [regex]::Match($u, '\b(\d{2,4}(GB|TB|W|DPI))\b')
  if ($m.Success) { return $m.Groups[1].Value }
  return "COD-$code"
}

function DetectSignals([string]$d) {
  $u = $d.ToUpper()
  $signals = New-Object System.Collections.Generic.List[string]
  if ($u -match 'INALAMBR') { $signals.Add('inalambrico') | Out-Null }
  if ($u -match 'BLUETOOTH|\bBT\b') { $signals.Add('bluetooth') | Out-Null }
  if ($u -match 'USB') { $signals.Add('usb') | Out-Null }
  if ($u -match 'WIFI|WI-FI') { $signals.Add('wifi') | Out-Null }
  if ($u -match '2\.4\s*GHZ|24\s*GHZ') { $signals.Add('2.4ghz') | Out-Null }
  if ($u -match 'RGB') { $signals.Add('rgb') | Out-Null }
  if ($u -match 'GAMER') { $signals.Add('gamer') | Out-Null }
  if ($u -match 'ERGONOM') { $signals.Add('ergonomico') | Out-Null }
  if ($u -match 'MECANIC') { $signals.Add('mecanico') | Out-Null }
  $nums = [regex]::Matches($u, '\b(\d{2,4}\s?(GB|TB|MHZ|HZ|DPI|W))\b')
  foreach ($n in $nums) { $signals.Add(($n.Groups[1].Value -replace ' ', '').ToLower()) | Out-Null }
  return @($signals | Select-Object -Unique)
}

$openers = @('Foco operativo','Perfil funcional','Escenario de uso','Lectura comercial','Registro de catalogo','Mapa de aplicacion','Bloque de producto','Resumen de valor','Contexto de implementacion','Linea de trabajo','Marco de uso','Ajuste de ficha')
$verbsA = @('acelera','ordena','simplifica','optimiza','estabiliza','consolida','agiliza','estructura','refuerza','acomoda','facilita','mejora')
$verbsB = @('aporta','reduce friccion en','mejora flujo de','sostiene ritmo de','organiza','acompaña','responde a','habilita','extiende','cubre','resuelve','encaja en')
$domains = @('rutina administrativa','trabajo de escritorio','entorno de estudio','uso mixto diario','operacion de soporte','productividad base','demanda moderada','tareas repetitivas','flujo operativo comun','uso cotidiano continuo','escenario de oficina','circuito de atencion')
$outcomes = @('con curva de adopcion corta','sin complejidad innecesaria','con implementacion directa','con manejo predecible','con respuesta estable','con integracion gradual','con enfoque practico','con orientacion funcional','con continuidad diaria','con lectura tecnica clara','con margen de escalado','con trazabilidad de ficha')

$noteBlocks = @('Panel tecnico','Ficha comercial','Bitacora de articulo','Bloque de catalogo','Rastreo de datos','Control de consistencia','Registro de origen','Resumen de normalizacion','Inventario semantico','Mapa de identificacion','Hoja de analisis','Modulo de validacion')
$nextActions = @(
  'Verificar foto final del producto antes de publicacion.',
  'Completar datos tecnicos finos en ficha manual si aplica.',
  'Corroborar compatibilidad con equipos destino del cliente.',
  'Alinear etiqueta comercial con rubro y subrubro definitivo.',
  'Revisar stock visible y estado de publicacion en panel admin.',
  'Validar que la imagen corresponda al modelo realmente ofrecido.',
  'Homologar nomenclatura con la lista interna de proveedores.',
  'Confirmar condiciones de garantia y soporte para este item.',
  'Chequear consistencia entre titulo, foto y descripcion corta.',
  'Actualizar palabras clave para mejorar busqueda en catalogo.',
  'Verificar precio y margen antes de habilitar venta publica.',
  'Marcar prioridad de revision tecnica segun rotacion de stock.'
)

function GetSeed([string]$code, [string]$text) {
  $raw = "$code|$text"
  return [math]::Abs($raw.GetHashCode())
}

function Pick([object[]]$arr, [int]$seed, [int]$salt) {
  return $arr[($seed + $salt) % $arr.Count]
}

function BuildUniqueBrief([string]$code,[string]$type,[string]$brand,[string]$model,[string[]]$signals,[string]$original) {
  $seed = GetSeed $code $original
  $o = Pick $openers $seed 3
  $vA = Pick $verbsA $seed 7
  $vB = Pick $verbsB $seed 11
  $d1 = Pick $domains $seed 17
  $d2 = Pick $domains $seed 23
  $out = Pick $outcomes $seed 29
  $sig = if ($signals.Count -gt 0) { ($signals | Select-Object -First ((($seed % 3) + 1))) -join '|' } else { 'sin-senal' }

  $variants = @(
    "[P-$code] ${o}: $type $brand $model $vA el $d1 y $vB el $d2 $out. Firma=$sig.",
    "[P-$code] $type $brand $model en clave de ${d1}: $vA procesos y $vB tareas de $d2, $out. Firma=$sig.",
    "[P-$code] Lectura util de ${type}: $vA la operativa diaria, $vB escenarios de $d1 y $d2 $out. Firma=$sig.",
    "[P-$code] Enfoque para ${d2}: $type $brand $model $vA experiencia de uso y $vB continuidad de $d1 $out. Firma=$sig."
  )

  return $variants[$seed % $variants.Count]
}

function BuildUniqueNotes([string]$code,[string]$name,[string]$type,[string]$brand,[string]$model,[string]$original,[string[]]$signals) {
  $seed = GetSeed $code $original
  $nb = Pick $noteBlocks $seed 5
  $na = Pick $nextActions $seed 9
  $sig = if ($signals.Count -gt 0) { ($signals -join ',') } else { 'sin indicadores tecnicos explicitos en el titulo base' }

  $v1 = @(
    "[P-$code] $nb",
    "item=$name",
    "tipo=$type ; marca=$brand ; modelo=$model",
    "origen=$original",
    "senales=$sig",
    "accion=$na"
  ) -join "`n"

  $v2 = @(
    "[P-$code] bloque=$nb",
    "nombre_normalizado=$name",
    "metadata: marca=$brand | modelo=$model | tipo=$type",
    "fuente=$original",
    "senales_detectadas=$sig",
    "paso_siguiente=$na"
  ) -join "`n"

  $v3 = @(
    "[P-$code] modulo=$nb",
    "referencia=$name",
    "traza_origen=$original",
    "parametros=> tipo:$type ; marca:$brand ; modelo:$model",
    "vector_tecnico=$sig",
    "recomendacion_operativa=$na"
  ) -join "`n"

  $variants = @($v1,$v2,$v3)
  return $variants[$seed % $variants.Count]
}

$items = @()
foreach($r in $rows){
  $code = [string]$r.codigo
  $original = Clean([string]$r.descripcion)
  if([string]::IsNullOrWhiteSpace($original)){ $original = "Articulo $code" }

  $type = InferType $original
  $brand = InferBrand $original
  $model = InferModel $original $code
  $name = "$type $brand $model"
  $signals = DetectSignals $original

  $brief = BuildUniqueBrief $code $type $brand $model $signals $original
  $notes = BuildUniqueNotes $code $name $type $brand $model $original $signals

  $items += [PSCustomObject]@{
    codigo = $code
    descripcionAdicional = $brief
    anotaciones = $notes
  }
}

$outPath = 'c:\Users\notebook\Desktop\DM\DarioMartinez\docs\sql\2026-03-10_lote-ia_1238_descripciones_unicas_v3.sql'
$sql = New-Object System.Collections.Generic.List[string]
$sql.Add('-- Lote IA total v3 - descripcionAdicional y anotaciones fuertemente diferenciadas por producto') | Out-Null
$sql.Add('-- Fecha: 2026-03-10') | Out-Null
$sql.Add('-- Alcance: 1238 articulos') | Out-Null
$sql.Add('-- Campos: descripcionAdicional, anotaciones') | Out-Null
$sql.Add('') | Out-Null
$sql.Add('START TRANSACTION;') | Out-Null
$sql.Add('') | Out-Null

$codes = ($items | Select-Object -ExpandProperty codigo | ForEach-Object { "'$(EscSql $_)'" }) -join ','
$sql.Add('CREATE TABLE IF NOT EXISTS backup_articulos_lote_20260310_ia_total_v3 AS') | Out-Null
$sql.Add("SELECT * FROM articulos WHERE codigo IN ($codes);") | Out-Null
$sql.Add('') | Out-Null

$idx = 0
foreach($it in $items){
  $idx++
  if((($idx - 1) % 20) -eq 0){
    $batch = [int](($idx - 1) / 20) + 1
    $sql.Add("-- ===== Batch $batch =====") | Out-Null
  }
  $sql.Add("-- codigo $(EscSql $it.codigo)") | Out-Null
  $sql.Add('UPDATE articulos') | Out-Null
  $sql.Add('SET') | Out-Null
  $sql.Add("  descripcionAdicional = '$(EscSql $it.descripcionAdicional)',") | Out-Null
  $sql.Add("  anotaciones = '$(EscSql $it.anotaciones)'") | Out-Null
  $sql.Add("WHERE codigo = '$(EscSql $it.codigo)';") | Out-Null
  $sql.Add('') | Out-Null
}

$sql.Add("SELECT codigo, descripcion, descripcionAdicional, anotaciones FROM articulos WHERE codigo IN ($codes);") | Out-Null
$sql.Add('COMMIT;') | Out-Null
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outPath, ($sql -join "`r`n"), $enc)

[PSCustomObject]@{
  output = $outPath
  total = $items.Count
  sample = @($items | Select-Object -First 6)
} | ConvertTo-Json -Depth 5
