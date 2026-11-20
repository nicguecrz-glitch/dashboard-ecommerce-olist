
import pandas as pd
import os

# Ruta de los archivos CSV
carpeta = "data/csv"

# Archivos que utilizaremos
archivos = [
    "olist_orders_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_order_payments_dataset.csv",
    "olist_products_dataset.csv",
    "olist_customers_dataset.csv",
    "olist_order_reviews_dataset.csv"
]

# Revisar cada archivo
for archivo in archivos:
    ruta = os.path.join(carpeta, archivo)

    print("\n" + "=" * 50)
    print("ARCHIVO:", archivo)

    try:
        df = pd.read_csv(ruta)

        print("Cantidad de registros:", len(df))
        print("Cantidad de columnas:", len(df.columns))

        print("\nColumnas:")
        print(df.columns.tolist())

        print("\nTipos de datos:")
        print(df.dtypes)

        print("\nValores faltantes:")
        print(df.isnull().sum())

    except Exception as error:
        print("Error al leer el archivo:", error)
