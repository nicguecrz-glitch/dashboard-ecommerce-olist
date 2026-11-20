
import pandas as pd
import os

# Carpetas de origen y destino
carpeta_csv = "data/csv"
carpeta_json = "data/json"

os.makedirs(carpeta_json, exist_ok=True)

# Archivos que vamos a transformar
archivos = [
    "olist_orders_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_order_payments_dataset.csv",
    "olist_products_dataset.csv",
    "olist_customers_dataset.csv",
    "olist_order_reviews_dataset.csv"
]

# Variables temporales
fechas = {
    "olist_orders_dataset.csv": [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date"
    ],

    "olist_order_items_dataset.csv": [
        "shipping_limit_date"
    ],

    "olist_order_reviews_dataset.csv": [
        "review_creation_date",
        "review_answer_timestamp"
    ]
}

# Variables numéricas
numericas = {
    "olist_order_items_dataset.csv": {
        "order_item_id": "Int64",
        "price": "float64",
        "freight_value": "float64"
    },

    "olist_order_payments_dataset.csv": {
        "payment_sequential": "Int64",
        "payment_installments": "Int64",
        "payment_value": "float64"
    },

    "olist_products_dataset.csv": {
        "product_name_lenght": "float64",
        "product_description_lenght": "float64",
        "product_photos_qty": "Int64",
        "product_weight_g": "float64",
        "product_length_cm": "float64",
        "product_height_cm": "float64",
        "product_width_cm": "float64"
    },

    "olist_order_reviews_dataset.csv": {
        "review_score": "Int64"
    }
}

# Procesar los archivos
for archivo in archivos:

    print("\nProcesando:", archivo)

    ruta_csv = os.path.join(carpeta_csv, archivo)

    # Conservar el código postal como texto
    opciones = {}
    if archivo == "olist_customers_dataset.csv":
        opciones["dtype"] = {
            "customer_zip_code_prefix": "string"
        }

    # Leer CSV
    df = pd.read_csv(ruta_csv, **opciones)

    # Eliminar espacios innecesarios
    for columna in df.select_dtypes(
        include=["object", "string"]
    ).columns:

        df[columna] = df[columna].str.strip()

        # Convertir cadenas vacías en valores faltantes
        df[columna] = df[columna].replace("", pd.NA)

    # Convertir fechas
    for columna in fechas.get(archivo, []):

        df[columna] = pd.to_datetime(
            df[columna],
            errors="coerce"
        )

    # Convertir variables numéricas
    for columna, tipo in numericas.get(archivo, {}).items():

        df[columna] = pd.to_numeric(
            df[columna],
            errors="coerce"
        ).astype(tipo)

    # Nombre del archivo JSON
    nombre_json = archivo.replace(
        "_dataset.csv", ".json"
    )

    ruta_json = os.path.join(
        carpeta_json, nombre_json
    )

    # Exportar a JSON
    df.to_json(
        ruta_json,
        orient="records",
        force_ascii=False,
        date_format="iso",
        date_unit="s",
        indent=2
    )

    print("JSON generado:", ruta_json)
    print("Registros convertidos:", len(df))

print("\nTransformación finalizada.")
