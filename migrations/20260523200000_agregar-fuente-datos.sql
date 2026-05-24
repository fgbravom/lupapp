ALTER TABLE productos ADD COLUMN IF NOT EXISTS fuente_datos TEXT;

COMMENT ON COLUMN productos.fuente_datos IS 'Origen de los datos: openfoodfacts | foto | scraper_lider | scraper_jumbo';
