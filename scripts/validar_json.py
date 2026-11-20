
import json
import os
from datetime import datetime

carpeta = "data/json"

# Cantidad de registros esperada
registros_esperados = {
    "olist_orders.json": 99441,
    "olist_order_items.json": 112650,
    "olist_order_payments.json": 103886,
    "olist_products.json": 32951,
    "olist_customers.json": 99441,
    "olist_order_reviews.json": 99224
}

# Variables temporales
fechas = [
    "order_purchase_timestamp",
    "order_approved_at",
    "order_delivered_carrier_date",
    "order_delivered_customer_date",
    "order_estimated_delivery_date",
    "shipping_limit_date",
    "review_creation_date",
    "review_answer_timestamp"
]

# Variables que deben ser numéricas
numericas = [
    "price",
    "freight_value",
    "payment_value",
    "payment_installments",
    "product_weight_g",
    "product_photos_qty",
    "review_score"
]

total = 0

for archivo, cantidad_esperada in registros_esperados.items():

    ruta = os.path.join(carpeta, archivo)

    print("\n" + "=" * 50)
    print("VALIDANDO:", archivo)

    try:
        with open(ruta, "r", encoding="utf-8") as f:
            datos = json.load(f)

        # Validar estructura
        if not isinstance(datos, list):
            raise ValueError("La estructura no es una lista JSON.")

        if not all(isinstance(registro, dict) for registro in datos):
            raise ValueError("Hay registros con estructura incorrecta.")

        # Validar cantidad de registros
        cantidad = len(datos)

        if cantidad != cantidad_esperada:
            raise ValueError("La cantidad de registros no coincide.")

        print("Estructura JSON: Correcta")
        print("Cantidad de registros:", cantidad)
        print("Cantidad esperada:", cantidad_esperada)

        # Validar tipos de datos
        errores = []

        for registro in datos:

            for columna in fechas:

                valor = registro.get(columna)

                if valor is not None:
                    if not isinstance(valor, str):
                        errores.append(columna)
                    else:
                        try:
                            datetime.fromisoformat(valor)
                        except ValueError:
                            errores.append(columna)

            for columna in numericas:

                if columna in registro:
                    valor = registro[columna]

                    if valor is not None and (
                        isinstance(valor, bool) or
                        not isinstance(valor, (int, float))
                    ):
                        errores.append(columna)

        if errores:
            print("Errores de tipos:", set(errores))
        else:
            print("Tipos de datos: Correctos")

        total += cantidad

    except Exception as error:
        print("ERROR:", error)

print("\n" + "=" * 50)
print("TOTAL DE REGISTROS:", total)
print("VALIDACIÓN FINALIZADA")
