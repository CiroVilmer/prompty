# 📊 MELI Sneakers Dataset - Reporte de Recolección
**Fecha:** 2026-04-12 23:13
**Hackathon:** Anthropic / Kaszek / Digital House

## Resumen
- **Categorías exploradas:** 1
- **Productos recolectados:** 20
- **Categorías con trends:** 1
- **Categorías con atributos:** 1
- **Ejemplos en dataset DSPy:** 20

## Categorías
| ID | Nombre | Items |
|----|--------|-------|
| MLA109027 | Zapatillas | 513739 |

## Top Productos por Quality Score
| Score | Marca | Modelo | Color | Fotos |
|-------|-------|--------|-------|-------|
| 1.000 | adidas | Astrastar | Negro | 10 |
| 1.000 | adidas | NKR68 | Gris | 8 |
| 1.000 | adidas | Response | Rojo | 10 |
| 1.000 | adidas | Runfalcon 5 | Verde | 9 |
| 1.000 | adidas | Runblaze | Rojo | 9 |
| 1.000 | adidas | Coreracer | Negro | 10 |
| 1.000 | adidas | OOC27 | Blanco | 10 |
| 1.000 | adidas | NKX12 | Negro | 10 |
| 1.000 | adidas | Adizero | Negro | 10 |
| 1.000 | adidas | Grand Court | Marrón | 10 |

## Keywords Trending

### Zapatillas (MLA109027)
- zapatillas deportivas
- zapatillas adidas hombres
- zapatillas padel
- zapatilla mujer
- zapatillas running
- zapatilla adidas
- zapatillas running hombre
- zapatillas niños
- zapatillas urbanas hombre
- zapatillas niña

## Estructura del Dataset
Cada ejemplo contiene:
- **input**: nombre, marca, modelo, color, género, tipo, atributos, fotos, keywords trending
- **output**: título del catálogo, descripción, quality score, posición en highlights
- **metadata**: domain_id, status, timestamp

## Archivos Generados
```
dataset_zapatillas/
├── 01_categorias_zapatillas.json  # Categorías descubiertas
├── 02_highlights_raw.json         # Best sellers por categoría  
├── 02_product_ids.json            # IDs de productos a recolectar
├── 03_products_detail.json        # Detalle completo de productos
├── 04_trends.json                 # Keywords populares
├── 05_category_attributes.json    # Atributos requeridos
├── 06_dspy_dataset.json           # Dataset final para DSPy
├── 06_dspy_dataset_quick.json     # Versión reducida quick-start
└── 07_reporte.md                  # Este reporte
```

## Próximos Pasos
1. Revisar `06_dspy_dataset.json` y validar calidad
2. Crear ejemplos de "listings malos" (simulados o de sellers amateurs)
3. Definir métricas para DSPy: completitud, SEO, claridad
4. Entrenar pipeline con MIPROv2: Auditor → Investigador → Gen texto → Gen imagen
