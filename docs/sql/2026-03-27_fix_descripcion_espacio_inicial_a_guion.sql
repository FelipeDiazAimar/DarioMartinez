-- Reemplaza espacios iniciales en descripcion por un guion medio
-- Ejemplo: ' Producto X' -> '-Producto X'

START TRANSACTION;

-- 1) Previsualizar filas afectadas
SELECT codigo, descripcion
FROM articulos
WHERE descripcion LIKE ' %';

-- 2) Aplicar correccion
UPDATE articulos
SET descripcion = CONCAT('-', LTRIM(descripcion))
WHERE descripcion LIKE ' %';

-- 3) Verificar resultado
SELECT codigo, descripcion
FROM articulos
WHERE descripcion LIKE '-%';

COMMIT;
