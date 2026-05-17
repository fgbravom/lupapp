-- Tabla principal de productos escaneados por la comunidad
CREATE TABLE IF NOT EXISTS productos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre               TEXT NOT NULL,
  marca                TEXT,
  codigo_barras        TEXT UNIQUE,
  elaborado_por        TEXT,
  registro_sanitario   TEXT,
  ingredientes         TEXT[] NOT NULL DEFAULT '{}',
  tabla_nutricional    JSONB NOT NULL DEFAULT '{}',
  nota_cl              NUMERIC(3,1) NOT NULL CHECK (nota_cl >= 1.0 AND nota_cl <= 7.0),
  sellos_cl            TEXT[] NOT NULL DEFAULT '{}',
  aditivos             JSONB NOT NULL DEFAULT '[]',
  comparativa_eu       JSONB NOT NULL DEFAULT '{}',
  veces_escaneado      INTEGER NOT NULL DEFAULT 1,
  imagen_url           TEXT,
  creado_en            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search en nombre (español)
CREATE INDEX IF NOT EXISTS idx_productos_nombre
  ON productos USING GIN (to_tsvector('spanish', nombre));

-- Búsqueda por marca
CREATE INDEX IF NOT EXISTS idx_productos_marca
  ON productos (marca);

-- Búsqueda por código de barras
CREATE INDEX IF NOT EXISTS idx_productos_barcode
  ON productos (codigo_barras)
  WHERE codigo_barras IS NOT NULL;

-- Ordenar por más escaneados
CREATE INDEX IF NOT EXISTS idx_productos_escaneos
  ON productos (veces_escaneado DESC);

-- Función para incrementar contador de escaneos de forma atómica
CREATE OR REPLACE FUNCTION incrementar_escaneos(producto_id UUID)
RETURNS VOID AS $$
  UPDATE productos
  SET veces_escaneado = veces_escaneado + 1,
      actualizado_en  = NOW()
  WHERE id = producto_id;
$$ LANGUAGE SQL;

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();
