//Pedido
export interface Order {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  order_approved_at: string | null;
  order_delivered_carrier_date: string | null;
  order_delivered_customer_date: string | null;
  order_estimated_delivery_date: string | null;
}

//Cliente
export interface Customer {
  customer_id: string;
  customer_unique_id: string;
  customer_zip_code_prefix: string;
  customer_city: string;
  customer_state: string;
}

//Producto
export interface Product {
  product_id: string;
  product_category_name: string | null;
  product_name_lenght: number | null;
  product_description_lenght: number | null;
  product_photos_qty: number | null;
  product_weight_g: number | null;
  product_length_cm: number | null;
  product_height_cm: number | null;
  product_width_cm: number | null;
}



export interface Payment {
  order_id: string;
  payment_sequential: number;
  payment_type: string;
  payment_installments: number;
  payment_value: number;
}

export interface OrderItem {
  order_id: string;
  order_item_id: number;
  product_id: string;
  seller_id: string;
  shipping_limit_date: string;
  price: number;
  freight_value: number;
}

export interface Review {
  review_id: string;
  order_id: string;
  review_score: number;
  review_comment_title: string | null;
  review_comment_message: string | null;
  review_creation_date: string;
  review_answer_timestamp: string | null;
}
