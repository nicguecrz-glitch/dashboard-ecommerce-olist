
import pandas as pd
import os

carpeta = "data/csv"

archivos = [
    "olist_orders_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_order_payments_dataset.csv",
    "olist_products_dataset.csv",
    "olist_customers_dataset.csv",
    "olist_order_reviews_dataset.csv"
]

for archivo in archivos:

    ruta = os.path.join(carpeta, archivo)
    df = pd.read_csv(ruta)

    print("\n" + "=" * 50)
    print("ARCHIVO:", archivo)

    # Revisar registros duplicados
    duplicados = df.duplicated().sum()
    print("Registros duplicados:", duplicados)

    # Revisar espacios en blanco
    print("\nColumnas con espacios al inicio o final:")

    for columna in df.columns:

        if pd.api.types.is_string_dtype(df[columna]):

            espacios = (
                df[columna].notna() &
                df[columna].str.strip().ne(df[columna])
            ).sum()

            if espacios > 0:
                print(columna, ":", espacios)

    # Revisar cadenas vacías
    print("\nCadenas vacías:")

    for columna in df.columns:

        if pd.api.types.is_string_dtype(df[columna]):

            vacios = (
                df[columna].notna() &
                df[columna].str.strip().eq("")
            ).sum()

            if vacios > 0:
                print(columna, ":", vacios)
